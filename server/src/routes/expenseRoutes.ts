import express from 'express';
import { createExpense, getExpenses, scanInvoice, updateExpense, deleteExpense } from '../controllers/expenseController';

const router = express.Router();

router.post('/scan', scanInvoice);
router.post('/', createExpense);
router.get('/', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
