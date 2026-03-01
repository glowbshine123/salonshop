import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/settlements', adminController.getAllSettlements);
router.post('/settlements/trigger-auto', adminController.triggerAutoDisbursement);

router.get('/commission-slabs', adminController.getSlabs);
router.put('/commission-slabs/:id', adminController.updateSlab);
router.post('/commission-slabs', adminController.createSlab);

// Dashboard Stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

export default router;
