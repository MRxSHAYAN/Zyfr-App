import { io } from 'socket.io-client';

/**
 * Socket.io Client Service Helper
 * Initializes a WebSocket connection to the dynamic backend server URL.
 */
export const createSocketConnection = (userId) => {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  return io(serverUrl, {
    query: {
      userId,
    },
    withCredentials: true,
  });
};
