'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Trash2, Plus, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function EditExpensePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [vendorInfo, setVendorInfo] = useState({ name: '', address: '' });
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const [expenseData, setExpenseData] = useState({
        invoiceNumber: '',
        invoiceDate: '',
        category: 'materials',
        status: 'pending',
        notes: ''
    });
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const loadJava = async () => {
            if (!id) return;
            try {
                // Fetch Expense and Projects in parallel
                const [expenseRes, projectsRes] = await Promise.all([
                    api.get(`/expenses/${id}`),
                    api.get('/projects')
                ]);

                setProjects(projectsRes.data);

                const data = expenseRes.data;
                setVendorInfo({ name: data.vendor || '', address: '' });
                setExpenseData({
                    invoiceNumber: data.invoiceNumber || '',
                    invoiceDate: data.invoiceDate ? data.invoiceDate.split('T')[0] : '',
                    category: data.category || 'materials',
                    status: data.status || 'pending',
                    notes: data.notes || ''
                });

                // Handle project ID (it might be populated as an object or just an ID string)
                if (data.project) {
                    setSelectedProjectId(typeof data.project === 'object' ? data.project._id : data.project);
                }

                if (data.items && data.items.length > 0) {
                    setItems(data.items.map((i: any, idx: number) => ({ ...i, _id: i._id, id: idx + 1 })));
                } else {
                    setItems([{ id: 1, name: 'Imported Expense', quantity: 1, price: data.totalAmount, amount: data.totalAmount }]);
                }

            } catch (err: any) {
                console.error(err);
                showToast('Failed to load data', 'error');
                router.push('/invoices');
            } finally {
                setLoading(false);
            }
        };
        loadJava();
    }, [id, router, showToast]);

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    const qty = field === 'quantity' ? value : updated.quantity;
                    const price = field === 'price' ? value : updated.price;
                    updated.amount = (Number(qty) || 0) * (Number(price) || 0);
                }
                return updated;
            }
            return item;
        }));
    };

    const addItem = () => {
        const maxId = items.reduce((max, item) => (typeof item.id === 'number' && item.id > max ? item.id : max), 0);
        setItems([...items, { id: maxId + 1, name: '', quantity: 1, price: 0, amount: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const payload = {
                vendor: vendorInfo.name,
                invoiceNumber: expenseData.invoiceNumber,
                invoiceDate: expenseData.invoiceDate,
                category: expenseData.category,
                status: expenseData.status,
                notes: expenseData.notes,
                items: items.map(({ id, ...rest }) => rest),
                totalAmount: calculateTotal(),
                project: selectedProjectId || undefined
            };

            await api.put(`/expenses/${id}`, payload);
            showToast('Expense updated successfully', 'success');
            router.push(`/invoices/${id}`); // Go back to View
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to update expense';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(vendorInfo.name || 'Vendor', 20, 20);
        doc.setFontSize(10);

        doc.setFontSize(16);
        doc.text('INVOICE (RECEIVED)', 140, 20);
        doc.setFontSize(10);
        doc.text(`Invoice #: ${expenseData.invoiceNumber}`, 140, 30);
        doc.text(`Date: ${expenseData.invoiceDate}`, 140, 35);

        // Table
        const tableColumn = ["Item", "Quantity", "Price", "Amount"];
        const tableRows = items.map(item => [
            item.name,
            item.quantity,
            `₹${item.price}`,
            `₹${item.amount.toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 75,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Total: ₹${calculateTotal().toFixed(2)}`, 140, finalY);

        doc.save(`Expense_${expenseData.invoiceNumber || id}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm text-secondary hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </button>
                    <h1 className="text-3xl font-bold">Edit Expense Record</h1>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handleSubmit} disabled={saving} className="btn btn-outline flex-1 md:flex-none justify-center">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                    <button onClick={generatePDF} className="btn btn-primary flex-1 md:flex-none justify-center">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </header>

            <div className="card p-8 bg-white shadow-sm border border-border">
                {/* Header Edit Section */}
                <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-border pb-8 gap-6">
                    <div className="w-full md:w-1/2 pr-0 md:pr-4 space-y-2">
                        <label className="text-xs text-secondary uppercase font-semibold">From (Supplier/Vendor)</label>
                        <input
                            required
                            className="input font-bold text-lg w-full"
                            value={vendorInfo.name}
                            onChange={e => setVendorInfo({ ...vendorInfo, name: e.target.value })}
                            placeholder="Vendor Name"
                        />
                    </div>
                    <div className="text-left md:text-right w-full md:w-1/2 space-y-2">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end">
                            <label className="text-sm font-medium text-secondary w-24 md:w-auto text-left md:text-right">Project</label>
                            <select
                                className="input px-2 py-1 w-full md:w-48 text-left md:text-right"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                <option value="">-- No Project --</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end">
                            <label className="text-sm font-medium text-secondary w-24 md:w-auto text-left md:text-right">No.</label>
                            <input
                                className="input px-2 py-1 w-full md:w-32 text-left md:text-right"
                                value={expenseData.invoiceNumber}
                                onChange={e => setExpenseData({ ...expenseData, invoiceNumber: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end">
                            <label className="text-sm font-medium text-secondary w-24 md:w-auto text-left md:text-right">Date</label>
                            <input
                                type="date"
                                className="input px-2 py-1 w-full md:w-32 text-left md:text-right"
                                value={expenseData.invoiceDate}
                                onChange={e => setExpenseData({ ...expenseData, invoiceDate: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end">
                            <label className="text-sm font-medium text-secondary w-24 md:w-auto text-left md:text-right">Status</label>
                            <select
                                className="input px-2 py-1 w-full md:w-32 text-left md:text-right"
                                value={expenseData.status}
                                onChange={e => setExpenseData({ ...expenseData, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                    <div className="min-w-[700px]">
                        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] gap-4 mb-2 px-2 font-medium text-sm text-secondary">
                            <span>Item / Description</span>
                            <span>Qty</span>
                            <span>Price</span>
                            <span>Amount</span>
                            <span></span>
                        </div>

                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] gap-4 items-center group">
                                    <input
                                        className="input"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="e.g. Cement Bags"
                                    />
                                    <input
                                        type="number"
                                        className="input text-right"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="input text-right"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                    />
                                    <div className="text-right font-medium py-2">
                                        ₹{item.amount.toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button onClick={addItem} className="btn text-primary hover:bg-blue-50 mt-4 text-sm px-0 pl-2">
                    <Plus size={16} /> Add Item
                </button>


                {/* Total Section */}
                <div className="flex justify-end border-t border-border pt-4">
                    <div className="w-full md:w-64">
                        <div className="mb-4">
                            <label className="text-xs text-secondary block mb-1">Notes</label>
                            <textarea
                                className="input text-xs min-h-[60px]"
                                value={expenseData.notes}
                                onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
                                placeholder="Payment terms, delivery notes..."
                            />
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-foreground">
                            <span>Total</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
