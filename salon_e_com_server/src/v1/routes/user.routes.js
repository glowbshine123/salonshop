import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Public endpoint: list active agents
router.get('/agents', userController.getPublicAgents);

// Profile endpoints (protected)
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, upload.single('image'), userController.updateProfile);

// Admin and Agents can list users
router.get('/', protect, authorize('ADMIN', 'AGENT'), userController.getUsers);
router.post('/', protect, authorize('ADMIN', 'AGENT'), userController.createInternal);

// Management endpoints
router.post('/:id/status', protect, authorize('ADMIN', 'AGENT'), userController.updateSalonStatus);
router.post('/:id/assign-agent', protect, authorize('ADMIN'), userController.assignAgent);

router.get('/:id', protect, authorize('ADMIN', 'AGENT'), userController.getUserById);

export default router;
