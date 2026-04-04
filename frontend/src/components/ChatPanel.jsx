import React, { useEffect, useRef } from 'react';

const formatConversationTime = (value) => {
  if (!value) return '';

  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString();
};

const ChatPanel = ({
  conversations,
  selectedConversation,
  messages,
  isLoadingMessages,
  messageInput,
  onMessageInputChange,
  onSelectConversation,
  onSendMessage,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation?.id]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[70vh] grid grid-cols-1 lg:grid-cols-[340px_1fr]">
      <div className="border-r border-gray-100 bg-gray-50/50">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-dark-900">Chats</h2>
          <p className="text-sm text-gray-500 mt-1">Open a conversation from a flat card or booking request.</p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation)}
                className={`w-full text-left px-5 py-4 border-b border-gray-100 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-primary-50' : 'hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-dark-900 truncate">
                      {conversation.otherParticipant?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-primary-700 truncate mt-1">
                      {conversation.postTitle}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conversation.lastMessageText || 'No messages yet'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-[11px] text-gray-400">
                      {formatConversationTime(conversation.lastMessageAt)}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="min-w-6 h-6 px-2 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              No chats yet.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col min-h-[70vh]">
        {selectedConversation ? (
          <>
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-bold text-dark-900">
                {selectedConversation.otherParticipant?.name || 'Conversation'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedConversation.postTitle}
                {selectedConversation.postLocation ? ` • ${selectedConversation.postLocation}` : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/60 px-6 py-5 space-y-4">
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Loading messages...
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        message.isMine
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-dark-900 border border-gray-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={`text-[11px] mt-2 ${message.isMine ? 'text-primary-100' : 'text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500">
                  Send the first message in this conversation.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={onSendMessage}
              className="p-5 border-t border-gray-100 bg-white flex gap-3"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(event) => onMessageInputChange(event.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-10 bg-gray-50/60">
            <div>
              <div className="w-20 h-20 bg-primary-50 text-primary-300 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">Choose a Chat</h3>
              <p className="text-gray-500 max-w-md">
                Start from a flat card or a booking request, and your conversation will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
