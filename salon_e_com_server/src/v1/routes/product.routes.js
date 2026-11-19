// src/v1/routes/product.routes.js
import express from 'express';
import * as productController from '../controllers/product.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Review Routes
router.get('/user/my-reviews', protect, reviewController.getMyReviews);
router.get('/:productId/reviews', reviewController.getReviews);
router.post('/:productId/reviews', protect, reviewController.createReview);

// Admin only routes
// Admin only routes
router.post('/', protect, authorize('ADMIN'), upload.array('images', 5), productController.createProduct);
router.patch('/:id', protect, authorize('ADMIN'), upload.array('images', 5), productController.updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), productController.deleteProduct);

// Public/User routes (Get single product by ID) matches /:id so must be after specific routes or handled carefully.
// Since it's dynamic, putting it last is safer if we had other specific sub-routes like /featured
// router.get('/:id', productController.getProductById);

export default router;
