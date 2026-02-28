import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import User from '../models/User';


export const markAttendance = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let { workerId, date, timeIn, status, notes } = req.body;

        
        if (user.role === 'worker') {
            
            
            workerId = user.id;

            
            
            status = 'pending';
        }
        

        if (!workerId) {
            return res.status(400).json({ message: 'Worker ID is required.' });
        }

        
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({ worker: workerId, date: attendanceDate });

        if (existing) {
            
            if (req.body.timeOut) existing.timeOut = req.body.timeOut;

            
            if (user.role === 'worker') {
                existing.status = 'pending';
            } else if (status) {
                
                existing.status = status;
            }

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
        const user = (req as any).user;
        const { date, workerId } = req.query;
        const query: any = {};

        if (user.role === 'worker') {
            
            query.worker = user.id;
        } else {
            
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
