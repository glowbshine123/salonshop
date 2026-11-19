import express from 'express';
import * as agentController from '../controllers/agent.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('AGENT'));

router.get('/dashboard', agentController.getDashboard);
router.get('/salons', agentController.getAssignedSalons);
router.get('/transactions', agentController.getCommissionTransactions);
router.get('/settlements', agentController.getSettlements);


export default router;
