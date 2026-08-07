import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { getReceiverSocketId, io } from '../socket/socket.js';

/**
 * @desc    Get all messages between authenticated user and specified contact
 * @route   GET /api/messages/:id
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    // Find conversation between sender and receiver
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate('messages');

    if (!conversation) {
      return res.status(200).json([]);
    }

    // Mark messages sent to req.user as read
    await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: senderId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    const messages = conversation.messages;

    return res.status(200).json(messages);
  } catch (error) {
    console.error(`[getMessages Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Error retrieving chat history' });
  }
};

/**
 * @desc    Send a new message to a user
 * @route   POST /api/messages/send/:id
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // 1. Find existing conversation or create a new one
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // 2. Create message document
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim(),
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // Run DB operations concurrently for performance
    await Promise.all([conversation.save(), newMessage.save()]);

    // 3. Socket.io Real-Time Dispatch
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      // Direct 1-on-1 socket emit to receiver
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(`[sendMessage Controller Error]: ${error.message}`);
    return res.status(500).json({ message: 'Error sending message' });
  }
};
