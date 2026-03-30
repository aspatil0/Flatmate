import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ChatPanel from '../components/ChatPanel';
import PostCard from '../components/PostCard';
import PostDetailsModal from '../components/PostDetailsModal';
import AddPostModal from '../components/AddPostModal';
import { useAuth } from '../context/AuthContext.jsx';
import { chatAPI, postsAPI, uploadAPI } from '../lib/api.js';
import { allPosts as getLocalPosts, createPost as createLocalPost, updatePost as updateLocalPost } from '../lib/db.js';

// Images
import flat1 from '../assets/flat1.png';
import flat2 from '../assets/flat2.png';

const getBookingNotificationStorageKey = (userId) => `flatmate_seen_booking_notifications_${userId || 'guest'}`;
const FLAT_BOOKING_STATUS_EVENT = 'flat-booking-status-updated';
const getFlatBookingResponseStorageKey = (userRef) => `flatmate_flat_booking_updates_${userRef || 'guest'}`;
const getFlatResponsePopupSeenKey = (userRef) => `flatmate_seen_flat_response_popups_${userRef || 'guest'}`;

const parseLocation = (location = '') => {
  const [firstPart = '', ...rest] = location.split(',').map(part => part.trim()).filter(Boolean);

  if (rest.length === 0) {
    return {
      locality: firstPart || '',
      city: firstPart || '',
    };
  }

  return {
    locality: rest.join(', '),
    city: firstPart,
  };
};

const normalizePost = (post, fallbackPostedBy = 'User') => {
  const { city, locality } = parseLocation(post.location || '');
  const normalizedImages = Array.isArray(post.images) && post.images.length > 0
    ? post.images
    : [flat1, flat2];

  return {
    ...post,
    id: post.id || post._id,
    ownerId: post.ownerId || post.owner?._id || post.owner?.id || '',
    ownerEmail: post.ownerEmail || post.owner?.email || '',
    images: normalizedImages,
    society: post.society || post.title || 'Untitled Listing',
    city: post.city || city || 'Unknown City',
    locality: post.locality || locality || '',
    area: post.area || post.bhkSize || 'N/A',
    postedBy: post.postedBy || post.owner?.name || fallbackPostedBy,
    contactNumber: post.contactNumber || post.owner?.phone || '',
    totalRent: post.totalRent || post.rent || 0,
    deposit: post.deposit || 0,
    tenantType: post.tenantType || 'Anyone',
    smokerAllowed: typeof post.smokerAllowed === 'boolean' ? post.smokerAllowed : false,
    drinkerAllowed: typeof post.drinkerAllowed === 'boolean' ? post.drinkerAllowed : false,
  };
};

const dedupePosts = (items) => {
  const seen = new Set();

  return items.filter((post) => {
    const key = post.id || post._id;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getRequestNotificationId = (postId, request) =>
  `${postId}-${request.tenantEmail || request.tenantId || request.tenantName}-${request.requestedAt}`;

const isMongoId = (value = '') => /^[a-f\d]{24}$/i.test(String(value));
const LOCAL_POSTS_STORAGE_KEY = 'flatmate_posts';
const isDataUrl = (value = '') => typeof value === 'string' && value.startsWith('data:');

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingMessage, setBookingMessage] = useState(null); // { type: 'success'|'error', text: '...' }
  const [ownerBookingRequests, setOwnerBookingRequests] = useState([]);
  const [latestOwnerNotification, setLatestOwnerNotification] = useState(null);
  const [tenantBookingResponses, setTenantBookingResponses] = useState([]);
  const [latestTenantResponse, setLatestTenantResponse] = useState(null);
  const [loginSuccessPopup, setLoginSuccessPopup] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  
  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Set a timeout to fetch API
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), 3000)
        );
        
        const response = await Promise.race([postsAPI.getPosts(), timeoutPromise]);
        // Backend returns { posts: [...], pagination: {...} }
        let postsArray = response.posts || response;
        const localPosts = getLocalPosts();
        
        // If no posts from backend, use fake data for demonstration
        if (!postsArray || postsArray.length === 0) {
          postsArray = [...localPosts, ...fakeFlatsData];
        } else {
          postsArray = [...localPosts, ...postsArray];
        }
        
        // Transform backend data to match component expectations
        const transformedPosts = dedupePosts(postsArray.map(post => normalizePost(post)));
        setPosts(transformedPosts);
      } catch (err) {
        console.log('Using fake data - API error or timeout:', err.message);
        const localPosts = getLocalPosts();
        // Always use fake data on error
        const transformedPosts = dedupePosts([...localPosts, ...fakeFlatsData].map(post => normalizePost(post)));
        setPosts(transformedPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (!token || !user) return undefined;

    const fetchOwnerNotifications = async () => {
      try {
        const requests = await postsAPI.getBookingRequests(token);
        setOwnerBookingRequests(requests);

        const seenNotifications = new Set(
          JSON.parse(localStorage.getItem(getBookingNotificationStorageKey(user.id || user._id || user.email)) || '[]')
        );

        const pendingRequests = requests.flatMap((propertyGroup) =>
          (propertyGroup.requests || [])
            .filter((request) => request.status === 'pending')
            .map((request) => ({
              id: getRequestNotificationId(propertyGroup.postId, request),
              postTitle: propertyGroup.postTitle,
              postLocation: propertyGroup.postLocation,
              ...request,
            }))
        );

        const unseenNotification = pendingRequests.find((request) => !seenNotifications.has(request.id));

        if (unseenNotification) {
          setLatestOwnerNotification(unseenNotification);
          localStorage.setItem(
            getBookingNotificationStorageKey(user.id || user._id || user.email),
            JSON.stringify([...seenNotifications, unseenNotification.id])
          );
        }
      } catch (err) {
        console.error('Error fetching owner booking notifications:', err);
      }
    };

    fetchOwnerNotifications();
    const intervalId = setInterval(fetchOwnerNotifications, 10000);

    return () => clearInterval(intervalId);
  }, [token, user]);

  useEffect(() => {
    if (!user) return undefined;

    const syncTenantBookingResponses = () => {
      try {
        const updates = JSON.parse(
          localStorage.getItem(getFlatBookingResponseStorageKey(user.id || user._id || user.email)) || '[]'
        ).sort((a, b) => new Date(b.respondedAt || 0) - new Date(a.respondedAt || 0));

        const seenPopups = new Set(
          JSON.parse(localStorage.getItem(getFlatResponsePopupSeenKey(user.id || user._id || user.email)) || '[]')
        );

        setTenantBookingResponses(updates);
        const nextUnseen = updates.find((update) => !seenPopups.has(update.id)) || null;
        setLatestTenantResponse(nextUnseen);

        if (nextUnseen) {
          localStorage.setItem(
            getFlatResponsePopupSeenKey(user.id || user._id || user.email),
            JSON.stringify([...seenPopups, nextUnseen.id])
          );
        }
      } catch (responseError) {
        console.error('Error loading flat booking responses:', responseError);
      }
    };

    syncTenantBookingResponses();
    window.addEventListener('storage', syncTenantBookingResponses);
    window.addEventListener(FLAT_BOOKING_STATUS_EVENT, syncTenantBookingResponses);

    return () => {
      window.removeEventListener('storage', syncTenantBookingResponses);
      window.removeEventListener(FLAT_BOOKING_STATUS_EVENT, syncTenantBookingResponses);
    };
  }, [user]);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setLoginSuccessPopup(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!token) return undefined;

    let isMounted = true;

    const loadConversations = async () => {
      try {
        const response = await chatAPI.getConversations(token);
        const nextConversations = response.conversations || [];

        if (!isMounted) {
          return;
        }

        setConversations(nextConversations);
        setSelectedConversation((currentConversation) => {
          if (!currentConversation) {
            return nextConversations[0] || null;
          }

          return nextConversations.find((item) => item.id === currentConversation.id) || currentConversation;
        });
      } catch (chatLoadError) {
        console.error('Error loading conversations:', chatLoadError);
      }
    };

    loadConversations();
    const intervalId = setInterval(loadConversations, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      return undefined;
    }

    let isMounted = true;

    const syncLocalPostsToBackend = async () => {
      const localPosts = getLocalPosts();
      const pendingLocalPosts = localPosts.filter((post) => !isMongoId(post.id));

      if (pendingLocalPosts.length === 0) {
        return;
      }

      const syncedLocalIds = [];
      const createdPosts = [];

      for (const post of pendingLocalPosts) {
        try {
          const response = await postsAPI.createPost(
            {
              title: post.title || post.society || 'Untitled Listing',
              description: post.description || '',
              location: post.location || [post.city, post.locality].filter(Boolean).join(', '),
              rent: Number(post.rent || post.totalRent || 0),
              contactNumber: post.contactNumber || '',
              deposit: Number(post.deposit || 0),
              roomType: post.roomType || '1BHK',
              bhkSize: post.bhkSize || post.area || '',
              availableFrom: post.availableFrom || new Date().toISOString(),
              images: Array.isArray(post.images) ? post.images : [],
              amenities: Array.isArray(post.amenities) ? post.amenities : [],
              tenantType: post.tenantType || 'Anyone',
              smokerAllowed: Boolean(post.smokerAllowed),
              drinkerAllowed: Boolean(post.drinkerAllowed),
            },
            token
          );

          syncedLocalIds.push(post.id);
          createdPosts.push(normalizePost(response.post || response, user?.name || 'You'));
        } catch (syncError) {
          console.error('Error syncing local post to backend:', syncError);
        }
      }

      if (!isMounted || syncedLocalIds.length === 0) {
        return;
      }

      const remainingLocalPosts = getLocalPosts().filter((post) => !syncedLocalIds.includes(post.id));
      localStorage.setItem(LOCAL_POSTS_STORAGE_KEY, JSON.stringify(remainingLocalPosts));
      setPosts((prevPosts) => dedupePosts([
        ...createdPosts,
        ...prevPosts.filter((post) => !syncedLocalIds.includes(post.id)),
      ]));
      setError(null);
    };

    syncLocalPostsToBackend();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  useEffect(() => {
    if (!token || !selectedConversation?.id) {
      setConversationMessages([]);
      return undefined;
    }

    let isMounted = true;

    const loadMessages = async () => {
      try {
        setIsChatLoading(true);
        const response = await chatAPI.getMessages(selectedConversation.id, token);

        if (!isMounted) {
          return;
        }

        setConversationMessages(response.messages || []);
      } catch (messageError) {
        console.error('Error loading chat messages:', messageError);
      } finally {
        if (isMounted) {
          setIsChatLoading(false);
        }
      }
    };

    loadMessages();
    const intervalId = setInterval(loadMessages, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedConversation?.id, token]);

  const isPostOwner = (post) => {
    const userRefs = [user?.id, user?._id, user?.email, user?.name].filter(Boolean);
    const postRefs = [post.ownerId, post.ownerEmail, post.postedBy, post.owner?.email, post.owner?.name].filter(Boolean);
    return postRefs.some(ref => userRefs.includes(ref));
  };

  const canChatForPost = (post) => {
    if (!token || !post || isPostOwner(post)) {
      return false;
    }

    return isMongoId(post.id) && Boolean(post.ownerId || post.ownerEmail || post.owner?._id || post.owner?.email);
  };

  const filteredPosts = posts.filter(post => {
    // If search query is empty, show all posts
    if (!searchQuery || searchQuery.trim() === '') {
      return true;
    }
    
    const query = searchQuery.toLowerCase();
    const cityMatch = post.city ? post.city.toLowerCase().includes(query) : false;
    const localityMatch = post.locality ? post.locality.toLowerCase().includes(query) : false;
    const societyMatch = post.society ? post.society.toLowerCase().includes(query) : false;
    return cityMatch || localityMatch || societyMatch;
  });

  const myFlatPosts = filteredPosts.filter(post => isPostOwner(post));

  const favoritePosts = favorites
    .map(favoriteId => posts.find(post => post.id === favoriteId))
    .filter(Boolean);

  const allOwnerNotifications = ownerBookingRequests.flatMap((propertyGroup) =>
    (propertyGroup.requests || [])
      .map((request, index) => ({
        id: getRequestNotificationId(propertyGroup.postId, request),
        postId: propertyGroup.postId,
        bookingRequestIndex: index,
        postTitle: propertyGroup.postTitle,
        postLocation: propertyGroup.postLocation,
        ...request,
      }))
  ).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const pendingOwnerNotifications = allOwnerNotifications.filter((request) => request.status === 'pending');
  const unreadChatCount = conversations.reduce((count, conversation) => count + (conversation.unreadCount || 0), 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleFavorite = (post) => {
    setFavorites(prevFavorites => (
      prevFavorites.includes(post.id)
        ? prevFavorites.filter(id => id !== post.id)
        : [post.id, ...prevFavorites]
    ));
  };

  const prepareBackendPostPayload = async (postData) => {
    const {
      imageFiles = [],
      images = [],
      ...restPostData
    } = postData;

    const existingImageUrls = Array.isArray(images)
      ? images.filter((image) => typeof image === 'string' && !isDataUrl(image))
      : [];

    if (!imageFiles.length) {
      return {
        ...restPostData,
        images: existingImageUrls,
      };
    }

    const uploadedImages = await Promise.all(
      imageFiles.map(async (file) => {
        const response = await uploadAPI.uploadImage(file, token);
        return response.imageUrl;
      })
    );

    return {
      ...restPostData,
      images: [...existingImageUrls, ...uploadedImages],
    };
  };

  const handleAddPost = async (newPostData) => {
    if (editingPost) {
      try {
        setError(null);
        const backendPayload = await prepareBackendPostPayload(newPostData);
        const response = await postsAPI.updatePost(editingPost.id, backendPayload, token);
        const updatedPost = normalizePost(response.post || response, user?.name || 'You');
        setPosts(prevPosts => prevPosts.map(post => post.id === editingPost.id ? updatedPost : post));
        setEditingPost(null);
        setIsAddingPost(false);
        return;
      } catch (err) {
        const localUpdatedPost = {
          ...editingPost,
          ...newPostData,
          id: editingPost.id,
          postedBy: editingPost.postedBy || user?.name || 'You',
        };
        updateLocalPost(localUpdatedPost);
        setPosts(prevPosts => prevPosts.map(post => post.id === editingPost.id ? normalizePost(localUpdatedPost, user?.name || 'You') : post));
        setEditingPost(null);
        setIsAddingPost(false);
        setError('Backend is not reachable right now. Your listing changes were saved locally.');
        console.error('Error updating post:', err);
        return;
      }
    }

    try {
      setError(null);
      const backendPayload = await prepareBackendPostPayload(newPostData);
      // Send to backend API
      const response = await postsAPI.createPost(backendPayload, token);
      const createdPost = response.post || response;
      // Transform response to match component expectations
      const transformedPost = normalizePost(createdPost, user?.name || 'You');
      setPosts(prevPosts => [transformedPost, ...prevPosts]);
      setIsAddingPost(false);
    } catch (err) {
      const localPost = {
        ...newPostData,
        id: `local-${Date.now()}`,
        postedBy: user?.name || 'You',
      };
      createLocalPost(localPost);
      const transformedPost = normalizePost(localPost, user?.name || 'You');
      setPosts(prevPosts => [transformedPost, ...prevPosts]);
      setIsAddingPost(false);
      const errorText = String(err?.message || '').toLowerCase();
      const isNetworkError =
        errorText.includes('failed to fetch') ||
        errorText.includes('networkerror') ||
        errorText.includes('load failed') ||
        errorText.includes('timeout');

      setError(
        isNetworkError
          ? 'Backend is not reachable right now. Your listing was saved locally and is shown in the Flats section.'
          : `Post could not be saved to backend: ${err?.message || 'Unknown error'}. Your listing was saved locally instead.`
      );
      console.error('Error creating post:', err);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsAddingPost(true);
  };

  const handleDeletePost = async (post) => {
    const shouldDelete = window.confirm(`Delete "${post.society}"?`);
    if (!shouldDelete) return;

    try {
      await postsAPI.deletePost(post.id, token);
    } catch (err) {
      console.error('Error deleting post from backend:', err);
    }

    const localPosts = getLocalPosts().filter(item => item.id !== post.id);
    localStorage.setItem('flatmate_posts', JSON.stringify(localPosts));
    setPosts(prevPosts => prevPosts.filter(item => item.id !== post.id));
    setFavorites(prevFavorites => prevFavorites.filter(id => id !== post.id));
  };

  const handleBook = async (post) => {
    try {
      setBookingMessage(null);
      await postsAPI.createBookingRequest(post.id, token);
      setBookingMessage({
        type: 'success',
        text: `Booking request sent for "${post.title}" successfully!`
      });
      setTimeout(() => setBookingMessage(null), 3000);
    } catch (err) {
      setBookingMessage({
        type: 'error',
        text: err.message || 'Failed to send booking request'
      });
      console.error('Error booking:', err);
    }
  };

  const handleOpenConversation = async ({ postId, participantId = null, sourcePost = null }) => {
    if (!token) {
      setBookingMessage({
        type: 'error',
        text: 'Please log in before starting a chat.',
      });
      setTimeout(() => setBookingMessage(null), 3000);
      return;
    }

    if (sourcePost && !canChatForPost(sourcePost)) {
      setBookingMessage({
        type: 'error',
        text: 'Chat is available only for listings saved on the backend with a real owner account.',
      });
      setTimeout(() => setBookingMessage(null), 4000);
      return;
    }

    try {
      const response = await chatAPI.startConversation(
        participantId ? { postId, participantId } : { postId },
        token
      );

      const nextConversation = response.conversation;
      setActiveTab('chats');
      setSelectedConversation(nextConversation);
      setConversations((prevConversations) => {
        const remaining = prevConversations.filter((item) => item.id !== nextConversation.id);
        return [nextConversation, ...remaining];
      });

      const messageResponse = await chatAPI.getMessages(nextConversation.id, token);
      setConversationMessages(messageResponse.messages || []);
      setChatMessageInput('');
    } catch (chatStartError) {
      setBookingMessage({
        type: 'error',
        text: chatStartError.message || 'Unable to open chat right now',
      });
      setTimeout(() => setBookingMessage(null), 3000);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedConversation?.id || !chatMessageInput.trim()) {
      return;
    }

    const trimmedMessage = chatMessageInput.trim();

    try {
      const response = await chatAPI.sendMessage(selectedConversation.id, trimmedMessage, token);

      setConversationMessages((prevMessages) => [...prevMessages, response.chatMessage]);
      setConversations((prevConversations) => {
        const updated = response.conversation;
        const remaining = prevConversations.filter((item) => item.id !== updated.id);
        return [updated, ...remaining];
      });
      setSelectedConversation(response.conversation);
      setChatMessageInput('');
    } catch (sendError) {
      setBookingMessage({
        type: 'error',
        text: sendError.message || 'Unable to send message',
      });
      setTimeout(() => setBookingMessage(null), 3000);
    }
  };

  const handleOwnerBookingResponse = async (notification, status) => {
    try {
      await postsAPI.respondToBookingRequest(
        notification.postId,
        notification.bookingRequestIndex,
        status,
        token
      );

      setOwnerBookingRequests((prevRequests) =>
        prevRequests.map((propertyGroup) => {
          if (propertyGroup.postId !== notification.postId) return propertyGroup;

          return {
            ...propertyGroup,
            requests: propertyGroup.requests.map((request, index) =>
              index === notification.bookingRequestIndex
                ? { ...request, status }
                : request
            ),
          };
        })
      );

      if (latestOwnerNotification?.id === notification.id) {
        setLatestOwnerNotification(null);
      }

      if (notification.tenantEmail || notification.tenantId || notification.tenantName) {
        const recipientKey = getFlatBookingResponseStorageKey(
          notification.tenantId || notification.tenantEmail || notification.tenantName
        );
        const existingUpdates = JSON.parse(localStorage.getItem(recipientKey) || '[]');
        const responseUpdate = {
          id: `${notification.id}-${status}`,
          postId: notification.postId,
          postTitle: notification.postTitle,
          postLocation: notification.postLocation,
          status,
          respondedAt: new Date().toISOString(),
          ownerName: user?.name || 'Owner',
        };

        localStorage.setItem(
          recipientKey,
          JSON.stringify([
            responseUpdate,
            ...existingUpdates.filter((item) => item.id !== responseUpdate.id),
          ])
        );
        window.dispatchEvent(new Event(FLAT_BOOKING_STATUS_EVENT));
      }

      setBookingMessage({
        type: 'success',
        text: `Booking request ${status} for "${notification.postTitle}".`
      });
      setTimeout(() => setBookingMessage(null), 3000);
    } catch (err) {
      setBookingMessage({
        type: 'error',
        text: err.message || `Failed to ${status} booking request`
      });
      console.error(`Error trying to ${status} booking request:`, err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 md:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight">
            Flatmate
          </Link>
        </div>
        
        {/* User Profile Summary */}
        <div className="p-6 border-b border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-dark-900 truncate">{user?.name || 'User'}</h3>
            <p className="text-xs text-gray-500 truncate mb-1">Email: {user?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"></path></svg>
            <span>Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('feed')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'feed' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span>Flats </span>
          </button>
          <button 
            onClick={() => setActiveTab('my-flats')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'my-flats' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A3 3 0 016 17h12a3 3 0 01.879.804M9 12h6m-7 8h8a2 2 0 002-2V8.414a2 2 0 00-.586-1.414l-2.414-2.414A2 2 0 0013.586 4H8a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>My Flats</span>
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'favorites' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span>My Favorites</span>
          </button>
          <button 
            onClick={() => setActiveTab('chats')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'chats' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"></path></svg>
              <span>Chats</span>
            </span>
            {unreadChatCount > 0 && (
              <span className="min-w-6 h-6 px-2 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span>Notifications</span>
            </span>
            {pendingOwnerNotifications.length > 0 && (
              <span className="min-w-6 h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                {pendingOwnerNotifications.length}
              </span>
            )}
          </button>
          <div className="pt-8 pb-2">
            <button 
              onClick={() => setIsAddingPost(true)}
              className="w-full bg-dark-900 text-white font-medium py-3 rounded-xl shadow-soft hover:shadow-glow hover:bg-primary-600 transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add New Post
            </button>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 p-6 sm:p-10 relative">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2">
              {activeTab === 'feed'
                ? 'Find Your Flats'
                : activeTab === 'my-flats'
                  ? 'My Flats'
                : activeTab === 'chats'
                  ? 'Real-Time Chat'
                : activeTab === 'favorites'
                  ? 'Your Favorites'
                  : 'Booking Notifications'}
            </h1>
            <p className="text-gray-500">
              {activeTab === 'feed'
                ? 'Showing the latest premium flat listings available.'
                : activeTab === 'my-flats'
                  ? 'Listings you created will appear here.'
                : activeTab === 'chats'
                  ? 'Message owners and tenants live from your flat conversations.'
                : activeTab === 'favorites'
                  ? 'Flats you have marked as interested.'
                  : 'Review and respond to booking requests for your posts.'}
            </p>
          </div>
          {(activeTab === 'feed' || activeTab === 'my-flats') && (
            <div className="w-full md:w-auto relative">
              <input 
                type="text" 
                placeholder="Search city, area, keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          )}
        </header>

        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading flats...</p>
            </div>
          </div>
        )}

        {!loading && activeTab === 'feed' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onBook={handleBook}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(post.id)}
                  onInterested={(p) => setSelectedPost(p)}
                  canManage={isPostOwner(post)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onChat={canChatForPost(post) ? (p) => handleOpenConversation({ postId: p.id, sourcePost: p }) : null}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                <p className="text-lg font-medium text-dark-600">No flats found matching your search.</p>
                <p className="text-sm">Try adjusting your keywords.</p>
              </div>
            )}
          </div>
        ) : !loading && activeTab === 'my-flats' ? (
          myFlatPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myFlatPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onBook={handleBook}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(post.id)}
                  onInterested={(p) => setSelectedPost(p)}
                  canManage={isPostOwner(post)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-primary-50 text-primary-300 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m4-2a8 8 0 11-16 0 8 8 0 0116 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">No Flats Created Yet</h3>
              <p className="text-gray-500 max-w-sm">
                {searchQuery.trim()
                  ? 'No created flats matched your search. Try adjusting your keywords.'
                  : 'Your posted flat listings will appear here after you create them.'}
              </p>
              <button onClick={() => setIsAddingPost(true)} className="mt-8 px-6 py-2 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors">Add Your First Flat</button>
            </div>
          )
        ) : !loading && activeTab === 'chats' ? (
          <ChatPanel
            conversations={conversations}
            selectedConversation={selectedConversation}
            messages={conversationMessages}
            isLoadingMessages={isChatLoading}
            messageInput={chatMessageInput}
            onMessageInputChange={setChatMessageInput}
            onSelectConversation={setSelectedConversation}
            onSendMessage={handleSendMessage}
          />
        ) : !loading && activeTab === 'favorites' ? (
          favoritePosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoritePosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onBook={handleBook}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(post.id)}
                  onInterested={(p) => setSelectedPost(p)}
                  canManage={isPostOwner(post)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onChat={canChatForPost(post) ? (p) => handleOpenConversation({ postId: p.id, sourcePost: p }) : null}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-300 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">No Favorites Yet</h3>
              <p className="text-gray-500 max-w-sm">Click the heart on any flat card and it will appear here.</p>
              <button onClick={() => setActiveTab('feed')} className="mt-8 px-6 py-2 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors">Return to Feed</button>
            </div>
          )
        ) : !loading && activeTab === 'notifications' ? (
          (tenantBookingResponses.length > 0 || allOwnerNotifications.length > 0) ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {tenantBookingResponses.length > 0 && tenantBookingResponses.map((update) => (
                <div
                  key={update.id}
                  className={`bg-white p-6 rounded-2xl shadow-sm border ${
                    update.status === 'accepted'
                      ? 'border-green-200'
                      : 'border-red-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-3 ${
                          update.status === 'accepted'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}
                      >
                        {update.status === 'accepted' ? 'Your Request Was Accepted' : 'Your Request Was Rejected'}
                      </div>
                      <p className="text-lg font-semibold text-dark-900">
                        {update.ownerName} responded to your request for <span className="text-primary-700">{update.postTitle}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{update.postLocation}</p>
                      <p className="text-sm text-gray-500">{new Date(update.respondedAt).toLocaleString()}</p>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-xl font-semibold ${
                        update.status === 'accepted'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenConversation({ postId: update.postId })}
                        className="text-left"
                      >
                        {update.status === 'accepted' ? 'Accepted • Open Chat' : 'Rejected • Open Chat'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {allOwnerNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white p-6 rounded-2xl shadow-sm border ${
                    notification.status === 'accepted'
                      ? 'border-green-200'
                      : notification.status === 'rejected'
                        ? 'border-red-200'
                        : 'border-amber-100'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-3 ${
                          notification.status === 'accepted'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : notification.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        {notification.status === 'accepted'
                          ? 'Accepted'
                          : notification.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending Booking Request'}
                      </div>
                      <p className="text-lg font-semibold text-dark-900">
                        {notification.tenantName} requested <span className="text-primary-700">{notification.postTitle}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{notification.postLocation}</p>
                      <p className="text-sm text-gray-500">{new Date(notification.requestedAt).toLocaleString()}</p>
                      {notification.tenantEmail && (
                        <p className="text-sm text-gray-600 mt-2">Email: {notification.tenantEmail}</p>
                      )}
                      {notification.tenantPhone && (
                        <p className="text-sm text-gray-600">Phone: {notification.tenantPhone}</p>
                      )}
                    </div>
                    {notification.status === 'pending' ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenConversation({ postId: notification.postId, participantId: notification.tenantId })}
                          className="px-4 py-2.5 bg-white text-primary-600 font-semibold rounded-xl border border-primary-200 hover:bg-primary-50 transition-colors"
                        >
                          Open Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOwnerBookingResponse(notification, 'accepted')}
                          className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOwnerBookingResponse(notification, 'rejected')}
                          className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-2.5 rounded-xl font-semibold ${
                          notification.status === 'accepted'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenConversation({ postId: notification.postId, participantId: notification.tenantId })}
                          className="text-left"
                        >
                          {notification.status === 'accepted' ? 'Accepted • Open Chat' : 'Rejected • Open Chat'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-amber-50 text-amber-300 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">No Booking Notifications</h3>
              <p className="text-gray-500 max-w-sm">Booking requests for your posts and responses to your own requests will appear here.</p>
            </div>
          )
        ) : null}
      </main>

      {/* Modals */}
      {selectedPost && (
        <PostDetailsModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

      {isAddingPost && (
        <AddPostModal 
          onClose={() => {
            setIsAddingPost(false);
            setEditingPost(null);
          }}
          onAdd={handleAddPost}
          initialData={editingPost}
          submitLabel={editingPost ? 'Save Changes' : 'Publish Listing'}
        />
      )}

      {latestOwnerNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
          <div className="bg-white border border-amber-200 shadow-2xl rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-500 mb-1">New Booking</p>
                <h3 className="text-lg font-bold text-dark-900">Someone requested your post</h3>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">{latestOwnerNotification.tenantName}</span> requested
                  {' '}
                  <span className="font-semibold">{latestOwnerNotification.postTitle}</span>.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {latestOwnerNotification.postLocation} • {new Date(latestOwnerNotification.requestedAt).toLocaleString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOwnerBookingResponse(latestOwnerNotification, 'accepted')}
                    className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOwnerBookingResponse(latestOwnerNotification, 'rejected')}
                    className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLatestOwnerNotification(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {latestTenantResponse && activeTab !== 'notifications' && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full">
          <div className={`border shadow-2xl rounded-2xl p-5 bg-white ${
            latestTenantResponse.status === 'accepted' ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                  latestTenantResponse.status === 'accepted' ? 'text-green-600' : 'text-red-500'
                }`}>
                  Booking Update
                </p>
                <h3 className="text-lg font-bold text-dark-900">
                  {latestTenantResponse.status === 'accepted' ? 'Request Accepted' : 'Request Rejected'}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {latestTenantResponse.ownerName} responded to your request for{' '}
                  <span className="font-semibold">{latestTenantResponse.postTitle}</span>.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {latestTenantResponse.postLocation} • {new Date(latestTenantResponse.respondedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLatestTenantResponse(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {loginSuccessPopup && (
        <div className="fixed top-24 right-6 z-50 max-w-sm w-full">
          <div className="bg-white border border-green-200 shadow-2xl rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-green-600 mb-1">Welcome Back</p>
                <h3 className="text-lg font-bold text-dark-900">Login successful</h3>
                <p className="text-sm text-gray-600 mt-2">
                  You are now signed in as <span className="font-semibold">{user?.name || 'User'}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLoginSuccessPopup(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
          <div className={`border shadow-2xl rounded-2xl p-5 bg-white ${
            bookingMessage.type === 'success' ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                  bookingMessage.type === 'success' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {bookingMessage.type === 'success' ? 'Booking Sent' : 'Booking Error'}
                </p>
                <h3 className="text-lg font-bold text-dark-900">
                  {bookingMessage.type === 'success' ? 'Request updated' : 'Something went wrong'}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {bookingMessage.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingMessage(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
