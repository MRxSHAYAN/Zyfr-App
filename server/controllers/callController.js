import axios from 'axios';
import Friendship from '../models/Friendship.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { triggerPusher } from '../utils/pusher.js';

/**
 * @desc    Create Daily.co Video Room & send Call Invite to friend
 * @route   POST /api/calls/create-room
 * @access  Private (Friends-Only Enforcement)
 */
export const createCallRoom = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // STRICT ACCESS CONTROL RULE 1: Verify users are confirmed friends
    const isFriend = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: recipientId, status: 'accepted' },
        { requester: recipientId, recipient: currentUserId, status: 'accepted' },
      ],
    });

    if (!isFriend) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You can only initiate video calls with confirmed friends.' });
    }

    // Create unique room name
    const roomName = `zyfr-call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let roomUrl = `https://zyfr.daily.co/${roomName}`;

    // If Daily.co API key is configured, create dynamic room via Daily REST API
    const dailyApiKey = process.env.DAILY_API_KEY;
    if (dailyApiKey) {
      try {
        const response = await axios.post(
          'https://api.daily.co/v1/rooms',
          {
            name: roomName,
            properties: {
              exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
              enable_chat: true,
              enable_screenshare: true,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${dailyApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.data && response.data.url) {
          roomUrl = response.data.url;
        }
      } catch (dailyErr) {
        console.warn('[Daily.co API Warning]: Could not create room via API, using fallback room URL:', dailyErr.message);
      }
    }

    // Find 1-on-1 Conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, recipientId],
        messages: [],
      });
      await conversation.save();
    }

    // Save call invite message into conversation
    const callMessage = new Message({
      conversationId: conversation._id,
      senderId: currentUserId,
      receiverId: recipientId,
      message: `🎥 Instant Video Call Invite`,
      type: 'call_invite',
      callUrl: roomUrl,
    });

    await callMessage.save();
    conversation.messages.push(callMessage._id);
    await conversation.save();

    // Broadcast Real-Time Incoming Call Notification via Pusher
    await triggerPusher(`user-${recipientId}`, 'call:invite', {
      roomUrl,
      conversationId: conversation._id,
      caller: {
        _id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName || req.user.username,
        avatar: req.user.avatar,
      },
      message: callMessage,
    });

    // Also trigger chat event so chat box updates instantly
    await triggerPusher(`chat-${conversation._id}`, 'message:new', callMessage);

    return res.status(200).json({
      roomUrl,
      conversationId: conversation._id,
      message: callMessage,
    });
  } catch (error) {
    console.error('[createCallRoom Error]:', error.message);
    return res.status(500).json({ message: 'Error initiating video call' });
  }
};
