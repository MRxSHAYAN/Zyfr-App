import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper Utility to generate JWT and attach HTTP-Only cookie to response.
 * Also returns token string so clients can send Bearer token in headers if cookies are blocked.
 */
const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_whatsapp_clone_2026',
    { expiresIn: '15d' }
  );

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 Days
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
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
    const { username, fullName, email, password, avatar, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email address is already registered' });
      }
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const displayName = fullName && fullName.trim() !== '' ? fullName.trim() : username.trim();
    const avatarUrl =
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00a884&color=fff&bold=true`;

    const newUser = new User({
      username: username.trim(),
      fullName: displayName,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: avatarUrl,
      bio: bio || 'Hey there! I am using ZYFR.',
      isOnline: true,
    });

    await newUser.save();

    const token = generateTokenAndSetCookie(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      avatar: newUser.avatar,
      bio: newUser.bio,
      isOnline: newUser.isOnline,
      lastSeen: newUser.lastSeen,
      token,
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
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please enter your email/username and password' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.trim() }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName || user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      token,
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
export const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    }
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
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json(user);
  } catch (error) {
    console.error(`[CheckAuth Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error verifying session' });
  }
};
