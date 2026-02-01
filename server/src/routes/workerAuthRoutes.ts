import { Router } from 'express';
import { registerWorker } from '../controllers/workerAuthController';

const router = Router();

// Public route for worker self-registration
router.post('/register', registerWorker);

export default router;
