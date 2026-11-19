// src/v1/routes/cart.routes.js
import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/:productId', cartController.updateCart);
router.delete('/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);
router.get('/total', cartController.getCartTotal);

export default router;
