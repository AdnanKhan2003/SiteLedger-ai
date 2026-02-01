import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import User from '../models/User';

// Mark attendance (Check In / Manual Entry)
export const markAttendance = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let { workerId, date, timeIn, status, notes } = req.body;

        // RBAC Logic
        if (user.role === 'worker') {
            // Worker is marking their own attendance
            // Use the authenticated user's ID directly
            workerId = user.id;

            // WORKER LOGIC: Default to 'pending' if they are marking themselves
            // They cannot verify themselves.
            status = 'pending';
        }
        // If Admin, they can pass any workerId and any status (Verification)

        if (!workerId) {
            return res.status(400).json({ message: 'Worker ID is required.' });
        }

        // Normalize date to start of day if just string
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({ worker: workerId, date: attendanceDate });

        if (existing) {
            // If exists
            if (req.body.timeOut) existing.timeOut = req.body.timeOut;

            // Only update status if customized.
            if (user.role === 'worker') {
                existing.status = 'pending';
            } else if (status) {
                // Admin updating status
                existing.status = status;
            }

            await existing.save();
            return res.json(existing);
        }

        const attendance = new Attendance({
            worker: workerId,
            date: attendanceDate,
            timeIn,
            // If worker, status is 'pending' (set above). If Admin, uses provided or 'present'.
            status: status || 'present',
            notes
        });

        const saved = await attendance.save();
        res.status(201).json(saved);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getAttendance = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { date, workerId } = req.query;
        const query: any = {};

        if (user.role === 'worker') {
            // Worker can only see their own attendance
            query.worker = user.id;
        } else {
            // Admin can filter
            if (workerId) query.worker = workerId;
        }

        if (date) {
            const d = new Date(date as string);
            d.setHours(0, 0, 0, 0);
            query.date = d;
        }

        const list = await Attendance.find(query).populate('worker', 'name workerRole');
        res.json(list);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
