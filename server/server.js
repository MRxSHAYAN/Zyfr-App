import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { app, server } from './socket/socket.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS for cross-origin request credentials (HTTP-Only cookies)
app.use(
  cors({
    origin: [CLIENT_URL, 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Connect to MongoDB and start HTTP/Socket server
server.listen(PORT, async () => {
  await connectDB();
  console.log(`=================================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
  console.log(`=================================================`);
});
