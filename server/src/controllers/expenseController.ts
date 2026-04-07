import { Request, Response } from "express";
import Expense from "../models/Expense";
import asyncHandler from "../lib/asyncHandler";
import APIResponse from "../lib/APIResponse";
import APIError from "../lib/APIError";
import { clearAnalyticsCache } from "../lib/redis";
import logger from "../lib/logger";

export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = new Expense(req.body);
    const saved = await expense.save();
    await clearAnalyticsCache();
    logger.info('Expense created', { expenseId: saved._id.toString() });
    res
      .status(201)
      .json(new APIResponse(201, saved, "Expense created successfully"));
  },
);

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, category, start, end } = req.query;
  const query: any = {};
  if (projectId) query.project = projectId;
  if (category) query.category = category;
  if (start || end) {
    query.date = {};
    if (start) query.date.$gte = new Date(start as string);
    if (end) query.date.$lte = new Date(end as string);
  }

  const expenses = await Expense.find(query)
    .populate("project", "name")
    .sort({ date: -1 });
  logger.debug('Expenses fetched', { count: expenses.length });
  res.json(new APIResponse(200, expenses, "Expenses fetched successfully"));
});

export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id).populate(
      "project",
      "name",
    );
    if (!expense) throw new APIError(404, "Expense not found");
    logger.debug('Expense fetched by id', { expenseId: req.params.id });
    res.json(new APIResponse(200, expense));
  },
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    await clearAnalyticsCache();
    logger.info('Expense updated', { expenseId: req.params.id });
    res.json(new APIResponse(200, expense, "Expense updated successfully"));
  },
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response) => {
    await Expense.findByIdAndDelete(req.params.id);
    await clearAnalyticsCache();
    logger.info('Expense deleted', { expenseId: req.params.id });
    res.json(new APIResponse(200, null, "Expense deleted successfully"));
  },
);
