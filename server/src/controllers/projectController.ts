import { Request, Response } from 'express';
import Project from '../models/Project';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const project = new Project(req.body);
        const saved = await project.save();
        res.status(201).json(saved);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
