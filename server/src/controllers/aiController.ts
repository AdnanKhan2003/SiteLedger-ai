import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Project from '../models/Project';
import User, { IUser } from '../models/User';
import Attendance from '../models/Attendance';
import Expense from '../models/Expense';
import Invoice from '../models/Invoice';
import asyncHandler from '../lib/asyncHandler';
import APIResponse from '../lib/APIResponse';
import APIError from '../lib/APIError';
import logger from '../lib/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const getAIInsights = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user.id);
    if (!user) {
        throw new APIError(404, 'User not found');
    }

    let promptData: Record<string, unknown> = {};
    let responseData: Record<string, unknown> = {};

    if (user.role === 'admin') {
        const projects = await Project.find();
        const workers = await User.find({ role: 'worker' });
        const expenses = await Expense.find();
        const invoices = await Invoice.find();
        const attendance = await Attendance.find().populate('worker');

        const totalProjects = projects.length;
        const totalWorkers = workers.length;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenue = invoices
            .filter(inv => new Date(inv.date) >= startOfMonth)
            .reduce((sum: number, inv) => sum + inv.totalAmount, 0);

        const monthlyExpense = expenses
            .filter(exp => new Date(exp.invoiceDate) >= startOfMonth)
            .reduce((sum: number, exp) => sum + exp.totalAmount, 0);

        const monthlyProfit = monthlyRevenue - monthlyExpense;

        const totalExpense = expenses.reduce((sum: number, exp) => sum + exp.totalAmount, 0);
        const totalRevenue = invoices
            .filter(inv => inv.status === 'paid' || inv.status === 'sent')
            .reduce((sum: number, inv) => sum + inv.totalAmount, 0);
        const totalProfit = totalRevenue - totalExpense;

        const projectStats = await Promise.all(projects.map(async (project) => {
            const pid = project._id.toString();

            const pExpenses = expenses.filter(e => e.project?.toString() === pid);
            const pInvoices = invoices.filter(i => (i as any).project?.toString() === pid);

            const pExpenseTotal = pExpenses.reduce((sum: number, e) => sum + e.totalAmount, 0);
            const pRevenueTotal = pInvoices.reduce((sum: number, i) => sum + i.totalAmount, 0);
            const pProfit = pRevenueTotal - pExpenseTotal;

            const pWorkers = workers.filter((w: IUser) =>
                project.workers.some(id => id.toString() === (w._id as any).toString())
            );

            const workerLeaveContext = pWorkers.map((w: IUser) => {
                const leaves = attendance.filter(a => {
                    const populated = a.worker as any;
                    return populated?._id?.toString() === (w._id as any).toString() &&
                        (a.status === 'leave' || a.status === 'absent');
                }).length;
                return { name: w.name, leaves };
            }).filter(w => w.leaves > 0);

            return {
                name: project.name,
                workerCount: pWorkers.length,
                profit: pProfit,
                expense: pExpenseTotal,
                workerLeaves: workerLeaveContext
            };
        }));

        const globalLeaves = workers.map((w: IUser) => {
            const leaves = attendance.filter(a => {
                const populated = a.worker as any;
                return populated?._id?.toString() === (w._id as any).toString() &&
                    (a.status === 'leave' || a.status === 'absent');
            }).length;
            return { name: w.name, leaves };
        })
            .sort((a, b) => b.leaves - a.leaves)
            .slice(0, 5);

        promptData = {
            role: 'admin',
            totalProjects,
            totalWorkers,
            monthlyStats: { revenue: monthlyRevenue, expense: monthlyExpense, profit: monthlyProfit },
            lifetimeStats: { revenue: totalRevenue, expense: totalExpense, profit: totalProfit },
            projectStats,
            globalLeaves
        };

        responseData = promptData;

    } else {
        const myProjects = await Project.find({ workers: user._id });
        const myAttendance = await Attendance.find({ worker: user._id });

        const daysPresent = myAttendance.filter(a => a.status === 'present').length;
        const daysAbsent = myAttendance.filter(a => a.status === 'absent' || a.status === 'leave').length;
        const dailyRate = user.dailyRate || 0;
        const estimatedWages = daysPresent * dailyRate;

        promptData = {
            role: 'worker',
            workerName: user.name,
            projectsInvolved: myProjects.map(p => p.name),
            daysPresent,
            daysAbsent,
            dailyRate,
            estimatedWages
        };

        responseData = promptData;
    }

    let aiText = 'Unable to generate insights at this time.';
    try {
        const prompt = `
        You are a strategic analyst for a construction management platform called SiteLedger.
        Analyze the following JSON data and provide a concise, professional executive summary.

        Data: ${JSON.stringify(promptData)}

        Guidelines:
        - If Admin: Focus on financial health (Profit/Loss), project performance, and highlight any workers with excessive leaves.
        - If Worker: Focus on their attendance reliability and estimated earnings.
        - Use a professional, encouraging but objective tone.
        - Format the output in Markdown (use bullet points, bold text for key figures).
        - Keep it under 200 words.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiText = response.text();
    } catch (geminiError: unknown) {
        logger.error('Gemini API Error', { error: String(geminiError) });

        const err = geminiError as any;
        if (
            err?.status === 429 ||
            err?.message?.toLowerCase().includes('quota') ||
            err?.message?.toLowerCase().includes('limit') ||
            String(geminiError).toLowerCase().includes('quota')
        ) {
            aiText = '⚠️ **Daily Usage Limit Reached**\n\nThe insights feature has reached its daily free usage limit. Please check back tomorrow for fresh insights!\n\n_In the meantime, you can view your raw data stats below._';
        } else {
            aiText = 'Strategic insights are temporarily unavailable. Please check the data below.';
        }
    }

    logger.info('AI insights generated', { role: user.role, userId: (req as any).user.id });
    res.json(new APIResponse(200, {
        insights: aiText,
        data: responseData
    }, 'AI insights generated successfully'));
});
