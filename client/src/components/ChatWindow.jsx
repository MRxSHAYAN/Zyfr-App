import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, CheckCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageInput from './MessageInput';

const ChatWindow = ({ selectedUser, messages, onSendMessage, isTyping, onBack }) => {
  const { authUser } = useAuth();
  const { onlineUsers } = useSocket();
  const messagesEndRef = useRef(null);

  const isOnline = onlineUsers.includes(selectedUser?._id);

  // Auto-scroll to bottom whenever messages update or user starts typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="flex-1 h-full bg-[#0b141a] flex flex-col relative chat-pattern-bg">
      {/* Active Recipient Header */}
      <div className="h-16 bg-[#202c33] border-b border-[#222d34] px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          {/* Back button for mobile view */}
          <button
            onClick={onBack}
            className="md:hidden text-[#8696a0] hover:text-[#e9edef] p-1 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img
            src={selectedUser.avatar}
            alt={selectedUser.username}
            className="w-10 h-10 rounded-full object-cover bg-[#2a3942]"
          />

          <div>
            <h3 className="text-sm font-semibold text-[#e9edef]">
              {selectedUser.username}
            </h3>
            <p className="text-xs text-[#8696a0]">
              {isTyping ? (
                <span className="text-[#00a884] font-medium animate-pulse">typing...</span>
              ) : isOnline ? (
                <span className="text-[#00a884]">online</span>
              ) : (
                'offline'
              )}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-4 text-[#8696a0]">
          <Video className="w-5 h-5 cursor-not-allowed opacity-50" />
          <Phone className="w-5 h-5 cursor-not-allowed opacity-50" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-[#e9edef]" />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {/* End-to-end encryption notice banner */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#182229] border border-[#222d34] rounded-lg px-3 py-1.5 flex items-center space-x-2 text-[11px] text-[#8696a0]">
            <Lock className="w-3.5 h-3.5 text-[#00a884]" />
            <span>Messages are secured with end-to-end MongoDB storage & JWT auth</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-xs text-[#8696a0] my-8">
            No previous messages. Say hello to <span className="text-[#00a884]">{selectedUser.username}</span>!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === authUser._id || msg.senderId?._id === authUser._id;

            return (
              <div
                key={msg._id || index}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[65%] rounded-lg px-3 py-1.5 text-sm shadow-md relative group ${
                    isMe
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed pr-12">
                    {msg.message}
                  </p>

                  <div className="absolute bottom-1 right-2 flex items-center space-x-1 text-[10px] text-[#8696a0]">
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3.5 h-3.5 ${
                          msg.isRead ? 'text-[#53bdeb]' : 'text-[#8696a0]'
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Real-time typing bubble */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] text-[#8696a0] rounded-lg px-4 py-2 text-xs flex items-center space-x-1 animate-pulse">
              <span>{selectedUser.username} is typing</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Container */}
      <MessageInput recipientId={selectedUser._id} onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatWindow;
