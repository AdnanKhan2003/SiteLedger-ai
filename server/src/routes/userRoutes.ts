import express from 'express';
import { getWorkers, getWorkerById, updateWorker, deleteWorker } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/workers', getWorkers);
router.get('/workers/:id', getWorkerById);
router.put('/workers/:id', updateWorker);
router.delete('/workers/:id', deleteWorker);

export default router;
