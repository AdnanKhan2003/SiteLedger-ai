import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAIInsights } from '../controllers/aiController';

const router = express.Router();

router.get('/insights', authenticateToken, getAIInsights);

export default router;
