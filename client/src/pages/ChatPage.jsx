import React, { useState, useEffect } from 'react';
import { MessageSquare, Lock, ShieldCheck, Laptop } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const { authUser } = useAuth();
  const { socket } = useSocket();

  // 1. Fetch contact users on mount
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('[ChatPage] Error fetching user contacts:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Fetch conversation history when selecting a user
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedUser._id}`);
        setMessages(res.data);
        // Refresh users list to reset unread badge counter for this user
        fetchUsers();
      } catch (error) {
        console.error('[ChatPage] Error fetching message history:', error);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // 3. Socket event listeners for real-time messages & typing events
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming real-time messages
    const handleNewMessage = (newMessage) => {
      const isFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;

      if (isFromSelectedUser) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Refresh contact list preview & unread counts
      fetchUsers();
    };

    // Listen for typing events
    const handleUserTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(true);
      }
    };

    // Listen for stop typing events
    const handleUserStopTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
    };
  }, [socket, selectedUser]);

  // Handle message submission
  const handleSendMessage = async (messageText) => {
    if (!selectedUser) return;

    try {
      const res = await api.post(`/messages/send/${selectedUser._id}`, {
        message: messageText,
      });

      // Append to local message stream
      setMessages((prev) => [...prev, res.data]);

      // Update sidebar user order & previews
      fetchUsers();
    } catch (error) {
      console.error('[ChatPage] Error sending message:', error);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#090d16] flex items-center justify-center p-0 md:p-3">
      {/* Outer WhatsApp Web Window Container */}
      <div className="w-full h-full max-w-[1600px] bg-[#111b21] rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex border border-[#222d34]">
        {/* Sidebar Panel - visible on mobile if no user selected, always on desktop */}
        <div
          className={`${
            selectedUser ? 'hidden md:flex' : 'flex'
          } w-full md:w-auto h-full flex-shrink-0`}
        >
          <Sidebar
            users={users}
            selectedUser={selectedUser}
            onSelectUser={(user) => {
              setSelectedUser(user);
              setIsTyping(false);
            }}
            loading={loadingUsers}
          />
        </div>

        {/* Chat Window Panel */}
        <div
          className={`${
            !selectedUser ? 'hidden md:flex' : 'flex'
          } flex-1 h-full flex-col bg-[#0b141a]`}
        >
          {selectedUser ? (
            <ChatWindow
              selectedUser={selectedUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              onBack={() => setSelectedUser(null)}
            />
          ) : (
            /* WhatsApp Web Styled Empty State Placeholder */
            <div className="flex-1 h-full bg-[#111b21] border-l border-[#222d34] flex flex-col items-center justify-center p-8 text-center chat-pattern-bg">
              <div className="w-24 h-24 rounded-full bg-[#202c33] flex items-center justify-center mb-6 shadow-xl border border-[#222d34]">
                <MessageSquare className="w-12 h-12 text-[#00a884]" />
              </div>

              <h1 className="text-2xl font-light text-[#e9edef] mb-3">WhatsApp Web Clone</h1>

              <p className="text-sm text-[#8696a0] max-w-md leading-relaxed mb-8">
                Send and receive real-time messages without connecting your phone. Select a contact from the sidebar to start a secure conversation.
              </p>

              <div className="flex items-center space-x-2 text-xs text-[#8696a0] bg-[#182229] border border-[#222d34] px-4 py-2 rounded-full">
                <Lock className="w-4 h-4 text-[#00a884]" />
                <span>End-to-end encrypted real-time WebSocket protocol</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
