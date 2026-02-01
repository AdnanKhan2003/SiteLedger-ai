import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken } from '../middleware/auth';
import Project from '../models/Project';
import User from '../models/User';
import Attendance from '../models/Attendance';
import Expense from '../models/Expense';
import Invoice from '../models/Invoice';

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.get('/insights', authenticateToken, async (req: any, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let promptData = {};
        let responseData = {};

        if (user.role === 'admin') {
            // ADMIN LOGIC
            const projects = await Project.find();
            const workers = await User.find({ role: 'worker' });
            const expenses = await Expense.find();
            const invoices = await Invoice.find();
            const attendance = await Attendance.find().populate('worker');

            // 1. Overall Stats
            const totalProjects = projects.length;
            const totalWorkers = workers.length;

            // Calculate Profit & Expense
            // Match Dashboard Logic: Monthly Revenue (Start of current month)
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const monthlyRevenue = invoices
                .filter(inv => new Date(inv.date) >= startOfMonth)
                .reduce((sum, inv) => sum + inv.totalAmount, 0);

            const monthlyExpense = expenses
                .filter(exp => new Date(exp.invoiceDate) >= startOfMonth)
                .reduce((sum, exp) => sum + exp.totalAmount, 0);

            const monthlyProfit = monthlyRevenue - monthlyExpense;

            // Lifetime Stats
            const totalExpense = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
            const totalRevenue = invoices
                .filter(inv => inv.status === 'paid' || inv.status === 'sent')
                .reduce((sum, inv) => sum + inv.totalAmount, 0);
            const totalProfit = totalRevenue - totalExpense;

            // 2. Project Wise Stats
            const projectStats = await Promise.all(projects.map(async (project) => {
                const pExpenses = expenses.filter((e: any) => e.project?.toString() === project._id.toString());
                const pInvoices = invoices.filter((i: any) => i.project?.toString() === project._id.toString());

                const pExpenseTotal = pExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
                const pRevenueTotal = pInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
                const pProfit = pRevenueTotal - pExpenseTotal;

                // Workers on this project
                const pWorkers = workers.filter(w => project.workers.includes(w._id));

                // Leaves per worker in this project
                // We need to look at attendance for these workers
                const workerLeaveContext = pWorkers.map(w => {
                    const leaves = attendance.filter(a =>
                        a.worker && a.worker._id.toString() === w._id.toString() &&
                        (a.status === 'leave' || a.status === 'absent')
                    ).length;
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

            // 3. Global Leave Analysis (Workers with high leaves)
            const globalLeaves = workers.map(w => {
                const leaves = attendance.filter(a =>
                    a.worker && a.worker._id.toString() === w._id.toString() &&
                    (a.status === 'leave' || a.status === 'absent')
                ).length;
                return { name: w.name, leaves };
            }).sort((a, b) => b.leaves - a.leaves).slice(0, 5); // Top 5

            promptData = {
                role: 'admin',
                totalProjects,
                totalWorkers,
                monthlyStats: {
                    revenue: monthlyRevenue,
                    expense: monthlyExpense,
                    profit: monthlyProfit
                },
                lifetimeStats: {
                    revenue: totalRevenue,
                    expense: totalExpense,
                    profit: totalProfit
                },
                projectStats,
                globalLeaves
            };

            responseData = promptData;

        } else {
            // WORKER LOGIC
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

        // Generate Insights with Gemini
        let aiText = "Unable to generate insights at this time.";
        try {
            const prompt = `
            You are an AI analyst for a construction management platform called SideLedger AI.
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
        } catch (geminiError) {
            console.error("Gemini API Error:", geminiError);
            aiText = "AI Insights are temporarily unavailable. Please check the data below.";
        }

        res.json({
            insights: aiText,
            data: responseData
        });

    } catch (err) {
        console.error('Error in AI Insights:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) });
    }
});

export default router;
