import express from 'express';
import { getDashboardStats, getAiInsights, getCostBreakdown } from '../controllers/analyticsController';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/ai-insights', getAiInsights);
router.get('/costs', getCostBreakdown);

export default router;
