import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Worker from '../models/Worker';

// Mark attendance (Check In / Manual Entry)
export const markAttendance = async (req: Request, res: Response) => {
    try {
        const { workerId, date, timeIn, status, notes } = req.body;

        // Normalize date to start of day if just string
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({ worker: workerId, date: attendanceDate });

        if (existing) {
            // If exists, maybe update timeOut if not provided? Or just update fields.
            if (req.body.timeOut) existing.timeOut = req.body.timeOut;
            if (status) existing.status = status;
            await existing.save();
            return res.json(existing);
        }

        const attendance = new Attendance({
            worker: workerId,
            date: attendanceDate,
            timeIn,
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
        const { date, workerId } = req.query;
        const query: any = {};

        if (date) {
            const d = new Date(date as string);
            d.setHours(0, 0, 0, 0);
            query.date = d;
        }
        if (workerId) query.worker = workerId;

        const list = await Attendance.find(query).populate('worker', 'name role');
        res.json(list);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
