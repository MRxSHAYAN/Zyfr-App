import React, { useState } from 'react';
import { Video, PhoneCall, X, PhoneOff, ShieldAlert } from 'lucide-react';
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

  // Start Video Call handler
  const handleStartCall = async (friendId) => {
    setErrorMsg('');
    try {
      const res = await api.post('/calls/create-room', { recipientId: friendId });
      if (res.data && res.data.roomUrl) {
        setActiveCallRoomUrl(res.data.roomUrl);
        setActiveCallCaller(null);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to start video call.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Join Video Call handler
  const handleJoinCall = (roomUrl, callerInfo = null) => {
    setActiveCallRoomUrl(roomUrl);
    setActiveCallCaller(callerInfo);
    if (incomingCall && incomingCall.roomUrl === roomUrl) {
      setIncomingCall(null);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      {/* Global Error Banner */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white font-medium text-xs px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Incoming Call Overlay Alert */}
      {incomingCall && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 border-2 border-emerald-500/50 p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-bounce max-w-sm">
          <img
            src={incomingCall.caller?.avatar}
            alt="Caller"
            className="w-12 h-12 rounded-2xl object-cover border border-slate-700 bg-slate-800"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-100 truncate">
              Incoming Video Call
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {incomingCall.caller?.fullName || incomingCall.caller?.username} is calling...
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleJoinCall(incomingCall.roomUrl, incomingCall.caller)}
              className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl shadow-lg transition-all"
              title="Answer Call"
            >
              <PhoneCall className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIncomingCall(null)}
              className="p-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-2xl transition-all"
              title="Decline"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeFriend={activeFriend}
        onSelectFriend={(friend) => setActiveFriend(friend)}
        onViewProfile={(user) => {
          setProfileModalUser(user);
          setIsOwnProfile(false);
        }}
        onOpenOwnProfile={() => {
          setProfileModalUser(authUser);
          setIsOwnProfile(true);
        }}
      />

      {/* Main Chat Box Window */}
      <ChatWindow
        friend={activeFriend}
        onStartCall={handleStartCall}
        onJoinCall={handleJoinCall}
        onViewProfile={(user) => {
          setProfileModalUser(user);
          setIsOwnProfile(user._id === authUser._id);
        }}
      />

      {/* User Profile Modal */}
      {profileModalUser && (
        <UserProfileModal
          user={profileModalUser}
          isOwnProfile={isOwnProfile}
          onClose={() => setProfileModalUser(null)}
          onActionSuccess={() => setProfileModalUser(null)}
        />
      )}

      {/* Daily.co Embedded Video Call Modal */}
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
