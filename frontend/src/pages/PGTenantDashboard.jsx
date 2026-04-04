import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatPanel from '../components/ChatPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
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

const OWNER_PROPERTIES_PREFIX = 'flatmate_pg_owner_properties_';
const PG_PROPERTIES_UPDATED_EVENT = 'pg-properties-updated';
const PG_BOOKING_NOTIFICATIONS_EVENT = 'pg-booking-notifications-updated';
const getPGOwnerNotificationsKey = (ownerRef) => `flatmate_pg_booking_notifications_${ownerRef || 'unknown'}`;
const PG_TENANT_RESPONSE_PREFIX = 'flatmate_pg_tenant_booking_updates_';
const getPGTenantResponseNotificationsKey = (tenantRef) => `flatmate_pg_tenant_booking_updates_${tenantRef || 'guest'}`;
const getPGTenantPopupSeenKey = (tenantRef) => `flatmate_seen_pg_tenant_popups_${tenantRef || 'guest'}`;

const normalizeTenantProperty = (property) => ({
  ...property,
  id: property.id || Date.now(),
  name: property.name || 'Untitled Property',
  city: property.city || '',
  locality: property.locality || '',
  rent: Number(property.rent) || 0,
  ownerPhone: property.ownerPhone || 'Not available',
  ownerName: property.ownerName || 'Owner',
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
      : [],
  })) : [],
});

const loadOwnerCreatedProperties = () => {
  try {
    const properties = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key || !key.startsWith(OWNER_PROPERTIES_PREFIX)) continue;

      const rawValue = localStorage.getItem(key) || '[]';
      const stored = JSON.parse(rawValue);

      if (Array.isArray(stored)) {
        const normalizedProperties = stored.map(normalizeTenantProperty);
        localStorage.setItem(key, JSON.stringify(normalizedProperties));
        properties.push(...normalizedProperties);
      }
    }

    return properties;
  } catch (error) {
    console.error('Error loading PG owner properties:', error);
    return [];
  }
};

const loadTenantBookingResponses = (user) => {
  if (!user) return [];

  try {
    const candidateRefs = [
      user.id,
      user._id,
      user.email,
      user.name,
    ].filter(Boolean);

    const updates = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(PG_TENANT_RESPONSE_PREFIX)) continue;

      const belongsToUser = candidateRefs.some((ref) => key === getPGTenantResponseNotificationsKey(ref));
      if (!belongsToUser) continue;

      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(stored)) {
        updates.push(...stored);
      }
    }

    return updates.sort((a, b) => new Date(b.respondedAt || 0) - new Date(a.respondedAt || 0));
  } catch (error) {
    console.error('Error loading PG tenant booking updates:', error);
    return [];
  }
};

const PGTenantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookingRequest, setBookingRequest] = useState(null); // { flat, bed, index }
  const [bookSuccess, setBookSuccess] = useState(null); // bedId of successful mock booking
  const [properties, setProperties] = useState([]);
  const [tenantBookingResponses, setTenantBookingResponses] = useState([]);
  const [latestTenantBookingResponse, setLatestTenantBookingResponse] = useState(null);
  const [chatConversations, setChatConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [chatMessageInput, setChatMessageInput] = useState('');

  useEffect(() => {
    const syncProperties = () => {
      const ownerProperties = loadOwnerCreatedProperties();
      setProperties(ownerProperties);
    };

    syncProperties();
    window.addEventListener('storage', syncProperties);
    window.addEventListener(PG_PROPERTIES_UPDATED_EVENT, syncProperties);

    return () => {
      window.removeEventListener('storage', syncProperties);
      window.removeEventListener(PG_PROPERTIES_UPDATED_EVENT, syncProperties);
    };
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const syncTenantResponses = () => {
      try {
        const updates = loadTenantBookingResponses(user);
        const popupSeenRef = user.id || user._id || user.email || user.name;
        const seenPopups = new Set(
          JSON.parse(localStorage.getItem(getPGTenantPopupSeenKey(popupSeenRef)) || '[]')
        );

        setTenantBookingResponses(updates);
        const nextUnseen = updates.find((update) => !seenPopups.has(update.id)) || null;
        setLatestTenantBookingResponse(nextUnseen);

        if (nextUnseen) {
          localStorage.setItem(
            getPGTenantPopupSeenKey(popupSeenRef),
            JSON.stringify([...seenPopups, nextUnseen.id])
          );
        }
      } catch (responseError) {
        console.error('Error loading PG tenant booking updates:', responseError);
      }
    };

    syncTenantResponses();
    window.addEventListener('storage', syncTenantResponses);
    window.addEventListener(PG_BOOKING_NOTIFICATIONS_EVENT, syncTenantResponses);

    return () => {
      window.removeEventListener('storage', syncTenantResponses);
      window.removeEventListener(PG_BOOKING_NOTIFICATIONS_EVENT, syncTenantResponses);
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

  const filteredProperties = properties.filter(p => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return true;

    const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);
    const searchText = [
      p.name,
      p.city,
      p.locality,
      p.ownerName,
      p.ownerPhone,
      `${p.locality} ${p.city}`,
      `${p.city} ${p.locality}`,
      `₹${p.rent}`,
      String(p.rent),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchTerms.every((term) => searchText.includes(term));
  });
  const pendingTenantResponseCount = tenantBookingResponses.filter((update) => update.status === 'accepted' || update.status === 'rejected').length;
  const unreadChatCount = chatConversations.reduce((count, conversation) => count + (conversation.unreadCount || 0), 0);

  const handleOpenChat = (property) => {
    if (!user || !property) return;

    const conversation = openPGConversation({
      property: {
        id: property.id,
        name: property.name,
        location: `${property.locality}, ${property.city}`,
      },
      owner: {
        ref: property.ownerId || property.ownerEmail || property.ownerPhone,
        name: property.ownerName || 'Owner',
        email: property.ownerEmail || '',
      },
      tenant: {
        ref: getUserChatRef(user),
        name: user.name || 'Tenant',
        email: user.email || '',
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

  const confirmBookSeat = () => {
    if(!bookingRequest || !selectedProperty) return;

    const ownerRef = selectedProperty.ownerId || selectedProperty.ownerEmail || selectedProperty.ownerPhone;
    const newNotification = {
      id: `pg-booking-${Date.now()}`,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      propertyLocation: `${selectedProperty.locality}, ${selectedProperty.city}`,
      flatId: bookingRequest.flat.id,
      flatNumber: bookingRequest.flat.flatNumber,
      bedId: bookingRequest.bed.id,
      bedNumber: bookingRequest.index,
      tenantName: user?.name || 'Tenant',
      tenantId: user?.id || user?._id || '',
      tenantEmail: user?.email || '',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    try {
      const existingNotifications = JSON.parse(localStorage.getItem(getPGOwnerNotificationsKey(ownerRef)) || '[]');
      localStorage.setItem(
        getPGOwnerNotificationsKey(ownerRef),
        JSON.stringify([newNotification, ...existingNotifications])
      );
      window.dispatchEvent(new Event(PG_BOOKING_NOTIFICATIONS_EVENT));
    } catch (error) {
      console.error('Error saving PG booking notification:', error);
    }

    setBookSuccess(bookingRequest.bed.id);
    setBookingRequest(null);
    setTimeout(() => {
      setBookSuccess(null);
    }, 4000);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 md:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 flex-shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link to="/pg" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight block">
            PG Finder
          </Link>
          <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded">TENANT</span>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="space-y-2 mb-5">
            <button
              type="button"
              onClick={() => setActiveView('properties')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeView === 'properties' ? 'bg-purple-50 text-purple-700 border border-purple-100 font-semibold' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              PG Properties
            </button>
            <button
              type="button"
              onClick={() => setActiveView('notifications')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeView === 'notifications' ? 'bg-amber-50 text-amber-700 border border-amber-100 font-semibold' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <span>Notifications</span>
              {pendingTenantResponseCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                  {pendingTenantResponseCount}
                </span>
              )}
            </button>
            <button
              type="button"
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
          </div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Search Location</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Katraj, Wakad..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProperty(null); // Reset selection on search
                setActiveView('properties');
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Results ({filteredProperties.length})</h3>
          {filteredProperties.map(p => (
            <button 
              key={p.id}
              onClick={() => {
                setSelectedProperty(p);
                setActiveView('properties');
              }}
              className={`w-full text-left p-4 rounded-xl transition-all border ${selectedProperty?.id === p.id ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-sm'}`}
            >
              <h4 className="font-bold text-dark-900">{p.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{p.locality}, {p.city}</p>
              {p.ownerName && (
                <p className="text-xs text-gray-600 mb-2">
                  Owner: <span className="font-semibold text-dark-800">{p.ownerName}</span>
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-purple-600">₹{p.rent}/mo</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">Available</span>
              </div>
            </button>
          ))}
          {filteredProperties.length === 0 && (
            <div className="text-center p-4 text-gray-400 text-sm">
              No PG properties found.
            </div>
          )}
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
          tenantBookingResponses.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {tenantBookingResponses.map((update) => (
                <div
                  key={update.id}
                  className={`bg-white p-6 rounded-2xl shadow-sm border ${
                    update.status === 'accepted' ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-3 ${
                        update.status === 'accepted'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {update.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </div>
                      <p className="text-lg font-semibold text-dark-900">
                        {update.ownerName} responded to your request for {update.propertyName}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{update.propertyLocation}</p>
                      <p className="text-sm text-gray-500">
                        Bed {update.bedNumber} in Flat {update.flatNumber}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(update.respondedAt).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2.5 rounded-xl font-semibold ${
                      update.status === 'accepted'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          const matchedProperty = properties.find((property) => property.id === update.propertyId);
                          if (matchedProperty) {
                            handleOpenChat(matchedProperty);
                          }
                        }}
                        className="text-left"
                      >
                        {update.status === 'accepted' ? 'Accepted • Open Chat' : 'Rejected • Open Chat'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <div className="w-24 h-24 bg-amber-50 text-amber-200 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-dark-900 mb-2">No Notifications Yet</h2>
              <p className="text-gray-500 max-w-sm">Accepted or rejected PG booking responses will appear here.</p>
            </div>
          )
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
          <div className="max-w-6xl mx-auto pb-20">
            <header className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-dark-900 mb-2">{selectedProperty.name}</h1>
                  <p className="text-gray-500 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {selectedProperty.locality}, {selectedProperty.city}
                  </p>
                  {selectedProperty.ownerName && (
                    <p className="text-sm text-gray-600 mt-3">
                      Listed by <span className="font-semibold text-dark-900">{selectedProperty.ownerName}</span>
                    </p>
                  )}
                </div>
                
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-800 uppercase">Contact Owner</p>
                    <p className="font-bold text-dark-900 text-lg">{selectedProperty.ownerPhone}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => handleOpenChat(selectedProperty)}
                  className="px-5 py-3 rounded-xl font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Chat
                </button>
              </div>
            </header>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark-900 mb-4">Property Gallery</h2>
              <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4">
                {selectedProperty.images && selectedProperty.images.map((img, i) => (
                  <img key={i} src={img} alt="Property Room" className="w-64 h-40 object-cover rounded-2xl shadow-sm border border-gray-100 flex-shrink-0" />
                ))}
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark-900 mb-1">Select Your Bed</h2>
                <p className="text-gray-500 text-sm">Click any available green bed to instantly send a request.</p>
              </div>
              <div className="flex gap-4 text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <span className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded mr-2"></div> Available</span>
                <span className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded mr-2"></div> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {selectedProperty.flats.map(flat => (
                <div key={flat.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-lg text-dark-900">Flat {flat.flatNumber}</h3>
                  </div>
                  
                  {/* Bed Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {flat.beds.map((bed, idx) => (
                      <div key={bed.id} className="relative group">
                        <button
                          disabled={bed.isBooked}
                          onClick={() => setBookingRequest({ flat, bed, index: idx + 1 })}
                          className={`
                            w-full relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all 
                            ${bed.isBooked 
                              ? 'bg-red-50 border-red-200 opacity-70 cursor-not-allowed' 
                              : 'bg-green-50 border-green-200 hover:border-green-400 hover:shadow-glow cursor-pointer'}
                          `}
                        >
                          <svg className={`w-6 h-6 mb-1 ${bed.isBooked ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                          <span className={`text-xs font-bold ${bed.isBooked ? 'text-red-700' : 'text-green-700'}`}>
                            B{idx + 1}
                          </span>
                        </button>
                        
                        {/* Hover Tooltip - Simulated Members View */}
                        {!bed.isBooked && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-dark-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                            <p className="font-bold mb-1 border-b border-dark-700 pb-1">Flat {flat.flatNumber} Details</p>
                            <p className="text-gray-300 mb-1">Total Rent: ₹{selectedProperty.rent}/mo</p>
                            <p className="text-gray-300">Click to instantly notify the owner you want this bed!</p>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-900 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Booking Success Toast */}
            {bookSuccess && (
              <div className="fixed bottom-10 right-10 bg-dark-900 text-white p-6 rounded-2xl shadow-2xl z-50 animate-bounce max-w-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Request Sent!</h4>
                    <p className="text-gray-300 text-sm">We've notified the owner at <span className="text-white font-semibold">{selectedProperty.ownerPhone}</span>. They will call you shortly to confirm your seat!</p>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div className="w-24 h-24 bg-purple-50 text-purple-200 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Search for a PG</h2>
            <p className="text-gray-500 max-w-sm">Use the sidebar to search real PG properties created by owners and select one to view its live bed layout.</p>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {bookingRequest && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 transform transition-all scale-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Confirm Booking Request</h2>
            <p className="text-gray-500 mb-6 font-medium">
              You are about to request <strong className="text-dark-900">Bed {bookingRequest.index}</strong> in <strong className="text-dark-900">Flat {bookingRequest.flat.flatNumber}</strong> at {selectedProperty.name}.
            </p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full mb-8 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Rent</span>
                <span className="font-bold text-dark-900">₹{selectedProperty.rent}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deposit</span>
                <span className="font-bold text-dark-900">₹{selectedProperty.rent * 2}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                <span className="font-bold text-dark-900">Total payable to owner</span>
                <span className="font-bold text-primary-600 text-lg">₹{selectedProperty.rent * 3}</span>
              </div>
            </div>
            
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setBookingRequest(null)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBookSeat}
                className="flex-1 py-3 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 hover:shadow-glow transition-all"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

      {latestTenantBookingResponse && (
        <div className="fixed bottom-10 left-10 bg-white p-6 rounded-2xl shadow-2xl z-50 max-w-sm border border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                latestTenantBookingResponse.status === 'accepted' ? 'text-green-600' : 'text-red-500'
              }`}>
                PG Booking Update
              </p>
              <h4 className="font-bold text-lg text-dark-900 mb-1">
                {latestTenantBookingResponse.status === 'accepted' ? 'Request Accepted' : 'Request Rejected'}
              </h4>
              <p className="text-sm text-gray-600">
                {latestTenantBookingResponse.ownerName} responded for {latestTenantBookingResponse.propertyName}.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Bed {latestTenantBookingResponse.bedNumber} in Flat {latestTenantBookingResponse.flatNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLatestTenantBookingResponse(null)}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PGTenantDashboard;
