import express from 'express';
import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoiceController';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authPermission';

const router = express.Router();

router.use(authenticateToken);

// Assuming all authenticated users can view/create invoices for now, 
// or restrict to admin. Following pattern of invoices/expenses being admin only?
// User said "allow admin to change..." implies admin feature.
router.use(authorizeRoles('admin'));

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
