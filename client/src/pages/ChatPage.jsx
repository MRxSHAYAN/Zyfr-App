import React, { useState } from 'react';
import { PhoneCall, PhoneOff, ShieldAlert, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import UserProfileModal from '../components/UserProfileModal';
import DailyVideoCall from '../components/DailyVideoCall';
import { useAuth } from '../context/AuthContext';
import { usePusher } from '../context/PusherContext';
import api from '../services/api';

const ChatPage = () => {
  const { authUser } = useAuth();
  const { incomingCall, setIncomingCall } = usePusher();

  const [activeFriend, setActiveFriend] = useState(null);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeCallRoomUrl, setActiveCallRoomUrl] = useState(null);
  const [activeCallCaller, setActiveCallCaller] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // On mobile: show sidebar when no friend selected, show chat when one is selected
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const handleSelectFriend = (friend) => {
    setActiveFriend(friend);
    setMobileChatOpen(true);
  };

  const handleBackToSidebar = () => {
    setMobileChatOpen(false);
    setActiveFriend(null);
  };

  const handleStartCall = async (friendId) => {
    setErrorMsg('');
    try {
      const res = await api.post('/calls/create-room', { recipientId: friendId });
      if (res.data?.roomUrl) {
        setActiveCallRoomUrl(res.data.roomUrl);
        setActiveCallCaller(null);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to start video call.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleJoinCall = (roomUrl, callerInfo = null) => {
    setActiveCallRoomUrl(roomUrl);
    setActiveCallCaller(callerInfo);
    if (incomingCall?.roomUrl === roomUrl) setIncomingCall(null);
  };

  return (
    <div className="h-screen w-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex overflow-hidden font-sans theme-transition">

      {/* ── Global error banner ─────────────────────── */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white font-medium text-xs px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Incoming call overlay ───────────────────── */}
      {incomingCall && (
        <div className="fixed top-5 right-5 z-50 card bg-white dark:bg-surface-900 border-2 border-primary-500/40 p-4 rounded-3xl shadow-glass-dark flex items-center gap-4 max-w-sm animate-slide-up">
          <img
            src={incomingCall.caller?.avatar}
            alt="Caller"
            className="w-12 h-12 rounded-2xl object-cover border border-surface-200 dark:border-surface-700 bg-surface-200 dark:bg-surface-800 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100 truncate">
              Incoming Video Call
            </h4>
            <p className="text-xs text-surface-400 truncate">
              {incomingCall.caller?.fullName || incomingCall.caller?.username} is calling…
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleJoinCall(incomingCall.roomUrl, incomingCall.caller)}
              className="p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl shadow transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Answer"
              aria-label="Answer call"
            >
              <PhoneCall className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIncomingCall(null)}
              className="p-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-rose-400"
              title="Decline"
              aria-label="Decline call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Sidebar — hidden on mobile when chat is open ─ */}
      <div className={`
        ${mobileChatOpen ? 'hidden' : 'flex'} md:flex
        w-full md:w-80 lg:w-96 shrink-0 flex-col h-full
      `}>
        <Sidebar
          activeFriend={activeFriend}
          onSelectFriend={handleSelectFriend}
          onViewProfile={(user) => {
            setProfileModalUser(user);
            setIsOwnProfile(false);
          }}
          onOpenOwnProfile={() => {
            setProfileModalUser(authUser);
            setIsOwnProfile(true);
          }}
        />
      </div>

      {/* ── Chat window — hidden on mobile when sidebar is showing ─ */}
      <div className={`
        ${mobileChatOpen ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col h-full overflow-hidden
      `}>
        {/* Mobile back button */}
        {mobileChatOpen && (
          <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-surface-50 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800">
            <button
              onClick={handleBackToSidebar}
              aria-label="Back to conversations"
              className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              {activeFriend?.fullName || activeFriend?.username || 'Chat'}
            </span>
          </div>
        )}
        <ChatWindow
          friend={activeFriend}
          onStartCall={handleStartCall}
          onJoinCall={handleJoinCall}
          onViewProfile={(user) => {
            setProfileModalUser(user);
            setIsOwnProfile(user._id === authUser._id);
          }}
        />
      </div>

      {/* ── Profile modal ───────────────────────────── */}
      {profileModalUser && (
        <UserProfileModal
          user={profileModalUser}
          isOwnProfile={isOwnProfile}
          onClose={() => setProfileModalUser(null)}
          onActionSuccess={() => setProfileModalUser(null)}
        />
      )}

      {/* ── Daily.co video call modal ───────────────── */}
      {activeCallRoomUrl && (
        <DailyVideoCall
          roomUrl={activeCallRoomUrl}
          callerInfo={activeCallCaller}
          onClose={() => {
            setActiveCallRoomUrl(null);
            setActiveCallCaller(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;
