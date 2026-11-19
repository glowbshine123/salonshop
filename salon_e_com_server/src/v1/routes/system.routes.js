import express from 'express';
import * as systemController from '../controllers/system.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Public endpoint
router.get('/', systemController.getSettings);

// Admin only endpoint
router.put('/', protect, authorize('ADMIN'), upload.single('logo'), systemController.updateSettings);

export default router;
