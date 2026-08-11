import React, { useState } from 'react';
import { MessageSquare, UserPlus, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FriendList from './FriendList';
import UserSearch from './UserSearch';
import PendingRequests from './PendingRequests';
import ThemeToggle from './ThemeToggle';

const TABS = [
  { key: 'chats',    label: 'Friends',  Icon: MessageSquare },
  { key: 'search',   label: 'Search',   Icon: UserPlus },
  { key: 'requests', label: 'Requests', Icon: Clock },
];

const Sidebar = ({ activeFriend, onSelectFriend, onViewProfile, onOpenOwnProfile }) => {
  const { authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <aside
      aria-label="Sidebar navigation"
      className="w-full md:w-80 lg:w-96 flex flex-col h-full shrink-0
        bg-white dark:bg-surface-900
        border-r border-surface-200 dark:border-surface-800
        theme-transition"
    >
      {/* ── Profile header ──────────────────────── */}
      <header className="p-4 bg-surface-50 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between gap-2">
        <button
          onClick={onOpenOwnProfile}
          className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 rounded-xl p-1 -ml-1
            hover:bg-surface-100 dark:hover:bg-surface-800 transition-all
            focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Open your profile"
        >
          <div className="relative shrink-0">
            <img
              src={authUser?.avatar}
              alt={authUser?.username}
              className="w-10 h-10 rounded-xl object-cover border border-surface-200 dark:border-surface-700
                group-hover:border-primary-400 transition-all bg-surface-200 dark:bg-surface-800"
            />
            <span className="online-dot bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate group-hover:text-primary-500 transition-colors">
              {authUser?.fullName || authUser?.username}
            </p>
            <p className="text-xs text-surface-400 truncate">@{authUser?.username}</p>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <button
            onClick={logout}
            aria-label="Sign out"
            className="p-2 text-surface-400 hover:text-rose-500 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Tab navigation ──────────────────────── */}
      <nav
        role="tablist"
        aria-label="Sidebar sections"
        className="p-2 bg-surface-50 dark:bg-surface-950/60 border-b border-surface-200 dark:border-surface-800 flex items-center gap-1"
      >
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-${key}`}
            id={`tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`nav-tab ${activeTab === key ? 'nav-tab-active' : 'nav-tab-inactive'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {/* ── Tab panels ──────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          id="tabpanel-chats"
          role="tabpanel"
          aria-labelledby="tab-chats"
          hidden={activeTab !== 'chats'}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {activeTab === 'chats' && (
            <FriendList
              activeFriend={activeFriend}
              onSelectFriend={onSelectFriend}
              onViewProfile={onViewProfile}
            />
          )}
        </div>

        <div
          id="tabpanel-search"
          role="tabpanel"
          aria-labelledby="tab-search"
          hidden={activeTab !== 'search'}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {activeTab === 'search' && (
            <UserSearch
              onSelectFriend={(friend) => {
                onSelectFriend(friend);
                setActiveTab('chats');
              }}
              onViewProfile={onViewProfile}
            />
          )}
        </div>

        <div
          id="tabpanel-requests"
          role="tabpanel"
          aria-labelledby="tab-requests"
          hidden={activeTab !== 'requests'}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {activeTab === 'requests' && (
            <PendingRequests onRequestHandled={() => {}} />
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
