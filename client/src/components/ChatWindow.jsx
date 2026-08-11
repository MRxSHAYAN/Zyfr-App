import React, { useState, useEffect, useRef } from 'react';
import { Video, Info, Send, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePusher } from '../context/PusherContext';
import SkeletonLoader from './SkeletonLoader';
import api from '../services/api';

const ChatWindow = ({ friend, onStartCall, onJoinCall, onViewProfile }) => {
  const { authUser } = useAuth();
  const { pusherClient } = usePusher();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!friend?._id) return;
    setLoading(true);
    setIsLocked(false);
    try {
      const res = await api.get(`/messages/${friend._id}`);
      setMessages(res.data || []);
    } catch (err) {
      if (err.response?.status === 403) setIsLocked(true);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [friend?._id]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (!pusherClient || !friend?._id || !friend?.conversationId || isLocked) return;
    const channelName = `chat-${friend.conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind('message:new', (newMsg) => {
      setMessages((prev) => prev.some((m) => m._id === newMsg._id) ? prev : [...prev, newMsg]);
    });

    channel.bind('typing', (data) => {
      if (data.userId === friend._id) setFriendTyping(data.isTyping);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [pusherClient, friend?._id, friend?.conversationId, isLocked]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !friend?._id || isLocked) return;
    const textToSend = inputText;
    setInputText('');
    try {
      const res = await api.post(`/messages/send/${friend._id}`, { message: textToSend });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      if (err.response?.status === 403) setIsLocked(true);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      api.post('/messages/typing', { friendId: friend._id, isTyping: true }).catch(() => {});
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      api.post('/messages/typing', { friendId: friend._id, isTyping: false }).catch(() => {});
    }, 2000);
  };

  /* ── Empty state ─────────────────────────────────────── */
  if (!friend) {
    return (
      <main className="flex-1 bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-6 text-center chat-bg">
        <div className="w-16 h-16 rounded-3xl bg-primary-500/10 text-primary-500 dark:text-primary-400 flex items-center justify-center mb-4 border border-primary-200 dark:border-primary-500/20 shadow-glow">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-surface-800 dark:text-surface-100">Welcome to ZYFR</h3>
        <p className="text-xs text-surface-400 dark:text-surface-500 max-w-sm mt-1.5 leading-relaxed">
          Select a confirmed friend from the sidebar or search registered users to start real-time messaging and video calls.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-surface-50 dark:bg-surface-950 overflow-hidden">

      {/* ── Chat header ──────────────────────────────── */}
      <header className="px-4 py-3 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between z-10 shadow-sm">
        <button
          onClick={() => onViewProfile(friend)}
          className="flex items-center gap-3 rounded-xl p-1 -ml-1 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all focus-visible:ring-2 focus-visible:ring-primary-500 group"
          aria-label={`View ${friend.fullName || friend.username}'s profile`}
        >
          <div className="relative">
            <img
              src={friend.avatar}
              alt={friend.username}
              className="w-10 h-10 rounded-xl object-cover border border-surface-200 dark:border-surface-700 group-hover:border-primary-400 transition-all bg-surface-200 dark:bg-surface-800"
            />
            <span
              className={`online-dot ${friend.isOnline ? 'bg-emerald-500' : 'bg-surface-400 dark:bg-surface-600'}`}
            />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 group-hover:text-primary-500 transition-colors">
              {friend.fullName || friend.username}
            </h3>
            <p className="text-xs text-surface-400">
              {friendTyping ? (
                <span className="text-emerald-500 font-medium animate-pulse">typing…</span>
              ) : friend.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {!isLocked && (
            <button
              onClick={() => onStartCall(friend._id)}
              className="btn-primary px-3 py-2 text-xs"
              title="Start Video Call"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video Call</span>
            </button>
          )}
          <button
            onClick={() => onViewProfile(friend)}
            className="p-2 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary-500"
            title="Profile Info"
            aria-label="View profile"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Messages stream ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-bg">

        {loading && <SkeletonLoader variant="messageRow" count={6} />}

        {isLocked && (
          <div className="max-w-md mx-auto my-12 p-6 card text-center shadow-glass-dark">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-surface-800 dark:text-surface-200">Locked Profile</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-4 leading-relaxed">
              Messaging, chat history, and video calls are restricted to confirmed friends only.
            </p>
            <button
              onClick={() => onViewProfile(friend)}
              className="btn-primary mx-auto"
            >
              Add Friend / View Status
            </button>
          </div>
        )}

        {!loading && !isLocked && messages.length === 0 && (
          <div className="text-center py-16 text-surface-400 dark:text-surface-500 text-xs">
            No messages yet. Send the first one!
          </div>
        )}

        {!loading && !isLocked && messages.map((msg) => {
          const isMe = msg.senderId === authUser._id;
          return (
            <div key={msg._id || msg.createdAt} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-sm md:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  isMe
                    ? 'bg-primary-500 text-white rounded-tr-none'
                    : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-800 dark:text-surface-100 rounded-tl-none'
                }`}
              >
                {msg.type === 'call_invite' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <Video className="w-4 h-4" />
                      {msg.message}
                    </div>
                    <button
                      onClick={() => onJoinCall(msg.callUrl)}
                      className={`w-full py-2 px-3 font-bold text-xs rounded-xl transition-all shadow ${
                        isMe
                          ? 'bg-white/20 hover:bg-white/30 text-white'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      Join Video Call
                    </button>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                )}
                <span className={`block text-[10px] text-right mt-1 ${isMe ? 'text-white/60' : 'text-surface-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Message input ─────────────────────────────── */}
      {!isLocked && (
        <form
          onSubmit={handleSendMessage}
          className="px-4 py-3 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${friend.fullName || friend.username}…`}
            aria-label="Message input"
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Send message"
            className="btn-primary shrink-0 px-4 py-2.5 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </main>
  );
};

export default ChatWindow;
