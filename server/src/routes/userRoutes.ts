import express from 'express';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import asyncHandler from '../lib/asyncHandler';
import APIResponse from '../lib/APIResponse';
import APIError from '../lib/APIError';
import { clearAnalyticsCache } from '../lib/redis';

const router = express.Router();


router.get('/workers', authenticateToken, asyncHandler(async (req: any, res) => {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.role === 'admin') {
        const workers = await User.find({ role: 'worker', status: 'active' })
            .select('-passwordHash')
            .sort({ name: 1 });
        return res.json(new APIResponse(200, workers));
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

        return res.json(new APIResponse(200, workers));
    }

    
    res.json(new APIResponse(200, []));
}));


router.get('/workers/:id', authenticateToken, asyncHandler(async (req: any, res) => {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const worker = await User.findById(req.params.id).select('-passwordHash');

    if (!worker) {
        throw new APIError(404, 'Worker not found');
    }

    res.json(new APIResponse(200, worker));
}));


router.put('/workers/:id', authenticateToken, asyncHandler(async (req: any, res) => {
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
        throw new APIError(404, 'Worker not found');
    }

    await clearAnalyticsCache();

    res.json(new APIResponse(200, updatedWorker, "Worker updated successfully"));
}));


router.delete('/workers/:id', authenticateToken, asyncHandler(async (req: any, res) => {
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
        throw new APIError(404, 'Worker not found');
    }

    await clearAnalyticsCache();

    res.json(new APIResponse(200, null, 'Worker deleted successfully'));
}));

export default router;
