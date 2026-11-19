import express from 'express';
import { sendContactInquiry } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/', sendContactInquiry);

export default router;
