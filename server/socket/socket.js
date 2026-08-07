import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

// Dynamic client URL setup for CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Initialize Socket.io instance with cross-origin resource sharing (CORS) rules
const io = new Server(server, {
  cors: {
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Map of userId -> socketId to keep track of active online users
const userSocketMap = {}; // { userId: socketId }

/**
 * Utility helper to get the active socket ID of a target receiver user ID
 */
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Listen for client WebSocket connection events
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Retrieve userId passed in query string during socket initialization
  const userId = socket.handshake.query.userId;

  if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
    console.log(`[Socket] User ${userId} mapped to socket ${socket.id}`);
  }

  // Broadcast array of online user IDs to all connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // Handle typing indicator event
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { senderId });
    }
  });

  // Handle stop typing indicator event
  socket.on('stopTyping', ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStopTyping', { senderId });
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    if (userId) {
      delete userSocketMap[userId];
    }
    // Broadcast updated list of online users
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { app, io, server };
