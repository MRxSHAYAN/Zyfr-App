import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Clock, Check, X, MessageSquare } from 'lucide-react';
import api from '../services/api';

const UserSearch = ({ onSelectFriend, onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const handleSearch = async (searchTerm) => {
    if (!searchTerm?.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(res.data);
    } catch (err) {
      console.error('[UserSearch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const sendRequest = async (user) => {
    setActionLoading((p) => ({ ...p, [user._id]: true }));
    try {
      await api.post('/friends/request', { recipientId: user._id });
      handleSearch(query);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    } finally {
      setActionLoading((p) => ({ ...p, [user._id]: false }));
    }
  };

  const acceptRequest = async (user) => {
    setActionLoading((p) => ({ ...p, [user._id]: true }));
    try {
      await api.post('/friends/accept', { requesterId: user._id });
      handleSearch(query);
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting request');
    } finally {
      setActionLoading((p) => ({ ...p, [user._id]: false }));
    }
  };

  const declineRequest = async (user) => {
    setActionLoading((p) => ({ ...p, [user._id]: true }));
    try {
      await api.post('/friends/decline', { requesterId: user._id });
      handleSearch(query);
    } catch (err) {
      alert(err.response?.data?.message || 'Error declining request');
    } finally {
      setActionLoading((p) => ({ ...p, [user._id]: false }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="relative">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by @username or name…"
            aria-label="Search users"
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">

        {loading && (
          <div className="flex items-center justify-center py-8 text-surface-400 text-xs gap-2">
            <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            Searching users…
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <div className="text-center py-10 text-surface-400 text-xs">
            No users found matching "<strong>{query}</strong>"
          </div>
        )}

        {!loading && !query.trim() && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-surface-400 dark:text-surface-500 px-4">
            <Search className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs leading-relaxed">
              Type a username or full name to find users and send friend requests.
            </p>
          </div>
        )}

        {!loading && results.map((user) => (
          <div
            key={user._id}
            className="card p-3.5 flex items-center justify-between gap-3 hover:shadow-glass dark:hover:shadow-glass-dark transition-shadow"
          >
            <button
              onClick={() => onViewProfile(user)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-xl focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label={`View ${user.fullName || user.username}'s profile`}
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-xl object-cover border border-surface-200 dark:border-surface-700 bg-surface-200 dark:bg-surface-800 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
                  {user.fullName || user.username}
                </h4>
                <p className="text-xs text-surface-400 truncate">@{user.username}</p>
              </div>
            </button>

            {/* Action button */}
            <div className="shrink-0">
              {user.friendshipStatus === 'none' && (
                <button
                  onClick={() => sendRequest(user)}
                  disabled={actionLoading[user._id]}
                  className="btn-primary text-xs px-3 py-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Friend
                </button>
              )}
              {user.friendshipStatus === 'pending_sent' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium rounded-xl">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </span>
              )}
              {user.friendshipStatus === 'pending_received' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => acceptRequest(user)}
                    disabled={actionLoading[user._id]}
                    className="btn-primary text-xs px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => declineRequest(user)}
                    disabled={actionLoading[user._id]}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                    aria-label="Decline request"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {user.friendshipStatus === 'friends' && (
                <button
                  onClick={() => onSelectFriend(user)}
                  className="btn-ghost text-xs px-3 py-1.5 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
