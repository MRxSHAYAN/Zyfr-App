import React, { useState, useRef, useEffect } from 'react';
import { Smile, Send } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const EMOJI_LIST = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '🙏', '😊', '😍', '😎', '🙌', '✨', '💯', '🤔'];

const MessageInput = ({ recipientId, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const { socket } = useSocket();
  const { authUser } = useAuth();
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (socket && recipientId) {
      // Emit typing event to backend
      socket.emit('typing', { senderId: authUser._id, receiverId: recipientId });

      // Clear existing timer and reset stopTyping countdown (1.5 seconds)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { senderId: authUser._id, receiverId: recipientId });
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage('');
    setShowEmojis(false);

    if (socket && recipientId) {
      socket.emit('stopTyping', { senderId: authUser._id, receiverId: recipientId });
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <div className="relative bg-[#202c33] border-t border-[#222d34] px-4 py-3 flex items-center space-x-3">
      {/* Quick Emoji Picker Popover */}
      {showEmojis && (
        <div className="absolute bottom-16 left-4 bg-[#2a3942] border border-[#222d34] p-3 rounded-xl shadow-2xl z-30 flex flex-wrap gap-2 max-w-xs animate-in fade-in zoom-in-95 duration-150">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Toggle Button */}
      <button
        type="button"
        onClick={() => setShowEmojis((prev) => !prev)}
        className="text-[#8696a0] hover:text-[#00a884] transition-colors p-1"
        title="Emojis"
      >
        <Smile className="w-6 h-6" />
      </button>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="flex-1 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={handleInputChange}
          className="w-full bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-[#00a884]"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008069] disabled:opacity-50 disabled:hover:bg-[#00a884] text-[#111b21] flex items-center justify-center transition-all flex-shrink-0"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
