import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import asyncHandler from '../lib/asyncHandler';
import APIResponse from '../lib/APIResponse';
import APIError from '../lib/APIError';
import { clearAnalyticsCache } from '../lib/redis';
import logger from '../lib/logger';

export const getWorkers = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = await User.findById((req as any).user.id);

    if (!currentUser) {
        throw new APIError(404, 'User not found');
    }

    if (currentUser.role === 'admin') {
        const workers = await User.find({ role: 'worker', status: 'active' })
            .select('-passwordHash')
            .sort({ name: 1 });
        logger.debug('Admin fetched workers list', { count: workers.length });
        return res.json(new APIResponse(200, workers));
    }

    if (currentUser.role === 'worker') {
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

        logger.debug('Worker fetched co-workers list', { userId: currentUser._id.toString(), count: workers.length });
        return res.json(new APIResponse(200, workers));
    }

    res.json(new APIResponse(200, []));
});

export const getWorkerById = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = await User.findById((req as any).user.id);

    if (!currentUser || currentUser.role !== 'admin') {
        throw new APIError(403, 'Access denied. Admin only.');
    }

    const worker = await User.findById(req.params.id).select('-passwordHash');
    if (!worker) throw new APIError(404, 'Worker not found');

    logger.debug('Worker profile fetched', { workerId: req.params.id });
    res.json(new APIResponse(200, worker));
});

export const updateWorker = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = await User.findById((req as any).user.id);

    if (!currentUser || currentUser.role !== 'admin') {
        throw new APIError(403, 'Access denied. Admin only.');
    }

    const { name, phone, role, specialty, dailyRate } = req.body;

    const updatedWorker = await User.findByIdAndUpdate(
        req.params.id,
        { name, phone, role, specialty, dailyRate },
        { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedWorker) throw new APIError(404, 'Worker not found');

    await clearAnalyticsCache();
    logger.info('Worker updated', { workerId: req.params.id, updatedBy: currentUser._id.toString() });

    res.json(new APIResponse(200, updatedWorker, 'Worker updated successfully'));
});

export const deleteWorker = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = await User.findById((req as any).user.id);

    if (!currentUser || currentUser.role !== 'admin') {
        throw new APIError(403, 'Access denied. Admin only.');
    }

    const deletedWorker = await User.findByIdAndUpdate(
        req.params.id,
        { status: 'inactive' },
        { new: true }
    );

    if (!deletedWorker) throw new APIError(404, 'Worker not found');

    await clearAnalyticsCache();
    logger.info('Worker deactivated', { workerId: req.params.id, deactivatedBy: currentUser._id.toString() });

    res.json(new APIResponse(200, null, 'Worker deleted successfully'));
});
