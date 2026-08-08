import React, { useState, useEffect, useRef } from 'react';
import { Video, Phone, Info, Lock, Send, Sparkles, UserPlus, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePusher } from '../context/PusherContext';
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

  // Fetch messages when friend changes
  const fetchMessages = async () => {
    if (!friend?._id) return;
    setLoading(true);
    setIsLocked(false);
    try {
      const res = await api.get(`/messages/${friend._id}`);
      setMessages(res.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setIsLocked(true);
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [friend?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to Pusher channel for active conversation
  useEffect(() => {
    if (!pusherClient || !friend?._id || isLocked) return;

    let channelName = '';
    // Infer conversation channel from message data or fetch
    api.get(`/messages/${friend._id}`).then((res) => {
      if (res.data && res.data.length > 0 && res.data[0].conversationId) {
        channelName = `chat-${res.data[0].conversationId}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind('message:new', (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        });

        channel.bind('typing', (data) => {
          if (data.userId === friend._id) {
            setFriendTyping(data.isTyping);
          }
        });
      }
    });

    return () => {
      if (channelName && pusherClient) {
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [pusherClient, friend?._id, isLocked]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !friend?._id || isLocked) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const res = await api.post(`/messages/send/${friend._id}`, {
        message: textToSend,
      });

      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('[sendMessage Error]:', err);
      if (err.response?.status === 403) {
        setIsLocked(true);
      }
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

  if (!friend) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-xl">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Welcome to ZYFR Realtime Communication</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select a confirmed friend from the sidebar or search registered users to start real-time messaging and Daily.co video calls.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Active Chat Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 shadow-md">
        <div
          onClick={() => onViewProfile(friend)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={friend.avatar}
              alt={friend.username}
              className="w-11 h-11 rounded-2xl object-cover border border-slate-800 group-hover:border-emerald-500 transition-all bg-slate-800"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                friend.isOnline ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-all flex items-center gap-2">
              {friend.fullName || friend.username}
            </h3>
            <p className="text-xs text-slate-400">
              {friendTyping ? (
                <span className="text-emerald-400 font-medium animate-pulse">typing...</span>
              ) : friend.isOnline ? (
                'Online'
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        {/* Video Call Trigger Button */}
        <div className="flex items-center gap-2">
          {!isLocked && (
            <button
              onClick={() => onStartCall(friend._id)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              title="Start Daily.co Video Call"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">[ Start Video Call ]</span>
            </button>
          )}

          <button
            onClick={() => onViewProfile(friend)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
            title="User Profile Info"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/90">
        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            Decrypting chat stream...
          </div>
        )}

        {isLocked && (
          <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-200">Locked Non-Friend Profile</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
              Core Access Control Rule: Direct messaging, chat history, and video calls are strictly restricted to confirmed friends.
            </p>
            <button
              onClick={() => onViewProfile(friend)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow transition-all"
            >
              [ + Add Friend / View Request Status ]
            </button>
          </div>
        )}

        {!loading && !isLocked && messages.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-xs">
            No messages exchanged yet. Send a message to start chatting!
          </div>
        )}

        {!loading &&
          !isLocked &&
          messages.map((msg) => {
            const isMe = msg.senderId === authUser._id;

            return (
              <div
                key={msg._id || msg.createdAt}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm md:max-w-md p-3.5 rounded-2xl shadow-md ${
                    isMe
                      ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Call Invite Message Card */}
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
                            ? 'bg-slate-950 text-emerald-400 hover:bg-slate-900'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        }`}
                      >
                        [ Join Video Call ]
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  )}

                  <span
                    className={`block text-[10px] text-right mt-1 font-normal ${
                      isMe ? 'text-slate-900/70' : 'text-slate-500'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      {!isLocked && (
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${friend.fullName || friend.username}...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold rounded-2xl shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatWindow;
