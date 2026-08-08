import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from './AuthContext';

const PusherContext = createContext(null);

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
};

export const PusherProvider = ({ children }) => {
  const { authUser } = useAuth();
  const [pusherClient, setPusherClient] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [friendRequestNotification, setFriendRequestNotification] = useState(null);

  useEffect(() => {
    if (!authUser) {
      if (pusherClient) {
        pusherClient.disconnect();
        setPusherClient(null);
      }
      return;
    }

    const pusherKey = import.meta.env.VITE_PUSHER_KEY || 'zyfr_pusher_key';
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

    try {
      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
      });

      setPusherClient(pusher);

      // Subscribe to user-specific personal channel
      const userChannelName = `user-${authUser._id}`;
      const userChannel = pusher.subscribe(userChannelName);

      // Listen for incoming call invites
      userChannel.bind('call:invite', (data) => {
        console.log('[Pusher] Incoming Call Invite:', data);
        setIncomingCall(data);
      });

      // Listen for incoming friend requests
      userChannel.bind('friend_request:received', (data) => {
        console.log('[Pusher] Friend Request Received:', data);
        setFriendRequestNotification({
          type: 'received',
          data,
        });
      });

      userChannel.bind('friend_request:accepted', (data) => {
        console.log('[Pusher] Friend Request Accepted:', data);
        setFriendRequestNotification({
          type: 'accepted',
          data,
        });
      });

      return () => {
        userChannel.unbind_all();
        pusher.unsubscribe(userChannelName);
        pusher.disconnect();
      };
    } catch (err) {
      console.warn('[Pusher Client Error]:', err.message);
    }
  }, [authUser]);

  return (
    <PusherContext.Provider
      value={{
        pusherClient,
        incomingCall,
        setIncomingCall,
        friendRequestNotification,
        setFriendRequestNotification,
      }}
    >
      {children}
    </PusherContext.Provider>
  );
};
