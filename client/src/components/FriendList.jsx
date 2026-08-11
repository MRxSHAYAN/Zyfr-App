import React, { useState, useEffect } from 'react';
import { Users, Info, Video } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import api from '../services/api';

const FriendList = ({ activeFriend, onSelectFriend, onViewProfile }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendList = async () => {
    try {
      const res = await api.get('/friends/list');
      setFriends(res.data || []);
    } catch (err) {
      console.error('[FriendList Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFriendList(); }, []);

  if (loading) {
    return <SkeletonLoader variant="friendRow" count={5} />;
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-surface-400">
        <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
          <Users className="w-7 h-7 text-surface-300 dark:text-surface-600" />
        </div>
        <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">No Friends Yet</h4>
        <p className="text-xs text-surface-400 dark:text-surface-500 max-w-xs leading-relaxed">
          Use the Search tab to find registered users and send friend requests.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1.5" role="list" aria-label="Friends list">
      {friends.map((friend) => {
        const isSelected = activeFriend?._id === friend._id;

        return (
          <div
            key={friend._id}
            role="listitem"
            onClick={() => onSelectFriend(friend)}
            className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border theme-transition ${
              isSelected
                ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20 shadow-sm'
                : 'bg-transparent border-transparent hover:bg-surface-50 dark:hover:bg-surface-800/60 hover:border-surface-200 dark:hover:border-surface-700/60'
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={friend.avatar}
                alt={friend.username}
                className="w-11 h-11 rounded-2xl object-cover border border-surface-200 dark:border-surface-700 bg-surface-200 dark:bg-surface-800"
              />
              <span
                className={`online-dot ${friend.isOnline ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'}`}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-surface-800 dark:text-surface-100'}`}>
                  {friend.fullName || friend.username}
                </h4>
                {friend.lastMessage?.createdAt && (
                  <span className="text-[10px] text-surface-400 shrink-0">
                    {new Date(friend.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-400 dark:text-surface-500 truncate mt-0.5">
                {friend.lastMessage
                  ? friend.lastMessage.type === 'call_invite'
                    ? '🎥 Video call invite'
                    : friend.lastMessage.message
                  : friend.bio || 'No recent messages'}
              </p>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 shrink-0">
              {friend.unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-500 text-white font-bold text-[10px] rounded-full min-w-[22px] text-center">
                  {friend.unreadCount}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile({ ...friend, isLocked: false, friendshipStatus: 'friends' });
                }}
                aria-label={`View ${friend.fullName || friend.username}'s profile`}
                className="p-1.5 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FriendList;
