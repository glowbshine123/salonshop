import express from 'express';
import * as payoutController from '../controllers/payout.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('AGENT'));

// Update Agent payout configurations (Bank/UPI mapped to Razorpay)
router.post('/settings', payoutController.updatePayoutSettings);

export default router;
