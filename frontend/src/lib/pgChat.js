const PG_CHATS_KEY = 'flatmate_pg_chats';
export const PG_CHATS_UPDATED_EVENT = 'pg-chats-updated';

const safeRead = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PG_CHATS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading PG chats:', error);
    return [];
  }
};

const safeWrite = (chats) => {
  localStorage.setItem(PG_CHATS_KEY, JSON.stringify(chats));
  window.dispatchEvent(new Event(PG_CHATS_UPDATED_EVENT));
};

export const getUserChatRef = (user) => user?.id || user?._id || user?.email || user?.name || 'guest';

const toConversationSummary = (chat, currentUserRef) => {
  const otherParticipant = chat.ownerRef === currentUserRef
    ? {
        id: chat.tenantRef,
        name: chat.tenantName,
        email: chat.tenantEmail || '',
      }
    : {
        id: chat.ownerRef,
        name: chat.ownerName,
        email: chat.ownerEmail || '',
      };

  const unreadCount = (chat.messages || []).filter((message) => (
    message.senderRef !== currentUserRef &&
    (!Array.isArray(message.readBy) || !message.readBy.includes(currentUserRef))
  )).length;

  return {
    id: chat.id,
    postId: chat.propertyId,
    postTitle: chat.propertyName,
    postLocation: chat.propertyLocation,
    otherParticipant,
    lastMessageText: chat.lastMessageText || '',
    lastMessageAt: chat.lastMessageAt || chat.createdAt,
    unreadCount,
  };
};

export const loadPGChatSummaries = (user) => {
  const currentUserRef = getUserChatRef(user);

  return safeRead()
    .filter((chat) => chat.ownerRef === currentUserRef || chat.tenantRef === currentUserRef)
    .sort((a, b) => new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0))
    .map((chat) => toConversationSummary(chat, currentUserRef));
};

export const openPGConversation = ({ property, owner, tenant }) => {
  const chats = safeRead();
  const ownerRef = owner.ref;
  const tenantRef = tenant.ref;

  let conversation = chats.find((chat) => (
    chat.propertyId === property.id &&
    chat.ownerRef === ownerRef &&
    chat.tenantRef === tenantRef
  ));

  if (!conversation) {
    conversation = {
      id: `pg-chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      propertyId: property.id,
      propertyName: property.name,
      propertyLocation: property.location,
      ownerRef,
      ownerName: owner.name,
      ownerEmail: owner.email || '',
      tenantRef,
      tenantName: tenant.name,
      tenantEmail: tenant.email || '',
      messages: [],
      lastMessageText: '',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    safeWrite([conversation, ...chats]);
  }

  return toConversationSummary(conversation, ownerRef === tenantRef ? ownerRef : tenant.ref);
};

export const getPGConversationMessages = (conversationId, user) => {
  const currentUserRef = getUserChatRef(user);
  const chats = safeRead();
  const conversation = chats.find((chat) => chat.id === conversationId);

  if (!conversation) {
    return [];
  }

  let shouldWrite = false;
  const updatedMessages = (conversation.messages || []).map((message) => {
    const readBy = Array.isArray(message.readBy) ? message.readBy : [];
    if (message.senderRef !== currentUserRef && !readBy.includes(currentUserRef)) {
      shouldWrite = true;
      return { ...message, readBy: [...readBy, currentUserRef] };
    }
    return message;
  });

  if (shouldWrite) {
    const updatedChats = chats.map((chat) => (
      chat.id === conversationId ? { ...chat, messages: updatedMessages } : chat
    ));
    safeWrite(updatedChats);
  }

  return updatedMessages.map((message) => ({
    id: message.id,
    senderId: message.senderRef,
    text: message.text,
    createdAt: message.createdAt,
    isMine: message.senderRef === currentUserRef,
  }));
};

export const sendPGConversationMessage = (conversationId, user, text) => {
  const currentUserRef = getUserChatRef(user);
  const chats = safeRead();
  const createdAt = new Date().toISOString();
  let updatedSummary = null;

  const updatedChats = chats.map((chat) => {
    if (chat.id !== conversationId) {
      return chat;
    }

    const nextMessage = {
      id: `pg-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      senderRef: currentUserRef,
      text,
      createdAt,
      readBy: [currentUserRef],
    };

    const updatedChat = {
      ...chat,
      messages: [...(chat.messages || []), nextMessage],
      lastMessageText: text,
      lastMessageAt: createdAt,
    };

    updatedSummary = toConversationSummary(updatedChat, currentUserRef);
    return updatedChat;
  });

  safeWrite(updatedChats.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)));

  return {
    chatMessage: {
      id: `pg-msg-local-${Date.now()}`,
      senderId: currentUserRef,
      text,
      createdAt,
      isMine: true,
    },
    conversation: updatedSummary,
  };
};
