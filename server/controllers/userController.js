import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

/**
 * @desc    Get all contact users except current logged in user with conversation summaries
 * @route   GET /api/users
 * @access  Private
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch all users except the current user
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

    // Populate conversation previews for each user
    const usersWithPreviews = await Promise.all(
      filteredUsers.map(async (user) => {
        const conversation = await Conversation.findOne({
          participants: { $all: [loggedInUserId, user._id] },
        }).populate({
          path: 'messages',
          options: { sort: { createdAt: -1 }, limit: 1 },
        });

        const lastMessage = conversation?.messages?.[0] || null;

        // Calculate unread count for messages sent by this contact to loggedInUser
        let unreadCount = 0;
        if (conversation) {
          unreadCount = await Conversation.aggregate([
            { $match: { _id: conversation._id } },
            { $unwind: '$messages' },
            {
              $lookup: {
                from: 'messages',
                localField: 'messages',
                foreignField: '_id',
                as: 'msgDetails',
              },
            },
            { $unwind: '$msgDetails' },
            {
              $match: {
                'msgDetails.senderId': user._id,
                'msgDetails.receiverId': loggedInUserId,
                'msgDetails.isRead': false,
              },
            },
            { $count: 'count' },
          ]).then((res) => res[0]?.count || 0);
        }

        return {
          ...user.toObject(),
          lastMessage: lastMessage ? lastMessage.message : '',
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
          unreadCount,
        };
      })
    );

    return res.status(200).json(usersWithPreviews);
  } catch (error) {
    console.error(`[getUsersForSidebar Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Error retrieving user list' });
  }
};
