import Friendship from '../models/Friendship.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { triggerPusher } from '../utils/pusher.js';

/**
 * @desc    Send a friend request to another user
 * @route   POST /api/friends/request
 * @access  Private
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id.toString();

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check existing friendship in either direction
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already friends with this user' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'A friend request is already pending between you two' });
      }
      // If previously declined, update status back to pending with new requester
      existing.requester = requesterId;
      existing.recipient = recipientId;
      existing.status = 'pending';
      await existing.save();

      await triggerPusher(`user-${recipientId}`, 'friend_request:received', {
        requestId: existing._id,
        requester: {
          _id: req.user._id,
          username: req.user.username,
          fullName: req.user.fullName || req.user.username,
          avatar: req.user.avatar,
        },
      });

      return res.status(200).json({ message: 'Friend request sent successfully', friendship: existing });
    }

    const newFriendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    await newFriendship.save();

    // Trigger Pusher notification to recipient
    await triggerPusher(`user-${recipientId}`, 'friend_request:received', {
      requestId: newFriendship._id,
      requester: {
        _id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName || req.user.username,
        avatar: req.user.avatar,
      },
    });

    return res.status(201).json({
      message: 'Friend request sent successfully',
      friendship: newFriendship,
    });
  } catch (error) {
    console.error('[sendFriendRequest Error]:', error.message);
    return res.status(500).json({ message: 'Error sending friend request' });
  }
};

/**
 * @desc    Accept an incoming friend request (Auto-unlocks direct conversation)
 * @route   POST /api/friends/accept
 * @access  Private
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId, requesterId } = req.body;
    const currentUserId = req.user._id;

    let friendship;

    if (requestId) {
      friendship = await Friendship.findOne({ _id: requestId, recipient: currentUserId });
    } else if (requesterId) {
      friendship = await Friendship.findOne({
        requester: requesterId,
        recipient: currentUserId,
      });
    }

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found or unauthorized' });
    }

    friendship.status = 'accepted';
    await friendship.save();

    const otherUserId = friendship.requester;

    // AUTO-UNLOCK LOGIC: Create or fetch existing 1-on-1 Conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, otherUserId],
        messages: [],
      });
      await conversation.save();
    }

    // Trigger Pusher event to original requester
    await triggerPusher(`user-${otherUserId}`, 'friend_request:accepted', {
      requestId: friendship._id,
      acceptor: {
        _id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName || req.user.username,
        avatar: req.user.avatar,
      },
      conversationId: conversation._id,
    });

    return res.status(200).json({
      message: 'Friend request accepted! Conversation unlocked.',
      friendship,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('[acceptFriendRequest Error]:', error.message);
    return res.status(500).json({ message: 'Error accepting friend request' });
  }
};

/**
 * @desc    Decline a friend request
 * @route   POST /api/friends/decline
 * @access  Private
 */
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId, requesterId } = req.body;
    const currentUserId = req.user._id;

    let friendship;
    if (requestId) {
      friendship = await Friendship.findOne({ _id: requestId, recipient: currentUserId });
    } else if (requesterId) {
      friendship = await Friendship.findOne({ requester: requesterId, recipient: currentUserId });
    }

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    await Friendship.findByIdAndDelete(friendship._id);

    return res.status(200).json({ message: 'Friend request declined successfully' });
  } catch (error) {
    console.error('[declineFriendRequest Error]:', error.message);
    return res.status(500).json({ message: 'Error declining friend request' });
  }
};

/**
 * @desc    Get confirmed friends list (status: accepted) with last message info
 * @route   GET /api/friends/list
 * @access  Private
 */
export const getFriendList = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const friendships = await Friendship.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: 'accepted',
    }).populate('requester recipient', '_id username fullName avatar bio isOnline lastSeen');

    const friendsList = await Promise.all(
      friendships.map(async (f) => {
        const friendUser = f.requester._id.toString() === currentUserId.toString() ? f.recipient : f.requester;

        // Fetch conversation & last message
        const conversation = await Conversation.findOne({
          participants: { $all: [currentUserId, friendUser._id] },
        }).populate('messages');

        let lastMessage = null;
        let unreadCount = 0;

        if (conversation && conversation.messages && conversation.messages.length > 0) {
          const lastMsgDoc = await Message.findById(conversation.messages[conversation.messages.length - 1]);
          if (lastMsgDoc) {
            lastMessage = {
              _id: lastMsgDoc._id,
              message: lastMsgDoc.message,
              type: lastMsgDoc.type,
              senderId: lastMsgDoc.senderId,
              createdAt: lastMsgDoc.createdAt,
            };
          }

          // Count unread messages received by current user
          unreadCount = await Message.countDocuments({
            conversationId: conversation._id,
            receiverId: currentUserId,
            isRead: false,
          });
        }

        return {
          _id: friendUser._id,
          username: friendUser.username,
          fullName: friendUser.fullName || friendUser.username,
          avatar: friendUser.avatar,
          bio: friendUser.bio,
          isOnline: friendUser.isOnline,
          lastSeen: friendUser.lastSeen,
          friendshipId: f._id,
          conversationId: conversation ? conversation._id : null,
          lastMessage,
          unreadCount,
        };
      })
    );

    return res.status(200).json(friendsList);
  } catch (error) {
    console.error('[getFriendList Error]:', error.message);
    return res.status(500).json({ message: 'Error fetching friends list' });
  }
};

/**
 * @desc    Get pending incoming and outgoing friend requests
 * @route   GET /api/friends/requests
 * @access  Private
 */
export const getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const incoming = await Friendship.find({ recipient: currentUserId, status: 'pending' }).populate(
      'requester',
      '_id username fullName avatar bio'
    );

    const outgoing = await Friendship.find({ requester: currentUserId, status: 'pending' }).populate(
      'recipient',
      '_id username fullName avatar bio'
    );

    return res.status(200).json({
      incoming: incoming.map((reqItem) => ({
        requestId: reqItem._id,
        user: reqItem.requester,
        createdAt: reqItem.createdAt,
      })),
      outgoing: outgoing.map((reqItem) => ({
        requestId: reqItem._id,
        user: reqItem.recipient,
        createdAt: reqItem.createdAt,
      })),
    });
  } catch (error) {
    console.error('[getPendingRequests Error]:', error.message);
    return res.status(500).json({ message: 'Error fetching pending requests' });
  }
};
