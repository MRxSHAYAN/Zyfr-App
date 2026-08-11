import React, { useState } from 'react';
import { X, Lock, UserPlus, Check, Clock, ShieldAlert, Sparkles, Phone, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageUploader from './ImageUploader';
import api from '../services/api';

/**
 * UserProfileModal
 * Dual mode:
 *   isOwnProfile = true  → editable profile card (avatar, display name, username, bio, email, phone)
 *   isOwnProfile = false → friend profile view with friendship action buttons
 */
const UserProfileModal = ({ user, isOwnProfile = false, onClose, onActionSuccess }) => {
  const { authUser, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Own-profile edit state
  const [fullName, setFullName] = useState(user?.fullName || user?.username || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || 'Hey there! I am using ZYFR.');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation
  const validateUsername = (val) => /^[a-z0-9_]{3,24}$/.test(val);

  if (!user) return null;

  /* ── Own profile save ─────────────────────── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaveSuccess(false);

    if (!fullName.trim()) {
      setFormError('Display name cannot be empty.');
      return;
    }
    if (!validateUsername(username)) {
      setFormError('Username must be 3–24 characters: lowercase letters, numbers, underscores only.');
      return;
    }

    setLoading(true);
    const payload = { fullName: fullName.trim(), bio: bio.trim() };
    if (avatarBase64) payload.avatar = avatarBase64;

    const res = await updateProfile(payload);
    setLoading(false);

    if (res.success) {
      setSaveSuccess(true);
      addToast('Profile updated!', 'success');
      setTimeout(onClose, 1200);
    } else {
      setFormError(res.message);
    }
  };

  /* ── Friend action handlers ───────────────── */
  const handleAddFriend = async () => {
    setLoading(true);
    try {
      await api.post('/friends/request', { recipientId: user._id });
      addToast('Friend request sent!', 'success');
      onActionSuccess?.();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send friend request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setLoading(true);
    try {
      await api.post('/friends/accept', { requesterId: user._id });
      addToast('Friend request accepted!', 'success');
      onActionSuccess?.();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to accept request', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared pieces ────────────────────────── */
  const CoverGradient = () => (
    <div className="h-28 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-400 relative flex justify-end p-3 shrink-0">
      <button
        onClick={onClose}
        aria-label="Close profile"
        className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isOwnProfile ? 'Edit Your Profile' : `${user.fullName || user.username}'s Profile`}
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="card w-full max-w-md overflow-hidden relative animate-scale-in shadow-glass-dark">
        <CoverGradient />

        {/* Avatar */}
        <div className="px-6 pb-6 relative">
          <div className={`-mt-12 mb-4 flex justify-between items-end ${isOwnProfile ? 'flex-col items-center gap-3' : ''}`}>
            {isOwnProfile ? (
              <ImageUploader
                currentImageUrl={user.avatar}
                displayName={fullName || user.username}
                onImageSelect={(b64) => setAvatarBase64(b64 || '')}
                size="lg"
              />
            ) : (
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-2xl border-4 border-white dark:border-surface-900 object-cover shadow-glass bg-surface-200 dark:bg-surface-800"
                />
                {user.isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-surface-900 rounded-full" />
                )}
              </div>
            )}

            {!isOwnProfile && user.isLocked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold rounded-full">
                <Lock className="w-3.5 h-3.5" /> Locked Profile
              </span>
            )}
          </div>

          {/* ── OWN PROFILE FORM ────────────────── */}
          {isOwnProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 mt-2" noValidate>
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 text-center">Edit Profile</h2>

              {formError && (
                <div role="alert" className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {saveSuccess && (
                <div role="status" className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Profile saved!</span>
                </div>
              )}

              {/* Display name */}
              <div>
                <label htmlFor="pf-fullname" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <input
                  id="pf-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="Your full display name"
                />
              </div>

              {/* Username handle */}
              <div>
                <label htmlFor="pf-username" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
                  Username
                </label>
                <div className="relative flex items-center">
                  <AtSign className="w-4 h-4 text-surface-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="pf-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                    className="input-field pl-10"
                    placeholder="your_handle"
                    aria-describedby="pf-username-hint"
                  />
                </div>
                <p id="pf-username-hint" className="text-[10px] text-surface-400 mt-1">
                  Lowercase letters, numbers, underscores — 3 to 24 characters.
                </p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="pf-bio" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
                  Bio / Status
                </label>
                <textarea
                  id="pf-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Tell your friends about yourself…"
                  maxLength={160}
                />
                <p className="text-[10px] text-surface-400 mt-1 text-right">{bio.length}/160</p>
              </div>

              {/* Phone (optional, stored locally for now) */}
              <div>
                <label htmlFor="pf-phone" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-surface-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="pf-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10"
                    placeholder="+1 555 000 0000"
                  />
                </div>
              </div>

              {/* Read-only email */}
              <div>
                <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={authUser?.email || ''}
                  readOnly
                  className="input-field opacity-60 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── FRIEND PROFILE VIEW ──────────── */
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">{user.fullName || user.username}</h2>
                <p className="text-xs text-surface-400">@{user.username}</p>
                <p className="text-xs text-surface-500 mt-0.5">
                  {user.isOnline ? '🟢 Online' : `Last seen ${user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'unknown'}`}
                </p>
              </div>

              <div className="p-3.5 bg-surface-50 dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800/80 rounded-2xl">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Bio</span>
                <p className="text-sm text-surface-700 dark:text-surface-300 italic">{user.bio || 'No bio provided.'}</p>
              </div>

              {/* Locked access notice */}
              {user.isLocked && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Friends-Only Access</p>
                    <p className="text-amber-600 dark:text-amber-400/80 text-[11px]">
                      Messaging, chat history, and video calls unlock after the friend request is accepted.
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-1">
                {user.friendshipStatus === 'none' && (
                  <button onClick={handleAddFriend} disabled={loading} className="btn-primary w-full">
                    <UserPlus className="w-4 h-4" />
                    {loading ? 'Sending…' : 'Add Friend'}
                  </button>
                )}
                {user.friendshipStatus === 'pending_sent' && (
                  <button disabled className="btn-ghost w-full cursor-not-allowed opacity-60 border border-surface-200 dark:border-surface-700">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Request Pending
                  </button>
                )}
                {user.friendshipStatus === 'pending_received' && (
                  <button onClick={handleAcceptRequest} disabled={loading} className="btn-primary w-full bg-emerald-500 hover:bg-emerald-600">
                    <Check className="w-4 h-4" />
                    {loading ? 'Accepting…' : 'Accept Request'}
                  </button>
                )}
                {user.friendshipStatus === 'friends' && (
                  <button onClick={onClose} className="btn-ghost w-full border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    Friends — Go to Chat
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
