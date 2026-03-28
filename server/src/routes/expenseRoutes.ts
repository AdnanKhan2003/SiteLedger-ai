import express from 'express';
import { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } from '../controllers/expenseController';

import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authPermission';

const router = express.Router();


router.use(authenticateToken);
router.use(authorizeRoles('admin'));


router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
