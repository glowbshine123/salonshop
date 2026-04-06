import express from 'express';
import * as statsController from '../controllers/stats.controller.js';

const router = express.Router();

router.get('/', statsController.getPublicStats);

export default router;
