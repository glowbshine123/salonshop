// src/v1/routes/commission.routes.js
import express from 'express';
import * as commissionController from '../controllers/commission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Combined route for listing commissions. Logic inside service/controller handles filter by role.
// Route: /api/v1/commissions/me (Agent) or /api/v1/commissions (Admin)
// To keep it simple and RESTful:
// GET / -> Admin sees all.
// GET /me -> Agent/User sees own.

router.get('/', protect, authorize('ADMIN'), commissionController.getCommissions);
router.get('/me', protect, authorize('AGENT'), commissionController.getCommissions);

export default router;
