'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Receipt, Search, Filter, FileText, Ban, Trash2, Eye, Pencil, Send } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface Expense {
    _id: string;
    vendor: string;
    totalAmount: number;
    category: string;
    invoiceDate: string;
    status: string;
    invoiceNumber: string;
    invoiceUrl: string;
    project?: { name: string };
}

interface Invoice {
    _id: string;
    invoiceNumber: string;
    clientName: string;
    date: string;
    totalAmount: number;
    status: string;
    project?: { name: string };
}

export default function InvoicesPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'expenses' | 'invoices'>('expenses');

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    // Delete state
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string; type: 'expense' | 'invoice' }>({
        isOpen: false,
        id: null,
        name: '',
        type: 'expense'
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'expenses') {
                const res = await api.get('/expenses');
                setExpenses(res.data);
            } else {
                const res = await api.get('/invoices'); // Outgoing invoices
                setInvoices(res.data);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id: string, name: string, type: 'expense' | 'invoice') => {
        setDeleteModal({ isOpen: true, id, name, type });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ ...deleteModal, isOpen: false });
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            const endpoint = deleteModal.type === 'expense' ? `/expenses/${deleteModal.id}` : `/invoices/${deleteModal.id}`;
            await api.delete(endpoint);

            if (deleteModal.type === 'expense') {
                setExpenses(expenses.filter(e => e._id !== deleteModal.id));
            } else {
                setInvoices(invoices.filter(i => i._id !== deleteModal.id));
            }

            showToast(`${deleteModal.type === 'expense' ? 'Expense' : 'Invoice'} deleted successfully`, 'success');
            closeDeleteModal();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete item';
            showToast(errorMessage, 'error');
        } finally {
            setDeleting(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <Ban size={48} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Access Restricted</h2>
                <p className="text-secondary mt-2 max-w-md">
                    Only Administrators can view and manage invoices and expenses.
                </p>
            </div>
        );
    }

    const filteredExpenses = expenses.filter(e =>
        e.vendor.toLowerCase().includes(filter.toLowerCase()) ||
        e.category.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredInvoices = invoices.filter(i =>
        i.clientName.toLowerCase().includes(filter.toLowerCase()) ||
        i.invoiceNumber.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="container">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:sticky md:top-0 md:z-10 md:bg-background/95 md:backdrop-blur md:pt-4 md:pb-4 md:-mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Invoices & Expenses</h1>
                    <p className="text-secondary mt-1">Manage incoming bills and outgoing invoices</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link href="/invoices/generate" className="btn btn-outline bg-white flex-1 md:flex-none">
                        <FileText size={18} /> New Client Invoice
                    </Link>
                    <Link href="/invoices/received/new" className="btn btn-primary flex-1 md:flex-none">
                        <Plus size={18} /> Record Expense
                    </Link>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'expenses'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-secondary hover:text-foreground'
                        }`}
                >
                    Received (Expenses)
                </button>
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'invoices'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-secondary hover:text-foreground'
                        }`}
                >
                    Sent (Client Invoices)
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        className="input pl-10"
                        placeholder={activeTab === 'expenses' ? "Search vendor..." : "Search client or invoice #..."}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <p className="text-secondary">Loading {activeTab}...</p>
                </div>
            ) : (activeTab === 'expenses' ? filteredExpenses : filteredInvoices).length === 0 ? (
                <div className="text-center py-16 text-secondary border-2 border-dashed border-border rounded flex flex-col items-center gap-4">
                    <Receipt size={48} />
                    <p>No {activeTab} found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-border rounded bg-card-bg">
                    {activeTab === 'expenses' ? (
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="border-b border-border bg-gray-50/50">
                                    <th className="p-4 font-semibold text-secondary text-sm">Date</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Project</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Vendor</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Category</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Amount</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Status</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense._id} className="border-b border-border last:border-0 hover:bg-gray-50/30 transition-colors">
                                        <td className="p-4 text-sm">{new Date(expense.invoiceDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm font-medium text-blue-600">
                                            {/* @ts-ignore - Populate might be imperfectly typed here */}
                                            {expense.project?.name || '-'}
                                        </td>
                                        <td className="p-4 text-sm font-medium">{expense.vendor}</td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold">₹{expense.totalAmount}</td>
                                        <td className="p-4">
                                            <span className={`text-sm font-medium capitalize ${expense.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Link href={`/invoices/${expense._id}`} className="text-primary hover:text-primary/80">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link href={`/invoices/${expense._id}/edit`} className="text-secondary hover:text-foreground">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(expense._id, expense.vendor, 'expense')}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="border-b border-border bg-gray-50/50">
                                    <th className="p-4 font-semibold text-secondary text-sm">Date</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Project</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Invoice #</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Client</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Amount</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Status</th>
                                    <th className="p-4 font-semibold text-secondary text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="border-b border-border last:border-0 hover:bg-gray-50/30 transition-colors">
                                        <td className="p-4 text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm font-medium text-blue-600">
                                            {/* @ts-ignore */}
                                            {inv.project?.name || '-'}
                                        </td>
                                        <td className="p-4 text-sm font-mono">{inv.invoiceNumber}</td>
                                        <td className="p-4 text-sm font-medium">{inv.clientName}</td>
                                        <td className="p-4 font-semibold">₹{inv.totalAmount}</td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Link href={`/invoices/sent/${inv._id}`} className="text-primary hover:text-primary/80">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link href={`/invoices/sent/${inv._id}/edit`} className="text-secondary hover:text-foreground">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(inv._id, inv.invoiceNumber, 'invoice')}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title={`Delete ${deleteModal.type === 'expense' ? 'Expense' : 'Invoice'}`}
                message={`Are you sure you want to delete the ${deleteModal.type === 'expense' ? 'invoice from' : 'invoice #'} "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
}
