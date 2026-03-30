import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatPanel from '../components/ChatPanel.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { uploadAPI } from '../lib/api';
import {
  getPGConversationMessages,
  getUserChatRef,
  loadPGChatSummaries,
  openPGConversation,
  PG_CHATS_UPDATED_EVENT,
  sendPGConversationMessage,
} from '../lib/pgChat.js';

import flat1 from '../assets/flat1.png';
import flat2 from '../assets/flat2.png';

const getOwnerPropertiesKey = (user) => `flatmate_pg_owner_properties_${user?.id || user?._id || user?.email || 'guest'}`;
const PG_PROPERTIES_UPDATED_EVENT = 'pg-properties-updated';
const PG_BOOKING_NOTIFICATIONS_EVENT = 'pg-booking-notifications-updated';
const STORAGE_IMAGE_FALLBACK = [flat1, flat2];
const getPGOwnerNotificationsKey = (user) => `flatmate_pg_booking_notifications_${user?.id || user?._id || user?.email || user?.phone || 'unknown'}`;
const getPGTenantResponseNotificationsKey = (tenantRef) => `flatmate_pg_tenant_booking_updates_${tenantRef || 'guest'}`;
const getPGOwnerPopupSeenKey = (user) => `flatmate_seen_pg_owner_popups_${user?.id || user?._id || user?.email || user?.phone || 'unknown'}`;

const normalizeProperty = (property, fallbackOwner = {}) => ({
  ...property,
  id: property.id || Date.now(),
  name: property.name || 'Untitled Property',
  city: property.city || '',
  locality: property.locality || '',
  rent: Number(property.rent) || 0,
  ownerPhone: property.ownerPhone || fallbackOwner.phone || '',
  ownerId: property.ownerId || fallbackOwner.id || fallbackOwner._id || fallbackOwner.email,
  ownerName: property.ownerName || fallbackOwner.name || 'Owner',
  ownerEmail: property.ownerEmail || fallbackOwner.email || '',
  images: Array.isArray(property.images) && property.images.length > 0 ? property.images : [flat1, flat2],
  flats: Array.isArray(property.flats) ? property.flats.map((flat, flatIndex) => ({
    ...flat,
    id: flat.id || `flat-${property.id || Date.now()}-${flatIndex}`,
    flatNumber: flat.flatNumber || 101 + flatIndex,
    beds: Array.isArray(flat.beds) && flat.beds.length > 0
      ? flat.beds.map((bed, bedIndex) => ({
          ...bed,
          id: bed.id || `bed-${property.id || Date.now()}-${flatIndex}-${bedIndex}`,
          isBooked: Boolean(bed.isBooked),
        }))
      : Array.from({ length: 3 }, (_, bedIndex) => ({
          id: `bed-${property.id || Date.now()}-${flatIndex}-${bedIndex}`,
          isBooked: false,
        })),
  })) : [],
});

const sanitizePropertyForStorage = (property) => ({
  ...property,
  // Fallback only when localStorage quota is exceeded.
  images: Array.isArray(property.images) && property.images.length > 0
    ? property.images.map((image) => (
        typeof image === 'string' && image.startsWith('data:') ? STORAGE_IMAGE_FALLBACK[0] : image
      ))
    : STORAGE_IMAGE_FALLBACK,
});

const persistOwnerProperties = (user, properties) => {
  if (!user) return { usedFallbackImages: false };

  try {
    localStorage.setItem(getOwnerPropertiesKey(user), JSON.stringify(properties));
    return { usedFallbackImages: false };
  } catch (storageError) {
    const safeProperties = properties.map(sanitizePropertyForStorage);
    localStorage.setItem(getOwnerPropertiesKey(user), JSON.stringify(safeProperties));
    return { usedFallbackImages: true };
  }
};

const loadOwnerProperties = (user) => {
  if (!user) return [];

  try {
    const stored = localStorage.getItem(getOwnerPropertiesKey(user));
    if (stored) {
      const parsed = JSON.parse(stored);
      const normalizedProperties = Array.isArray(parsed) ? parsed.map((property) => normalizeProperty(property, user)) : [];

      if (Array.isArray(parsed) && normalizedProperties.length > 0) {
        localStorage.setItem(getOwnerPropertiesKey(user), JSON.stringify(normalizedProperties));
      }

      return normalizedProperties;
    }
  } catch (error) {
    console.error('Error loading owner properties:', error);
    localStorage.removeItem(getOwnerPropertiesKey(user));
  }

  return [];
};

const PGOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeView, setActiveView] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [newPropertyData, setNewPropertyData] = useState({ name: '', city: '', locality: '', rent: '', ownerPhone: user?.phone || '', flatsCount: 10, bedsPerFlat: 3 });
  const [propertyImages, setPropertyImages] = useState([]);
  const [propertyImagePreviews, setPropertyImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [galleryMessage, setGalleryMessage] = useState('');
  const [isUploadingGalleryImages, setIsUploadingGalleryImages] = useState(false);
  const [pgNotifications, setPGNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const [chatConversations, setChatConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const propertyImageInputRef = useRef(null);

  useEffect(() => {
    const ownerProperties = loadOwnerProperties(user);

    setProperties(ownerProperties);
    setSelectedPropertyId(ownerProperties[0]?.id || null);
  }, [user]);

  useEffect(() => {
    if (!user || properties.length === 0) return;

    try {
      const { usedFallbackImages } = persistOwnerProperties(user, properties);
      if (usedFallbackImages) {
        setError('Some uploaded images were too large, so default images were saved after refresh.');
      }
    } catch (storageError) {
      console.error('Error saving owner properties:', storageError);
      setError('Property could not be saved with uploaded images. Try fewer/smaller images.');
    }
  }, [properties, user]);

  useEffect(() => {
    if (properties.length === 0) {
      setSelectedPropertyId(null);
      return;
    }

    if (!properties.some((property) => property.id === selectedPropertyId)) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  useEffect(() => {
    if (!user) return undefined;

    const syncNotifications = () => {
      try {
        const notifications = JSON.parse(localStorage.getItem(getPGOwnerNotificationsKey(user)) || '[]')
          .sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));
        const seenPopups = new Set(
          JSON.parse(localStorage.getItem(getPGOwnerPopupSeenKey(user)) || '[]')
        );

        setPGNotifications(notifications);
        const nextUnseen = notifications.find(
          (notification) => notification.status === 'pending' && !seenPopups.has(notification.id)
        ) || null;
        setLatestNotification(nextUnseen);

        if (nextUnseen) {
          localStorage.setItem(
            getPGOwnerPopupSeenKey(user),
            JSON.stringify([...seenPopups, nextUnseen.id])
          );
        }
      } catch (notificationError) {
        console.error('Error loading PG booking notifications:', notificationError);
      }
    };

    syncNotifications();
    window.addEventListener('storage', syncNotifications);
    window.addEventListener(PG_BOOKING_NOTIFICATIONS_EVENT, syncNotifications);

    return () => {
      window.removeEventListener('storage', syncNotifications);
      window.removeEventListener(PG_BOOKING_NOTIFICATIONS_EVENT, syncNotifications);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    const syncChats = () => {
      const nextConversations = loadPGChatSummaries(user);
      setChatConversations(nextConversations);
      setSelectedConversation((currentConversation) => {
        if (!currentConversation) {
          return nextConversations[0] || null;
        }

        return nextConversations.find((conversation) => conversation.id === currentConversation.id) || currentConversation;
      });
    };

    syncChats();
    window.addEventListener('storage', syncChats);
    window.addEventListener(PG_CHATS_UPDATED_EVENT, syncChats);

    return () => {
      window.removeEventListener('storage', syncChats);
      window.removeEventListener(PG_CHATS_UPDATED_EVENT, syncChats);
    };
  }, [user]);

  useEffect(() => {
    if (!selectedConversation || !user) {
      setConversationMessages([]);
      return;
    }

    setConversationMessages(getPGConversationMessages(selectedConversation.id, user));
  }, [selectedConversation, user]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const pendingNotificationsCount = pgNotifications.filter((notification) => notification.status === 'pending').length;
  const unreadChatCount = chatConversations.reduce((count, conversation) => count + (conversation.unreadCount || 0), 0);

  const resetPropertyForm = () => {
    setNewPropertyData({ name: '', city: '', locality: '', rent: '', ownerPhone: user?.phone || '', flatsCount: 10, bedsPerFlat: 3 });
    setPropertyImages([]);
    setPropertyImagePreviews([]);
    setEditingPropertyId(null);
    setError('');
  };

  const openAddPropertyModal = () => {
    resetPropertyForm();
    setIsAddingProperty(true);
  };

  const openEditPropertyModal = () => {
    if (!selectedProperty) return;

    setEditingPropertyId(selectedProperty.id);
    setNewPropertyData({
      name: selectedProperty.name || '',
      city: selectedProperty.city || '',
      locality: selectedProperty.locality || '',
      rent: selectedProperty.rent || '',
      ownerPhone: selectedProperty.ownerPhone || user?.phone || '',
      flatsCount: selectedProperty.flats?.length || 0,
      bedsPerFlat: selectedProperty.flats?.[0]?.beds?.length || 0,
    });
    setPropertyImages([]);
    setPropertyImagePreviews([]);
    setError('');
    setIsAddingProperty(true);
  };

  const closePropertyModal = () => {
    setIsAddingProperty(false);
    resetPropertyForm();
  };

  const handleOpenChat = ({ property, tenantName, tenantEmail, tenantId }) => {
    if (!user || !property) return;

    const conversation = openPGConversation({
      property: {
        id: property.id,
        name: property.name,
        location: `${property.locality}, ${property.city}`,
      },
      owner: {
        ref: getUserChatRef(user),
        name: user.name || property.ownerName || 'Owner',
        email: user.email || property.ownerEmail || '',
      },
      tenant: {
        ref: tenantId || tenantEmail || tenantName,
        name: tenantName || 'Tenant',
        email: tenantEmail || '',
      },
    });

    setActiveView('chats');
    setSelectedConversation(conversation);
    setConversationMessages(getPGConversationMessages(conversation.id, user));
    setChatMessageInput('');
  };

  const handleSendChatMessage = (event) => {
    event.preventDefault();

    if (!selectedConversation || !chatMessageInput.trim() || !user) {
      return;
    }

    const response = sendPGConversationMessage(selectedConversation.id, user, chatMessageInput.trim());
    setSelectedConversation(response.conversation);
    setConversationMessages((prevMessages) => [...prevMessages, response.chatMessage]);
    setChatMessageInput('');
    setChatConversations(loadPGChatSummaries(user));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPropertyData.name || !newPropertyData.city || !newPropertyData.locality || !newPropertyData.rent || !newPropertyData.ownerPhone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!editingPropertyId && propertyImages.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    let uploadedImages = propertyImagePreviews;
    const propertyBeingEdited = properties.find((property) => property.id === editingPropertyId);

    if (propertyImages.length > 0) {
      try {
        uploadedImages = await Promise.all(
          propertyImages.map(async (file) => {
            const response = await uploadAPI.uploadImage(file, token);
            return response.imageUrl;
          })
        );
      } catch (uploadError) {
        console.error('Error uploading PG property images:', uploadError);
        setError(uploadError.message || 'Image upload failed. Check Cloudinary backend setup.');
        return;
      }
    }

    const baseProperty = {
      id: editingPropertyId || Date.now(),
      name: newPropertyData.name,
      city: newPropertyData.city,
      locality: newPropertyData.locality,
      rent: Number(newPropertyData.rent),
      ownerPhone: newPropertyData.ownerPhone,
      images: uploadedImages.length > 0 ? uploadedImages : (propertyBeingEdited?.images || [flat1, flat2]),
      ownerId: user?.id || user?._id || user?.email,
      ownerName: user?.name || 'Owner',
      ownerEmail: user?.email || '',
    };

    const propertyPayload = editingPropertyId ? {
      ...baseProperty,
      flats: propertyBeingEdited?.flats || [],
    } : {
      ...baseProperty,
      flats: Array.from({ length: parseInt(newPropertyData.flatsCount) || 10 }, (_, f_idx) => ({
        id: `nf-${baseProperty.id}-${f_idx}`,
        flatNumber: 101 + f_idx,
        beds: Array.from({ length: parseInt(newPropertyData.bedsPerFlat) || 3 }, (_, b_idx) => ({
          id: `nb-${baseProperty.id}-${f_idx}-${b_idx}`,
          isBooked: false
        }))
      }))
    };

    const newProperty = normalizeProperty(propertyPayload, user);
    setProperties((prevProperties) => {
      const updatedProperties = editingPropertyId
        ? prevProperties.map((property) => (
            property.id === editingPropertyId ? newProperty : property
          ))
        : [newProperty, ...prevProperties];
      try {
        if (user) {
          const { usedFallbackImages } = persistOwnerProperties(user, updatedProperties);
          if (usedFallbackImages) {
            setError(`Property was ${editingPropertyId ? 'updated' : 'created'}, but some uploaded images were too large to keep after refresh.`);
          }
        }
      } catch (storageError) {
        console.error('Error saving property:', storageError);
        setError(`Property was ${editingPropertyId ? 'updated' : 'created'}, but uploaded images were too large to save permanently.`);
      }

      window.dispatchEvent(new Event(PG_PROPERTIES_UPDATED_EVENT));
      return updatedProperties;
    });
    setSelectedPropertyId(newProperty.id);
    closePropertyModal();
  };

  const toggleBedStatus = (flatId, bedId) => {
    setProperties(prev => prev.map(prop => {
      if (prop.id !== selectedPropertyId) return prop;
      
      const updatedFlats = prop.flats.map(flat => {
        if (flat.id !== flatId) return flat;
        const updatedBeds = flat.beds.map(bed => {
          if (bed.id !== bedId) return bed;
          return { ...bed, isBooked: !bed.isBooked };
        });
        return { ...flat, beds: updatedBeds };
      });
      
      return { ...prop, flats: updatedFlats };
    }));
  };

  const calculateStats = () => {
    if (!selectedProperty) return { total: 0, booked: 0, available: 0 };
    let total = 0, booked = 0;
    selectedProperty.flats.forEach(f => {
      f.beds.forEach(b => {
        total++;
        if (b.isBooked) booked++;
      });
    });
    return { total, booked, available: total - booked };
  };

  const stats = calculateStats();

  const handleNotificationResponse = (notificationId, status) => {
    try {
      const targetNotification = pgNotifications.find((notification) => notification.id === notificationId);
      const updatedNotifications = pgNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, status } : notification
      ).sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));

      if (status === 'accepted' && targetNotification) {
        setProperties((prevProperties) => {
          const updatedProperties = prevProperties.map((property) => {
            if (property.id !== targetNotification.propertyId) return property;

            return {
              ...property,
              flats: property.flats.map((flat) => {
                if (flat.id !== targetNotification.flatId) return flat;

                return {
                  ...flat,
                  beds: flat.beds.map((bed) => (
                    bed.id === targetNotification.bedId ? { ...bed, isBooked: true } : bed
                  )),
                };
              }),
            };
          });

          try {
            const { usedFallbackImages } = persistOwnerProperties(user, updatedProperties);
            if (usedFallbackImages) {
              setError('Bed status was saved, but some uploaded images were too large to keep after refresh.');
            }
          } catch (storageError) {
            console.error('Error saving booked PG bed state:', storageError);
          }

          window.dispatchEvent(new Event(PG_PROPERTIES_UPDATED_EVENT));
          return updatedProperties;
        });
      }

      setPGNotifications(updatedNotifications);
      localStorage.setItem(getPGOwnerNotificationsKey(user), JSON.stringify(updatedNotifications));

      if (targetNotification?.tenantEmail || targetNotification?.tenantId || targetNotification?.tenantName) {
        const tenantResponseKey = getPGTenantResponseNotificationsKey(
          targetNotification.tenantId || targetNotification.tenantEmail || targetNotification.tenantName
        );
        const existingTenantUpdates = JSON.parse(localStorage.getItem(tenantResponseKey) || '[]');
        const responseUpdate = {
          id: `${targetNotification.id}-${status}`,
          propertyId: targetNotification.propertyId,
          propertyName: targetNotification.propertyName,
          propertyLocation: targetNotification.propertyLocation,
          flatNumber: targetNotification.flatNumber,
          bedNumber: targetNotification.bedNumber,
          status,
          ownerName: user?.name || 'Owner',
          respondedAt: new Date().toISOString(),
        };

        localStorage.setItem(
          tenantResponseKey,
          JSON.stringify([
            responseUpdate,
            ...existingTenantUpdates.filter((update) => update.id !== responseUpdate.id),
          ])
        );
      }

      window.dispatchEvent(new Event(PG_BOOKING_NOTIFICATIONS_EVENT));
      setLatestNotification(updatedNotifications.find((notification) => notification.status === 'pending') || null);
    } catch (notificationError) {
      console.error('Error updating PG booking notification:', notificationError);
    }
  };

  const handleAddGalleryImages = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!selectedPropertyId || files.length === 0) return;

    setError('');
    setGalleryMessage('');
    setIsUploadingGalleryImages(true);

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const response = await uploadAPI.uploadImage(file, token);
          return response.imageUrl;
        })
      );

      setProperties((prevProperties) => {
        const updatedProperties = prevProperties.map((property) => (
          property.id === selectedPropertyId
            ? { ...property, images: [...(property.images || []), ...uploadedImages] }
            : property
        ));

        try {
          persistOwnerProperties(user, updatedProperties);
        } catch (storageError) {
          console.error('Error saving additional PG property images:', storageError);
          setError('Images were uploaded, but the property could not be updated locally.');
        }

        window.dispatchEvent(new Event(PG_PROPERTIES_UPDATED_EVENT));
        return updatedProperties;
      });
      setGalleryMessage(`${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} added successfully.`);
    } catch (uploadError) {
      console.error('Error uploading additional PG property images:', uploadError);
      setError(uploadError.message || 'Could not upload new property images.');
    } finally {
      setIsUploadingGalleryImages(false);
      event.target.value = '';
    }
  };

  const handleDeleteProperty = () => {
    if (!selectedProperty) return;

    const shouldDelete = window.confirm(`Delete "${selectedProperty.name}"? This will remove the property and its bed layout.`);
    if (!shouldDelete) return;

    setError('');
    setGalleryMessage('');

    setProperties((prevProperties) => {
      const updatedProperties = prevProperties.filter((property) => property.id !== selectedProperty.id);

      try {
        const { usedFallbackImages } = persistOwnerProperties(user, updatedProperties);
        if (usedFallbackImages) {
          setError('Property was deleted, but some remaining images were replaced with defaults after refresh.');
        }
      } catch (storageError) {
        console.error('Error deleting property:', storageError);
        setError('Property was removed from the page, but saving the updated list failed.');
      }

      window.dispatchEvent(new Event(PG_PROPERTIES_UPDATED_EVENT));
      return updatedProperties;
    });
  };

  return (
    <div className="flex relative h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 md:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 flex-shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link to="/pg" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight block">
            PG Manager
          </Link>
          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">OWNER</span>
        </div>

        <div className="p-6 border-b border-gray-100 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Properties</h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveView('properties')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeView === 'properties' ? 'bg-primary-50 text-primary-700 border border-primary-100 font-semibold' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              Property Management
            </button>
            <button
              onClick={() => setActiveView('notifications')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeView === 'notifications' ? 'bg-amber-50 text-amber-700 border border-amber-100 font-semibold' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <span>Booking Notifications</span>
              {pendingNotificationsCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                  {pendingNotificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('chats')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeView === 'chats' ? 'bg-primary-50 text-primary-700 border border-primary-100 font-semibold' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <span>Chats</span>
              {unreadChatCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>
            {properties.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${selectedPropertyId === p.id ? 'bg-primary-50 text-primary-700 border border-primary-100 font-semibold' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <div className="font-bold">{p.name}</div>
                <div className="text-xs opacity-70">{p.locality}, {p.city}</div>
              </button>
            ))}
            <button onClick={openAddPropertyModal} className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 font-medium hover:bg-gray-50 hover:text-primary-600 transition-colors flex items-center justify-center">
              + Add Property
            </button>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-100">
          <button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"></path></svg>
            <span>Home Page</span>
          </button>
          <button onClick={() => navigate('/pg')} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-6 sm:p-10 relative">
        {activeView === 'notifications' ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {pgNotifications.length > 0 ? pgNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white p-6 rounded-2xl shadow-sm border ${
                  notification.status === 'accepted'
                    ? 'border-green-200'
                    : notification.status === 'rejected'
                      ? 'border-red-200'
                      : 'border-amber-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-3 ${
                      notification.status === 'accepted'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : notification.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {notification.status === 'accepted' ? 'Accepted' : notification.status === 'rejected' ? 'Rejected' : 'Pending Request'}
                    </div>
                    <p className="text-lg font-semibold text-dark-900">
                      {notification.tenantName} requested Bed {notification.bedNumber} in Flat {notification.flatNumber}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{notification.propertyName}</p>
                    <p className="text-sm text-gray-500">{notification.propertyLocation}</p>
                    <p className="text-sm text-gray-500">{new Date(notification.requestedAt).toLocaleString()}</p>
                    {notification.tenantEmail && (
                      <p className="text-sm text-gray-600 mt-2">Email: {notification.tenantEmail}</p>
                    )}
                  </div>
                  {notification.status === 'pending' ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenChat({
                          property: properties.find((property) => property.id === notification.propertyId),
                          tenantName: notification.tenantName,
                          tenantEmail: notification.tenantEmail,
                          tenantId: notification.tenantId,
                        })}
                        className="px-4 py-2.5 bg-white text-primary-600 font-semibold rounded-xl border border-primary-200 hover:bg-primary-50 transition-colors"
                      >
                        Open Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNotificationResponse(notification.id, 'accepted')}
                        className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNotificationResponse(notification.id, 'rejected')}
                        className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className={`px-4 py-2.5 rounded-xl font-semibold ${
                      notification.status === 'accepted'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleOpenChat({
                          property: properties.find((property) => property.id === notification.propertyId),
                          tenantName: notification.tenantName,
                          tenantEmail: notification.tenantEmail,
                          tenantId: notification.tenantId,
                        })}
                        className="text-left"
                      >
                        {notification.status === 'accepted' ? 'Accepted • Open Chat' : 'Rejected • Open Chat'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-2xl border border-gray-100">
                <h3 className="text-2xl font-bold text-dark-900 mb-2">No PG Booking Notifications</h3>
                <p className="text-gray-500 max-w-sm">Tenant booking requests for your PG properties will appear here.</p>
              </div>
            )}
          </div>
        ) : activeView === 'chats' ? (
          <div className="max-w-6xl mx-auto">
            <ChatPanel
              conversations={chatConversations}
              selectedConversation={selectedConversation}
              messages={conversationMessages}
              isLoadingMessages={false}
              messageInput={chatMessageInput}
              onMessageInputChange={setChatMessageInput}
              onSelectConversation={(conversation) => {
                setSelectedConversation(conversation);
                setConversationMessages(getPGConversationMessages(conversation.id, user));
              }}
              onSendMessage={handleSendChatMessage}
            />
          </div>
        ) : selectedProperty ? (
          <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h1 className="text-3xl font-extrabold text-dark-900 mb-2">{selectedProperty.name}</h1>
                <p className="text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {selectedProperty.locality}, {selectedProperty.city}
                </p>
                <p className="text-sm text-gray-500 mt-2">Rent: ₹{selectedProperty.rent || 0}/mo</p>
                <p className="text-sm text-gray-500">Contact: {selectedProperty.ownerPhone || selectedProperty.ownerEmail || 'Not available'}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Managed by {selectedProperty.ownerName || user?.name || 'Owner'}
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={openEditPropertyModal}
                    className="px-5 py-3 rounded-xl font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Edit Property
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProperty}
                    className="px-5 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Delete Property
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-xl font-bold text-dark-900">{stats.total}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Total Beds</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="text-xl font-bold text-red-600">{stats.booked}</div>
                    <div className="text-xs font-semibold text-red-500 uppercase">Booked</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-xl font-bold text-green-600">{stats.available}</div>
                    <div className="text-xs font-semibold text-green-600 uppercase">Available</div>
                  </div>
                </div>
              </div>
            </header>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-dark-900 mb-3">Property Images</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}
              {galleryMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  {galleryMessage}
                </div>
              )}
              <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                {selectedProperty.images.map((img, i) => (
                  <img key={i} src={img} alt="Property" className="w-48 h-32 object-cover rounded-xl shadow-sm border border-gray-200" />
                ))}
                <button
                  type="button"
                  disabled={isUploadingGalleryImages}
                  onClick={() => propertyImageInputRef.current?.click()}
                  className={`w-48 h-32 flex-shrink-0 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
                    isUploadingGalleryImages
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-wait'
                      : 'border-gray-300 text-gray-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  <span className="text-sm font-medium">{isUploadingGalleryImages ? 'Uploading...' : 'Add Image'}</span>
                </button>
                <input
                  ref={propertyImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddGalleryImages}
                  className="hidden"
                />
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-900">Bed Allocation (RedBus Style)</h2>
              <div className="flex gap-4 text-sm font-medium">
                <span className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded mr-2"></div> Available</span>
                <span className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded mr-2"></div> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {selectedProperty.flats.map(flat => (
                <div key={flat.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-lg text-dark-900">Flat {flat.flatNumber}</h3>
                    <span className="text-xs font-bold text-gray-400">{flat.beds.length} Beds</span>
                  </div>
                  
                  {/* Bed Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {flat.beds.map((bed, idx) => (
                      <button
                        key={bed.id}
                        onClick={() => toggleBedStatus(flat.id, bed.id)}
                        className={`
                          relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all 
                          ${bed.isBooked 
                            ? 'bg-red-50 border-red-200 hover:border-red-400' 
                            : 'bg-green-50 border-green-200 hover:border-green-400 cursor-pointer'}
                        `}
                        title={bed.isBooked ? "Click to mark Available" : "Click to mark Booked"}
                      >
                        <svg className={`w-6 h-6 mb-1 ${bed.isBooked ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                        <span className={`text-xs font-bold ${bed.isBooked ? 'text-red-700' : 'text-green-700'}`}>
                          B{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a property to manage.
          </div>
        )}
      </main>

      {/* Add Property Modal */}
      {isAddingProperty && (
        <div className="fixed inset-0 bg-dark-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-dark-900">{editingPropertyId ? 'Edit PG Property' : 'Add New PG Property'}</h2>
              <button onClick={closePropertyModal} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-dark-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}
              <form id="add-prop-form" onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property Name *</label>
                  <input required placeholder="e.g., Sunrise PG" value={newPropertyData.name} onChange={e => setNewPropertyData({...newPropertyData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City *</label>
                    <input required placeholder="e.g., Pune" value={newPropertyData.city} onChange={e => setNewPropertyData({...newPropertyData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Locality *</label>
                    <input required placeholder="e.g., Wakad" value={newPropertyData.locality} onChange={e => setNewPropertyData({...newPropertyData, locality: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Rent Per Month *</label>
                    <input type="number" min="1" required placeholder="e.g., 6500" value={newPropertyData.rent} onChange={e => setNewPropertyData({...newPropertyData, rent: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Contact Number *</label>
                    <input required placeholder="e.g., +91 9876543210" value={newPropertyData.ownerPhone} onChange={e => setNewPropertyData({...newPropertyData, ownerPhone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Number of Flats</label>
                    <input type="number" min="1" required value={newPropertyData.flatsCount} onChange={e => setNewPropertyData({...newPropertyData, flatsCount: e.target.value})} disabled={Boolean(editingPropertyId)} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 ${editingPropertyId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Beds Per Flat</label>
                    <input type="number" min="1" max="10" required value={newPropertyData.bedsPerFlat} onChange={e => setNewPropertyData({...newPropertyData, bedsPerFlat: e.target.value})} disabled={Boolean(editingPropertyId)} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 ${editingPropertyId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} />
                  </div>
                </div>
                {editingPropertyId && (
                  <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm">
                    Flat count and beds per flat are locked during edit so current bed bookings stay intact.
                  </div>
                )}
                
                {/* Image Upload Component */}
                <ImageUpload 
                  onImagesChange={(files, previews) => {
                    setPropertyImages(files);
                    setPropertyImagePreviews(previews);
                  }}
                  maxImages={8}
                  required={!editingPropertyId}
                />
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end">
              <div className="flex space-x-3">
                <button type="button" onClick={closePropertyModal} className="px-5 py-2.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" form="add-prop-form" className="px-6 py-2.5 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 hover:shadow-glow transition-all">{editingPropertyId ? 'Save Changes' : 'Create Property'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {latestNotification && activeView !== 'notifications' && (
        <div className="fixed bottom-8 right-8 z-40 w-full max-w-md bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">New PG Booking Request</p>
            <h3 className="text-lg font-bold text-dark-900 mt-1">{latestNotification.tenantName} wants a bed</h3>
          </div>
          <div className="p-5 space-y-2">
            <p className="text-sm text-gray-700">
              Bed {latestNotification.bedNumber} in Flat {latestNotification.flatNumber}
            </p>
            <p className="text-sm text-gray-500">{latestNotification.propertyName}</p>
            <p className="text-sm text-gray-500">{latestNotification.propertyLocation}</p>
            <p className="text-xs text-gray-400">{new Date(latestNotification.requestedAt).toLocaleString()}</p>
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => handleNotificationResponse(latestNotification.id, 'accepted')}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => handleNotificationResponse(latestNotification.id, 'rejected')}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PGOwnerDashboard;
