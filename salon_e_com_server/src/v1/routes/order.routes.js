// src/v1/routes/order.routes.js
import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Public/User routes
// Public/User routes
router.post('/', protect, orderController.createOrder); // Customer or Agent can buy
router.get('/me', protect, orderController.getMyOrders);
router.post('/:id/cancel', protect, orderController.cancelOrder);
// Agent assigned orders
router.get('/assigned', protect, authorize('AGENT'), orderController.getAssignedOrders);

// Agent routes
router.get('/agent', protect, authorize('AGENT'), orderController.getAgentOrders);

// Admin routes
router.get('/', protect, authorize('ADMIN'), orderController.getAllOrders);
router.get('/unread-count', protect, authorize('ADMIN'), orderController.getUnreadOrdersCount);
router.patch('/mark-as-viewed', protect, authorize('ADMIN'), orderController.markOrdersAsViewed);
router.patch('/:id/status', protect, authorize('ADMIN'), orderController.updateStatus);
// Alias for PUT as requested
router.put('/:id/status', protect, authorize('ADMIN'), orderController.updateStatus);
// Admin assign agent to order
router.patch('/:id/assign-agent', protect, authorize('ADMIN'), orderController.assignAgent);

export default router;
