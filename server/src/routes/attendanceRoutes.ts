import express from 'express';
import { markAttendance, getAttendance } from '../controllers/attendanceController';

import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/', markAttendance);
router.get('/', getAttendance);

export default router;
