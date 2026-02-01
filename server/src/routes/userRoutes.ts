import express from 'express';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET WORKERS
router.get('/workers', authenticateToken, async (req: any, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Admin can see all workers
        if (currentUser.role === 'admin') {
            const workers = await User.find({ role: 'worker', status: 'active' })
                .select('-passwordHash')
                .sort({ name: 1 });
            return res.json(workers);
        }

        // Worker can only see colleagues from same projects
        if (currentUser.role === 'worker') {
            // Use require to avoid circular dependency issues if any, or just import normally if Project allows
            const Project = require('../models/Project').default || require('../models/Project');

            // Find all projects this worker is assigned to
            const projects = await Project.find({ workers: currentUser._id });

            // Collect all unique worker IDs from these projects
            const workerIds = new Set<string>();
            projects.forEach((project: any) => {
                project.workers.forEach((workerId: any) => {
                    workerIds.add(workerId.toString());
                });
            });

            // Fetch only these workers
            const workers = await User.find({
                _id: { $in: Array.from(workerIds) },
                role: 'worker',
                status: 'active'
            }).select('-passwordHash').sort({ name: 1 });

            return res.json(workers);
        }

        // Default: return empty array
        res.json([]);
    } catch (err) {
        console.error('Error fetching workers:', err);
        res.status(500).json({ error: 'Unable to fetch workers' });
    }
});

export default router;
