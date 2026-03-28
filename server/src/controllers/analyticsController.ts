import { Request, Response } from "express";
import mongoose from "mongoose";
import Project from "../models/Project";
import User from "../models/User";
import Expense from "../models/Expense";
import Attendance from "../models/Attendance";
import asyncHandler from "../lib/asyncHandler";
import APIResponse from "../lib/APIResponse";
import redis, { isRedisConnected } from "../lib/redis";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const cacheKey = "dashboard:stats";
    const cachedData = (redis && isRedisConnected) ? await redis.get(cacheKey) : null;
    if (cachedData) {
      return res.json(
        new APIResponse(
          200,
          JSON.parse(cachedData),
          "Dashboard stats fetched from cache",
        ),
      );
    }

    const totalProjects = await Project.countDocuments();
    const activeWorkers = await User.countDocuments({
      role: "worker",
      status: "active",
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyExpenses = await Expense.aggregate([
      { $match: { invoiceDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const monthlyRevenue = await mongoose
      .model("Invoice")
      .aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(3);

    const result = {
      totalProjects,
      activeWorkers,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      recentProjects,
    };

    if (redis && isRedisConnected) {
        await redis.setex(cacheKey, 600, JSON.stringify(result));
    }

    res.json(
      new APIResponse(
        200,
        result,
        "Dashboard stats fetched successfully",
      ),
    );
  },
);

export const getCostBreakdown = asyncHandler(
  async (req: Request, res: Response) => {
    const { period } = req.query;
    const isMonthly = period === 'month';
    const cacheKey = isMonthly ? "analytics:costs:month" : "analytics:costs:alltime";
    
    const cachedData = (redis && isRedisConnected) ? await redis.get(cacheKey) : null;
    if (cachedData) {
      return res.json(
        new APIResponse(
          200,
          JSON.parse(cachedData),
          `Cost breakdown (${isMonthly ? 'monthly' : 'all-time'}) fetched from cache`,
        ),
      );
    }

    const query: any = {};
    if (isMonthly) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query.invoiceDate = { $gte: startOfMonth };
    }

    const breakdown = await Expense.aggregate([
      { $match: query },
      { $group: { _id: "$category", total: { $sum: "$totalAmount" } } },
    ]);

    if (redis && isRedisConnected) {
        await redis.setex(cacheKey, 600, JSON.stringify(breakdown));
    }

    res.json(
      new APIResponse(200, breakdown, "Cost breakdown fetched successfully"),
    );
  },
);

export const getProjectProfitability = asyncHandler(
  async (req: Request, res: Response) => {
    const cacheKey = "analytics:profitability";
    const cachedData = (redis && isRedisConnected) ? await redis.get(cacheKey) : null;
    if (cachedData) {
      return res.json(
        new APIResponse(
          200,
          JSON.parse(cachedData),
          "Project profitability report fetched from cache",
        ),
      );
    }

    const projects = await Project.find({}, "name _id status");

    const revenueMap: Record<string, number> = {};
    const invoices = await mongoose
      .model("Invoice")
      .aggregate([
        { $match: { project: { $exists: true, $ne: null } } },
        { $group: { _id: "$project", total: { $sum: "$totalAmount" } } },
      ]);
    invoices.forEach((inv: any) => {
      if (inv._id) revenueMap[inv._id.toString()] = inv.total;
    });

    const costMap: Record<string, number> = {};
    const expenses = await Expense.aggregate([
      { $match: { project: { $exists: true, $ne: null } } },
      { $group: { _id: "$project", total: { $sum: "$totalAmount" } } },
    ]);
    expenses.forEach((exp: any) => {
      if (exp._id) costMap[exp._id.toString()] = exp.total;
    });

    const report = projects
      .map((p) => {
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
          margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    if (redis && isRedisConnected) {
        await redis.setex(cacheKey, 600, JSON.stringify(report)); // 10 minutes cache
    }

    res.json(
      new APIResponse(
        200,
        report,
        "Project profitability report fetched successfully",
      ),
    );
  },
);
