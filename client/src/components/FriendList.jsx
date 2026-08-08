import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Video, Info } from 'lucide-react';
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

  useEffect(() => {
    fetchFriendList();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        Loading confirmed friends list...
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-slate-400">
        <Users className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
        <h4 className="text-sm font-semibold text-slate-300">No Friends Connected Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Use the User Search tab to locate registered users and send friend requests.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {friends.map((friend) => {
        const isSelected = activeFriend?._id === friend._id;

        return (
          <div
            key={friend._id}
            onClick={() => onSelectFriend(friend)}
            className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
              isSelected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-100 shadow-md'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={friend.avatar}
                  alt={friend.username}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-800 bg-slate-800"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                    friend.isOnline ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100 truncate">
                    {friend.fullName || friend.username}
                  </h4>
                  {friend.lastMessage?.createdAt && (
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(friend.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {friend.lastMessage
                    ? friend.lastMessage.type === 'call_invite'
                      ? '🎥 Video call invite'
                      : friend.lastMessage.message
                    : friend.bio || 'No recent messages'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {friend.unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full">
                  {friend.unreadCount}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile({ ...friend, isLocked: false, friendshipStatus: 'friends' });
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                title="View Profile"
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
