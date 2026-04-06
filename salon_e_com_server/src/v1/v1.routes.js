// src/v1/v1.routes.js
import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'API V1 is active', timestamp: new Date() });
});

// Diagnostic route to report presence of key third-party configurations (no secrets returned)
import razorpay from '../config/razorpay.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

router.get('/health/config', (req, res) => {
    res.json({
        cloudinaryConfigured: Boolean(isCloudinaryConfigured),
        razorpayEnabled: Boolean(razorpay && razorpay.isEnabled)
    });
});

// Module Routes will be mounted here
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import commissionRoutes from './routes/commission.routes.js';
import cartRoutes from './routes/cart.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import agentRoutes from './routes/agent.routes.js';
import adminRoutes from './routes/admin.routes.js';

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
// Payments
import paymentRoutes from './routes/payment.routes.js';
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/commissions', commissionRoutes);
router.use('/cart', cartRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/agent', agentRoutes);
router.use('/admin', adminRoutes);

import systemRoutes from './routes/system.routes.js';
router.use('/settings', systemRoutes);

import payoutRoutes from './routes/payout.routes.js';
router.use('/payout', payoutRoutes);

import rewardRoutes from './routes/reward.routes.js';
router.use('/rewards', rewardRoutes);

import statsRoutes from './routes/stats.routes.js';
router.use('/stats', statsRoutes);

import contactRoutes from './routes/contact.routes.js';
router.use('/contact', contactRoutes);

export default router;
