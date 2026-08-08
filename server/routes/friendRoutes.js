import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendList,
  getPendingRequests,
} from '../controllers/friendController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protectRoute, sendFriendRequest);
router.post('/accept', protectRoute, acceptFriendRequest);
router.post('/decline', protectRoute, declineFriendRequest);
router.get('/list', protectRoute, getFriendList);
router.get('/requests', protectRoute, getPendingRequests);

export default router;
