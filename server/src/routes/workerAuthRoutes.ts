import { Router } from 'express';
import { registerWorker } from '../controllers/workerAuthController';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();


router.post('/register', authRateLimiter, registerWorker);

export default router;
