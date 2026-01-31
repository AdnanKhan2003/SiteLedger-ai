'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Receipt, Search, Filter, FileText } from 'lucide-react';
import api from '@/lib/api';

interface Expense {
    _id: string;
    vendor: string;
    totalAmount: number;
    category: string;
    date: string;
    status: string;
    invoiceNumber: string;
    invoiceUrl: string;
}

export default function InvoicesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = expenses.filter(e =>
        e.vendor.toLowerCase().includes(filter.toLowerCase()) ||
        e.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="container">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Invoices & Expenses</h1>
                    <p className="text-secondary mt-1">Track project costs and supplier payments</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/invoices/generate" className="btn btn-outline bg-white">
                        <FileText size={18} /> Generate Invoice
                    </Link>
                    <Link href="/invoices/upload" className="btn btn-primary">
                        <Plus size={18} /> New Expense
                    </Link>
                </div>
            </header>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        className="input pl-10"
                        placeholder="Search vendor or category..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {loading ? (
                <p>Loading expenses...</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-secondary border-2 border-dashed border-border rounded flex flex-col items-center gap-4">
                    <Receipt size={48} />
                    <p>No expenses found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-border rounded bg-card-bg">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-gray-50/50">
                                <th className="p-4 font-semibold text-secondary text-sm">Date</th>
                                <th className="p-4 font-semibold text-secondary text-sm">Vendor</th>
                                <th className="p-4 font-semibold text-secondary text-sm">Category</th>
                                <th className="p-4 font-semibold text-secondary text-sm">Amount</th>
                                <th className="p-4 font-semibold text-secondary text-sm">Status</th>
                                <th className="p-4 font-semibold text-secondary text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((expense) => (
                                <tr key={expense._id} className="border-b border-border last:border-0 hover:bg-gray-50/30 transition-colors">
                                    <td className="p-4 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm font-medium">{expense.vendor}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold">₹{expense.totalAmount}</td>
                                    <td className="p-4">
                                        <span className={`text-sm font-medium capitalize ${expense.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/invoices/${expense._id}`} className="text-primary text-sm font-medium hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
