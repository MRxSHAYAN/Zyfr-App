import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import callRoutes from './routes/callRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS for cross-origin request credentials (HTTP-Only cookies)
app.use(
  cors({
    origin: [CLIENT_URL, 'http://127.0.0.1:5173', 'https://zyfr.vercel.app'],
    credentials: true,
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database connection middleware for Vercel Serverless Function invocations
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel DB Connection Error]:', err);
    }
  }
  next();
});

// API Routes Mounting (including Vercel Services route aliases)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', messageRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/video', callRoutes);

// Start local HTTP dev server if executed directly (outside Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` Server running on port ${PORT}`);
      console.log(` Allowed Client URL: ${CLIENT_URL}`);
      console.log(`=================================================`);
    });
  });
}

export default app;
