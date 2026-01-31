import { Request, Response } from 'express';
import Project from '../models/Project';
import Worker from '../models/Worker';
import Expense from '../models/Expense';
import Attendance from '../models/Attendance';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalProjects = await Project.countDocuments();
        const activeWorkers = await Worker.countDocuments({ status: 'active' });

        // Calculate total expenses for current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyExpenses = await Expense.aggregate([
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        // recent projects
        const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(3);

        res.json({
            totalProjects,
            activeWorkers,
            monthlyExpenses: monthlyExpenses[0]?.total || 0,
            recentProjects
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAiInsights = async (req: Request, res: Response) => {
    // Mock AI Insights for now, as real prediction needs history data model training
    // In a real app, send data to Python service or OpenAI with historical context

    const insights = [
        {
            type: 'warning',
            text: 'Project "Villa Renovation" is projected to exceed budget by 15% if spending continues at current rate.',
            metric: 'Budget Risk'
        },
        {
            type: 'info',
            text: 'Labor demand is expected to rise next week due to dry weather forecast.',
            metric: 'Labor Forecast'
        },
        {
            type: 'success',
            text: 'Material costs for Cement are 5% lower than market average this month.',
            metric: 'Cost Optimization'
        }
    ];

    res.json(insights);
};

export const getCostBreakdown = async (req: Request, res: Response) => {
    try {
        const breakdown = await Expense.aggregate([
            { $group: { _id: "$category", total: { $sum: "$totalAmount" } } }
        ]);
        res.json(breakdown);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
