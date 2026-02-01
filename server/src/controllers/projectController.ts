import { Request, Response } from 'express';
import Project from '../models/Project';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let query = {};

        if (user.role === 'worker') {
            // Filter projects where this user is assigned
            query = { workers: user.id };
        }

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .populate('workers', 'name workerRole specialty photoUrl'); // Populate from User model
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, client, location, budget, startDate, workers } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Project name is required' });
        }
        if (!client || client.trim().length === 0) {
            return res.status(400).json({ message: 'Client name is required' });
        }
        if (!location || location.trim().length === 0) {
            return res.status(400).json({ message: 'Location is required' });
        }
        if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
            return res.status(400).json({ message: 'Budget must be a positive number' });
        }
        if (!startDate) {
            return res.status(400).json({ message: 'Start date is required' });
        }

        // Validate workers array if provided
        if (workers && Array.isArray(workers)) {
            const mongoose = require('mongoose');
            for (const wId of workers) {
                if (!mongoose.Types.ObjectId.isValid(wId)) {
                    return res.status(400).json({ message: 'Invalid worker ID provided' });
                }
            }
        }

        const project = new Project(req.body);
        const saved = await project.save();
        res.status(201).json(saved);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id).populate('workers', 'name workerRole specialty photoUrl');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { name, client, location, budget, workers } = req.body;

        // Validation
        if (name !== undefined && name.trim().length === 0) {
            return res.status(400).json({ message: 'Project name cannot be empty' });
        }
        if (client !== undefined && client.trim().length === 0) {
            return res.status(400).json({ message: 'Client name cannot be empty' });
        }
        if (location !== undefined && location.trim().length === 0) {
            return res.status(400).json({ message: 'Location cannot be empty' });
        }
        if (budget !== undefined && (isNaN(Number(budget)) || Number(budget) <= 0)) {
            return res.status(400).json({ message: 'Budget must be a positive number' });
        }

        // Validate workers array if provided
        if (workers && Array.isArray(workers)) {
            const mongoose = require('mongoose');
            for (const wId of workers) {
                if (!mongoose.Types.ObjectId.isValid(wId)) {
                    return res.status(400).json({ message: 'Invalid worker ID provided' });
                }
            }
        }

        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
