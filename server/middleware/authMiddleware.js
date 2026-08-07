import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Protects endpoints by validating JWT tokens stored in HTTP-Only secure cookies ('jwt').
 * Also checks standard 'Authorization: Bearer <token>' headers as a fallback.
 */
export const protectRoute = async (req, res, next) => {
  try {
    // 1. Extract token from HTTP-Only cookie or Authorization header
    let token = req.cookies?.jwt;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    // 2. Verify token payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_whatsapp_clone_2026');

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token structure' });
    }

    // 3. Find user in DB (excluding password field)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // 4. Attach user object to request for downstream controllers
    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error]: ${error.message}`);
    return res.status(401).json({ message: 'Unauthorized - Token verification failed' });
  }
};
