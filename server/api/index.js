import 'dotenv/config';
import app from '../server.js';
import { connectDB } from '../config/db.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel DB Connection Error]:', err);
    }
  }
  return app(req, res);
}
