import User from '../models/User.js';
import Friendship from '../models/Friendship.js';

/**
 * @desc    Search registered users by username or fullName with Friendship status
 * @route   GET /api/users/search
 * @access  Private (Public User Search to trigger friend requests)
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;

    if (!q || q.trim() === '') {
      return res.status(200).json([]);
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [{ username: searchRegex }, { fullName: searchRegex }],
    }).select('-password');

    const results = await Promise.all(
      users.map(async (user) => {
        const friendship = await Friendship.findOne({
          $or: [
            { requester: currentUserId, recipient: user._id },
            { requester: user._id, recipient: currentUserId },
          ],
        });

        let friendshipStatus = 'none';
        let requestId = null;

        if (friendship) {
          requestId = friendship._id;
          if (friendship.status === 'accepted') {
            friendshipStatus = 'friends';
          } else if (friendship.status === 'pending') {
            if (friendship.requester.toString() === currentUserId.toString()) {
              friendshipStatus = 'pending_sent';
            } else {
              friendshipStatus = 'pending_received';
            }
          }
        }

        return {
          _id: user._id,
          username: user.username,
          fullName: user.fullName || user.username,
          avatar: user.avatar,
          bio: user.bio,
          isOnline: user.isOnline,
          friendshipStatus,
          requestId,
        };
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error('[searchUsers Error]:', error.message);
    return res.status(500).json({ message: 'Error performing user search' });
  }
};

/**
 * @desc    Update personal user profile details (avatarUrl, bio, fullName)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, avatar, bio } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    console.error('[updateProfile Error]:', error.message);
    return res.status(500).json({ message: 'Error updating user profile' });
  }
};

/**
 * @desc    Get user profile details with friendship status (Locked if non-friend)
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friendship = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: targetUserId },
        { requester: targetUserId, recipient: currentUserId },
      ],
    });

    let friendshipStatus = 'none';
    let requestId = null;

    if (friendship) {
      requestId = friendship._id;
      if (friendship.status === 'accepted') {
        friendshipStatus = 'friends';
      } else if (friendship.status === 'pending') {
        friendshipStatus =
          friendship.requester.toString() === currentUserId.toString()
            ? 'pending_sent'
            : 'pending_received';
      }
    }

    const isFriend = friendshipStatus === 'friends';

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName || user.username,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      friendshipStatus,
      requestId,
      isLocked: !isFriend, // Core Access Control Rule 2: Locked Non-Friend Profiles
    });
  } catch (error) {
    console.error('[getUserProfile Error]:', error.message);
    return res.status(500).json({ message: 'Error retrieving user profile' });
  }
};
