import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Clock, Check, X, MessageSquare, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const UserSearch = ({ onSelectFriend, onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const handleSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setResults([]);
      return;
    }
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
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const sendRequest = async (user) => {
    setActionLoading((prev) => ({ ...prev, [user._id]: true }));
    try {
      await api.post('/friends/request', { recipientId: user._id });
      handleSearch(query); // refresh status
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user._id]: false }));
    }
  };

  const acceptRequest = async (user) => {
    setActionLoading((prev) => ({ ...prev, [user._id]: true }));
    try {
      await api.post('/friends/accept', { requesterId: user._id });
      handleSearch(query); // refresh status
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user._id]: false }));
    }
  };

  const declineRequest = async (user) => {
    setActionLoading((prev) => ({ ...prev, [user._id]: true }));
    try {
      await api.post('/friends/decline', { requesterId: user._id });
      handleSearch(query);
    } catch (err) {
      alert(err.response?.data?.message || 'Error declining request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user._id]: false }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by @username or name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8 text-slate-400 text-xs gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            Searching registered users...
          </div>
        )}

        {!loading && query.trim() !== '' && results.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No registered users found matching "{query}"
          </div>
        )}

        {!loading && query.trim() === '' && (
          <div className="text-center py-10 text-slate-500 text-xs px-4">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
            Type a username or full name above to locate users and send friend requests.
          </div>
        )}

        {!loading &&
          results.map((user) => (
            <div
              key={user._id}
              className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div
                onClick={() => onViewProfile(user)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-200 truncate">
                    {user.fullName || user.username}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                </div>
              </div>

              {/* Dynamic Status Buttons */}
              <div className="shrink-0">
                {user.friendshipStatus === 'none' && (
                  <button
                    onClick={() => sendRequest(user)}
                    disabled={actionLoading[user._id]}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    [ + Add Friend ]
                  </button>
                )}

                {user.friendshipStatus === 'pending_sent' && (
                  <button
                    disabled
                    className="px-3 py-1.5 bg-slate-800 text-slate-400 font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-not-allowed border border-slate-700/50"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    [ Pending ]
                  </button>
                )}

                {user.friendshipStatus === 'pending_received' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => acceptRequest(user)}
                      disabled={actionLoading[user._id]}
                      className="px-2.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium text-xs rounded-xl transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => declineRequest(user)}
                      disabled={actionLoading[user._id]}
                      className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-xs rounded-xl transition-all"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {user.friendshipStatus === 'friends' && (
                  <button
                    onClick={() => onSelectFriend(user)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    [ Friends ]
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
