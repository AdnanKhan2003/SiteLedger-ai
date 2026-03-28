import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import asyncHandler from '../lib/asyncHandler';
import APIResponse from '../lib/APIResponse';
import APIError from '../lib/APIError';
import { clearAnalyticsCache } from '../lib/redis';

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = new Invoice(req.body);
    const saved = await invoice.save();
    await clearAnalyticsCache();
    res.status(201).json(new APIResponse(201, saved, "Invoice created successfully"));
});

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
    const invoices = await Invoice.find().populate('project', 'name').sort({ createdAt: -1 });
    res.json(new APIResponse(200, invoices, "Invoices fetched successfully"));
});

export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await Invoice.findById(req.params.id).populate('project', 'name');
    if (!invoice) throw new APIError(404, 'Invoice not found');
    res.json(new APIResponse(200, invoice));
});

export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) throw new APIError(404, 'Invoice not found');
    await clearAnalyticsCache();
    res.json(new APIResponse(200, invoice, "Invoice updated successfully"));
});

export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) throw new APIError(404, 'Invoice not found');
    await clearAnalyticsCache();
    res.json(new APIResponse(200, null, 'Invoice deleted successfully'));
});
