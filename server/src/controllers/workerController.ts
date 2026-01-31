import { Request, Response } from 'express';
import Worker from '../models/Worker';

export const getWorkers = async (req: Request, res: Response) => {
    try {
        const workers = await Worker.find().sort({ name: 1 });
        res.json(workers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createWorker = async (req: Request, res: Response) => {
    try {
        const worker = new Worker(req.body);
        const savedWorker = await worker.save();
        res.status(201).json(savedWorker);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateWorker = async (req: Request, res: Response) => {
    try {
        const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!worker) return res.status(404).json({ message: 'Worker not found' });
        res.json(worker);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteWorker = async (req: Request, res: Response) => {
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if (!worker) return res.status(404).json({ message: 'Worker not found' });
        res.json({ message: 'Worker deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getWorkerById = async (req: Request, res: Response) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (!worker) return res.status(404).json({ message: 'Worker not found' });
        res.json(worker);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
