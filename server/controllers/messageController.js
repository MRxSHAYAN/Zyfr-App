import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Friendship from '../models/Friendship.js';
import { triggerPusher } from '../utils/pusher.js';

/**
 * Helper to verify that two users are confirmed friends (status: 'accepted')
 */
const verifyFriends = async (userId1, userId2) => {
  const friendship = await Friendship.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' },
    ],
  });
  return !!friendship;
};

/**
 * @desc    Get chat history between current user and a confirmed friend
 * @route   GET /api/messages/:id
 * @access  Private (Friends-Only)
 */
export const getMessages = async (req, res) => {
  try {
    const { id: friendId } = req.params;
    const currentUserId = req.user._id;

    // STRICT ACCESS CONTROL RULE 1: Check if users are confirmed friends
    const isFriend = await verifyFriends(currentUserId, friendId);
    if (!isFriend) {
      return res.status(403).json({
        message: 'Forbidden: You can only view chat history with confirmed friends.',
        isLocked: true,
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, friendId] },
    }).populate('messages');

    if (!conversation) {
      return res.status(200).json([]);
    }

    // Mark incoming messages as read
    await Message.updateMany(
      {
        conversationId: conversation._id,
        receiverId: currentUserId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.status(200).json(conversation.messages || []);
  } catch (error) {
    console.error('[getMessages Error]:', error.message);
    return res.status(500).json({ message: 'Error retrieving chat history' });
  }
};

/**
 * @desc    Send a message to a confirmed friend
 * @route   POST /api/messages/send/:id
 * @access  Private (Friends-Only)
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, type = 'text', callUrl = '' } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // STRICT ACCESS CONTROL RULE 1: Enforce confirmed friends check
    const isFriend = await verifyFriends(senderId, receiverId);
    if (!isFriend) {
      return res.status(403).json({
        message: 'Forbidden: You can only send direct messages to confirmed friends.',
        isLocked: true,
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [],
      });
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message: message.trim(),
      type,
      callUrl,
    });

    await newMessage.save();
    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Trigger Real-Time Pusher Broadcasts
    // 1. Chat room channel event for active open chat
    await triggerPusher(`chat-${conversation._id}`, 'message:new', newMessage);

    // 2. Receiver user channel event for unread notification/sidebar update
    await triggerPusher(`user-${receiverId}`, 'message:received', {
      message: newMessage,
      sender: {
        _id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName || req.user.username,
        avatar: req.user.avatar,
      },
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error('[sendMessage Error]:', error.message);
    return res.status(500).json({ message: 'Error sending message' });
  }
};

/**
 * @desc    Trigger typing indicator via Pusher
 * @route   POST /api/messages/typing
 * @access  Private
 */
export const sendTypingIndicator = async (req, res) => {
  try {
    const { friendId, isTyping } = req.body;
    const currentUserId = req.user._id;

    const isFriend = await verifyFriends(currentUserId, friendId);
    if (!isFriend) return res.status(403).json({ message: 'Forbidden' });

    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, friendId] },
    });

    if (conversation) {
      await triggerPusher(`chat-${conversation._id}`, 'typing', {
        userId: currentUserId,
        isTyping,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[sendTypingIndicator Error]:', error.message);
    return res.status(500).json({ message: 'Error sending typing status' });
  }
};
