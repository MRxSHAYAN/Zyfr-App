import express from 'express';
import { getUsersForSidebar } from '../controllers/userController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// User contacts endpoint for sidebar
router.get('/', protectRoute, getUsersForSidebar);

export default router;
