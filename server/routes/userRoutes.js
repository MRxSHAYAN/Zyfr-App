import express from 'express';
import { searchUsers, updateProfile, getUserProfile } from '../controllers/userController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protectRoute, searchUsers);
router.put('/profile', protectRoute, updateProfile);
router.get('/:id', protectRoute, getUserProfile);

export default router;
