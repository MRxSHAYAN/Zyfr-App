import React from 'react';
import { CheckCheck } from 'lucide-react';

const UserItem = ({ user, isSelected, isOnline, onClick }) => {
  // Format timestamp helper
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 px-3 py-3 cursor-pointer transition-colors duration-150 border-b border-[#222d34]/60 ${
        isSelected
          ? 'bg-[#2a3942]'
          : 'hover:bg-[#202c33]'
      }`}
    >
      {/* Avatar Container with Online Indicator */}
      <div className="relative flex-shrink-0">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover bg-[#2a3942]"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111b21] rounded-full" />
        )}
      </div>

      {/* User Information & Message Preview */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className="text-sm font-semibold text-[#e9edef] truncate">
            {user.username}
          </h4>
          {user.lastMessageTime && (
            <span className="text-[11px] text-[#8696a0]">
              {formatTime(user.lastMessageTime)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-[#8696a0]">
          <p className="truncate flex items-center space-x-1 pr-2">
            {user.lastMessage ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-[#00a884] inline-block flex-shrink-0" />
                <span className="truncate">{user.lastMessage}</span>
              </>
            ) : (
              <span className="italic text-[#8696a0]/70">No messages yet</span>
            )}
          </p>

          {/* Unread Counter Badge */}
          {user.unreadCount > 0 && (
            <span className="bg-[#00a884] text-[#111b21] font-bold text-[11px] min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center flex-shrink-0">
              {user.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserItem;
