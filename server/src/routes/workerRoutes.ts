import express from 'express';
import { getWorkers, createWorker, updateWorker, deleteWorker, getWorkerById } from '../controllers/workerController';

const router = express.Router();

router.get('/', getWorkers);
router.post('/', createWorker);
router.get('/:id', getWorkerById);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

export default router;
