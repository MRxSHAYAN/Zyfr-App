import express from 'express';
import { getMessages, sendMessage, sendTypingIndicator } from '../controllers/messageController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);
router.post('/typing', protectRoute, sendTypingIndicator);

export default router;
