import express from 'express';
import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoiceController';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authPermission';

const router = express.Router();

router.use(authenticateToken);




router.use(authorizeRoles('admin'));

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
