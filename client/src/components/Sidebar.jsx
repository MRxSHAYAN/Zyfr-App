import React, { useState } from 'react';
import { Search, LogOut, MessageSquarePlus, MoreVertical, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import UserItem from './UserItem';

const Sidebar = ({ users, selectedUser, onSelectUser, loading }) => {
  const { authUser, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter contacts by search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-[380px] lg:w-[420px] h-full bg-[#111b21] border-r border-[#222d34] flex flex-col flex-shrink-0">
      {/* Header bar */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
        <div className="flex items-center space-x-3">
          <img
            src={authUser?.avatar}
            alt={authUser?.username}
            className="w-10 h-10 rounded-full object-cover border border-[#00a884]"
          />
          <div>
            <h3 className="text-sm font-semibold text-[#e9edef]">{authUser?.username}</h3>
            <span className="text-[11px] text-[#00a884] font-medium">Online</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[#8696a0]">
          <button
            onClick={logout}
            title="Log out"
            className="p-2 hover:bg-[#2a3942] hover:text-red-400 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2 bg-[#111b21]">
        <div className="relative flex items-center bg-[#202c33] rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#00a884]">
          <Search className="w-4 h-4 text-[#8696a0] mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#8696a0] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40">
        {loading ? (
          <div className="p-8 text-center text-[#8696a0] text-sm">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#00a884] border-t-transparent mb-2"></div>
            <p>Loading contacts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0] text-sm">
            {searchQuery ? 'No contacts match your search.' : 'No active users found.'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserItem
              key={user._id}
              user={user}
              isSelected={selectedUser?._id === user._id}
              isOnline={onlineUsers.includes(user._id)}
              onClick={() => onSelectUser(user)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
