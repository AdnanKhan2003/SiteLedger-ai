import express from 'express';
import { getDashboardStats, getCostBreakdown, getProjectProfitability } from '../controllers/analyticsController';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/costs', getCostBreakdown);
router.get('/profitability', getProjectProfitability);

export default router;
