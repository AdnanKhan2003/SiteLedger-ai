import express from 'express';
import { markAttendance, getAttendance } from '../controllers/attendanceController';

const router = express.Router();

router.post('/', markAttendance);
router.get('/', getAttendance);

export default router;
