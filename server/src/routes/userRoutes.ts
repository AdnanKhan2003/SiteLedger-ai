import express from 'express';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();


router.get('/workers', authenticateToken, async (req: any, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        if (currentUser.role === 'admin') {
            const workers = await User.find({ role: 'worker', status: 'active' })
                .select('-passwordHash')
                .sort({ name: 1 });
            return res.json(workers);
        }

        
        if (currentUser.role === 'worker') {
            
            const Project = require('../models/Project').default || require('../models/Project');

            
            const projects = await Project.find({ workers: currentUser._id });

            
            const workerIds = new Set<string>();
            projects.forEach((project: any) => {
                project.workers.forEach((workerId: any) => {
                    workerIds.add(workerId.toString());
                });
            });

            
            const workers = await User.find({
                _id: { $in: Array.from(workerIds) },
                role: 'worker',
                status: 'active'
            }).select('-passwordHash').sort({ name: 1 });

            return res.json(workers);
        }

        
        res.json([]);
    } catch (err) {
        console.error('Error fetching workers:', err);
        res.status(500).json({ error: 'Unable to fetch workers' });
    }
});


router.get('/workers/:id', authenticateToken, async (req: any, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const worker = await User.findById(req.params.id).select('-passwordHash');

        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        res.json(worker);
    } catch (err) {
        console.error('Error fetching worker:', err);
        res.status(500).json({ error: 'Unable to fetch worker' });
    }
});


router.put('/workers/:id', authenticateToken, async (req: any, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { name, phone, role, specialty, dailyRate } = req.body;

        const updatedWorker = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone, role, specialty, dailyRate },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!updatedWorker) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        res.json(updatedWorker);
    } catch (err) {
        console.error('Error updating worker:', err);
        res.status(500).json({ error: 'Unable to update worker' });
    }
});


router.delete('/workers/:id', authenticateToken, async (req: any, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const deletedWorker = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        );

        if (!deletedWorker) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        res.json({ message: 'Worker deleted successfully' });
    } catch (err) {
        console.error('Error deleting worker:', err);
        res.status(500).json({ error: 'Unable to delete worker' });
    }
});

export default router;
