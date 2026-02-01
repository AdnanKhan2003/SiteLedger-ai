import { Request, Response } from 'express';
import Expense from '../models/Expense';
import { parseInvoice } from '../services/ocrService';

export const scanInvoice = async (req: Request, res: Response) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ message: 'Image URL required' });

        const data = await parseInvoice(imageUrl);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createExpense = async (req: Request, res: Response) => {
    try {
        const expense = new Expense(req.body);
        const saved = await expense.save();
        res.status(201).json(saved);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const { projectId, category, start, end } = req.query;
        const query: any = {};
        if (projectId) query.project = projectId;
        if (category) query.category = category;
        if (start || end) {
            query.date = {};
            if (start) query.date.$gte = new Date(start as string);
            if (end) query.date.$lte = new Date(end as string);
        }

        const expenses = await Expense.find(query).sort({ date: -1 });
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getExpenseById = async (req: Request, res: Response) => {
    try {
        const expense = await Expense.findById(req.params.id).populate('project', 'name');
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateExpense = async (req: Request, res: Response) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteExpense = async (req: Request, res: Response) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
