import express from 'express';
import { createCallRoom } from '../controllers/callController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-room', protectRoute, createCallRoom);

export default router;
