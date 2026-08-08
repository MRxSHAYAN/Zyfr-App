import React, { useState } from 'react';
import { MessageSquare, Users, UserPlus, LogOut, User, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FriendList from './FriendList';
import UserSearch from './UserSearch';
import PendingRequests from './PendingRequests';

const Sidebar = ({ activeFriend, onSelectFriend, onViewProfile, onOpenOwnProfile }) => {
  const { authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'search' | 'requests'

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Header Profile Banner */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div
          onClick={onOpenOwnProfile}
          className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
        >
          <div className="relative">
            <img
              src={authUser?.avatar}
              alt={authUser?.username}
              className="w-10 h-10 rounded-xl object-cover border border-slate-800 group-hover:border-emerald-500 transition-all bg-slate-800"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-all">
              {authUser?.fullName || authUser?.username}
            </h3>
            <p className="text-xs text-slate-400 truncate">@{authUser?.username}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Navigation Tabs */}
      <div className="p-2 bg-slate-950/40 border-b border-slate-800 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'chats'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Friends
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'search'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Search
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'requests'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Requests
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chats' && (
          <FriendList
            activeFriend={activeFriend}
            onSelectFriend={onSelectFriend}
            onViewProfile={onViewProfile}
          />
        )}

        {activeTab === 'search' && (
          <UserSearch
            onSelectFriend={(friend) => {
              onSelectFriend(friend);
              setActiveTab('chats');
            }}
            onViewProfile={onViewProfile}
          />
        )}

        {activeTab === 'requests' && (
          <PendingRequests
            onRequestHandled={() => {
              // Option to update UI if needed
            }}
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
