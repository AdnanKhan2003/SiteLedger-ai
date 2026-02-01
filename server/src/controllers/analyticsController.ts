import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import User from '../models/User';
import Expense from '../models/Expense';
import Attendance from '../models/Attendance';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalProjects = await Project.countDocuments();
        const activeWorkers = await User.countDocuments({ role: 'worker', status: 'active' });

        // Calculate total expenses for current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyExpenses = await Expense.aggregate([
            { $match: { invoiceDate: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const monthlyRevenue = await mongoose.model('Invoice').aggregate([
            { $match: { date: { $gte: startOfMonth } } }, // Assuming Invoice has 'date', let's check schema if needed, but standard is 'date' or 'createdAt'
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        // recent projects
        const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(3);

        res.json({
            totalProjects,
            activeWorkers,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
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
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const breakdown = await Expense.aggregate([
            { $match: { invoiceDate: { $gte: startOfMonth } } },
            { $group: { _id: "$category", total: { $sum: "$totalAmount" } } }
        ]);
        res.json(breakdown);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjectProfitability = async (req: Request, res: Response) => {
    try {
        // 1. Get all projects
        const projects = await Project.find({}, 'name _id status');

        // 2. Aggregate Invoices (Revenue) by Project
        const revenueMap: Record<string, number> = {};
        const invoices = await mongoose.model('Invoice').aggregate([
            { $match: { project: { $exists: true, $ne: null } } },
            { $group: { _id: "$project", total: { $sum: "$totalAmount" } } }
        ]);
        invoices.forEach((inv: any) => {
            if (inv._id) revenueMap[inv._id.toString()] = inv.total;
        });

        // 3. Aggregate Expenses (Cost) by Project
        const costMap: Record<string, number> = {};
        const expenses = await Expense.aggregate([
            { $match: { project: { $exists: true, $ne: null } } },
            { $group: { _id: "$project", total: { $sum: "$totalAmount" } } }
        ]);
        expenses.forEach((exp: any) => {
            if (exp._id) costMap[exp._id.toString()] = exp.total;
        });

        // 4. Merge Data
        const report = projects.map(p => {
            const pid = p._id.toString();
            const revenue = revenueMap[pid] || 0;
            const cost = costMap[pid] || 0;
            return {
                id: pid,
                name: p.name,
                status: p.status,
                revenue,
                cost,
                profit: revenue - cost,
                margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
            };
        }).sort((a, b) => b.revenue - a.revenue); // Sort by highest revenue

        res.json(report);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
