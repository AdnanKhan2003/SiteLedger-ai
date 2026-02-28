import { Router } from 'express';
import { registerWorker } from '../controllers/workerAuthController';

const router = Router();


router.post('/register', registerWorker);

export default router;
