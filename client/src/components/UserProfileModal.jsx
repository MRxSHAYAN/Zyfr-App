import React, { useState } from 'react';
import { X, Lock, UserPlus, Check, Clock, Edit2, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserProfileModal = ({ user, isOwnProfile = false, onClose, onActionSuccess }) => {
  const { authUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields for personal profile
  const [fullName, setFullName] = useState(user?.fullName || user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || 'Hey there! I am using ZYFR.');

  if (!user) return null;

  const handleAddFriend = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/friends/request', { recipientId: user._id });
      setSuccess('Friend request sent!');
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/friends/accept', { requesterId: user._id });
      setSuccess('Friend request accepted!');
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const res = await updateProfile({ fullName, avatar, bio });
    setLoading(false);

    if (res.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header background pattern */}
        <div className="h-28 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative flex justify-end p-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar Overlay */}
        <div className="px-6 pb-6 relative">
          <div className="-mt-14 mb-4 flex justify-between items-end">
            <div className="relative">
              <img
                src={avatar || user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-2xl border-4 border-slate-900 object-cover shadow-xl bg-slate-800"
              />
              {user.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              )}
            </div>
            {!isOwnProfile && user.isLocked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
                <Lock className="w-3.5 h-3.5" /> Locked Profile
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form / Content */}
          {isOwnProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Bio / Status</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Tell your friends about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100">{user.fullName || user.username}</h3>
                <p className="text-xs text-slate-400">@{user.username}</p>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">Bio</span>
                <p className="text-sm text-slate-300 italic">{user.bio || 'No bio provided.'}</p>
              </div>

              {/* Core Access Control Rule 2: Locked Non-Friend Notice */}
              {user.isLocked && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300 mb-0.5">Friends-Only Access Control</p>
                    <p className="text-amber-400/80 text-[11px]">
                      Direct messaging, chat history, and video calls are locked until friend request is accepted.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                {user.friendshipStatus === 'none' && (
                  <button
                    onClick={handleAddFriend}
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    {loading ? 'Sending...' : '[ + Add Friend ]'}
                  </button>
                )}

                {user.friendshipStatus === 'pending_sent' && (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-800 text-slate-400 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700/50"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    [ Request Pending ]
                  </button>
                )}

                {user.friendshipStatus === 'pending_received' && (
                  <button
                    onClick={handleAcceptRequest}
                    disabled={loading}
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {loading ? 'Accepting...' : '[ Accept Request ]'}
                  </button>
                )}

                {user.friendshipStatus === 'friends' && (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-sm rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    [ Friends - Active Chat ]
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
