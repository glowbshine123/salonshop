import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import * as rewardController from '../controllers/reward.controller.js';

const router = express.Router();

router.get('/wallet', protect, authorize('SALON_OWNER'), rewardController.getRewardWallet);
router.get('/transactions', protect, authorize('SALON_OWNER'), rewardController.getRewardTransactions);

export default router;
