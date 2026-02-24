import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/', categoryController.getCategories);
router.post('/', protect, authorize('ADMIN'), categoryController.createCategory);
router.patch('/:id', protect, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

export default router;