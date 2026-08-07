import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper Utility to generate JWT and attach HTTP-Only cookie to response.
 * Configured with dynamic sameSite & secure policies depending on environment.
 */
const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_whatsapp_clone_2026',
    { expiresIn: '15d' }
  );

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 Days
    httpOnly: true, // Prevent client-side JS access (mitigates XSS)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain HTTPS in prod, 'lax' for local dev
    secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
  });

  return token;
};

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    // Validation checks
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email address is already registered' });
      }
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create avatar URL if custom URL not provided
    const avatarUrl =
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=00a884&color=fff&bold=true`;

    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: avatarUrl,
    });

    await newUser.save();

    // Attach JWT HTTP-Only Cookie
    generateTokenAndSetCookie(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.error(`[Register Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get session
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please enter your email/username and password' });
    }

    // Search user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.trim() }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password match
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Issue HTTP-Only Cookie
    generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(`[Login Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

/**
 * @desc    Clear session & logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(`[Logout Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error during logout' });
  }
};

/**
 * @desc    Verify current session cookie & return active user info
 * @route   GET /api/auth/check
 * @access  Private (Protected by protectRoute)
 */
export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error(`[CheckAuth Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error verifying session' });
  }
};
