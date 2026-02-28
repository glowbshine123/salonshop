import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create razorpay order (requires authenticated user because it can be linked to an internal order)
router.post('/create-order', protect, paymentController.createRazorpayOrder);

// Verify payment signature (Razorpay will call frontend -> backend after checkout)
router.post('/verify', paymentController.verifyPayment);

// Razorpay Webhook
import * as webhookController from '../controllers/webhook.controller.js';
router.post('/webhook', webhookController.handleRazorpayWebhook);

export default router;
