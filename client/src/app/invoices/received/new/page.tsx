'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Download, FileText, Save, Loader2, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function NewExpensePage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    // "From" the Vendor
    const [vendorInfo, setVendorInfo] = useState({
        name: '',
        address: '',
        gstin: '',
    });

    // "To" Us
    const [myInfo, setMyInfo] = useState({
        name: 'SideLedger Construction',
        address: '123 Business Park, Mumbai, India',
    });

    const [expenseData, setExpenseData] = useState({
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        category: 'materials',
        status: 'pending',
        notes: ''
    });

    const [items, setItems] = useState([
        { id: 1, name: 'Materials', quantity: 1, price: 0, amount: 0 }
    ]);

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
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        setItems([...items, { id: newId, name: '', quantity: 1, price: 0, amount: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const handleSave = async () => {
        if (!vendorInfo.name) {
            showToast('Vendor Name is required', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                vendor: vendorInfo.name,
                invoiceNumber: expenseData.invoiceNumber,
                invoiceDate: expenseData.date,
                category: expenseData.category,
                status: expenseData.status,
                notes: expenseData.notes,
                items: items.map(({ id, ...rest }) => rest),
                totalAmount: calculateTotal(),
                // Extra metadata could go to notes or new fields if schema changes, 
                // but Expense schema is strict. We'll put extra info in notes if needed.
            };

            await api.post('/expenses', payload);
            showToast('Expense recorded successfully!', 'success');
            router.push('/invoices');
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || 'Failed to save expense', 'error');
        } finally {
            setSaving(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header - Received Invoice is FROM Vendor
        doc.setFontSize(22);
        doc.text(vendorInfo.name || 'Vendor Name', 20, 20);
        doc.setFontSize(10);
        doc.text(vendorInfo.address || '', 20, 30);
        // doc.text(`GSTIN: ${vendorInfo.gstin}`, 20, 35);

        doc.setFontSize(16);
        doc.text('INVOICE (RECEIVED)', 140, 20);
        doc.setFontSize(10);
        doc.text(`Invoice #: ${expenseData.invoiceNumber}`, 140, 30);
        doc.text(`Date: ${expenseData.date}`, 140, 35);

        // Bill To (Us)
        doc.text('Bill To:', 20, 50);
        doc.setFontSize(12);
        doc.text(myInfo.name, 20, 55);
        doc.setFontSize(10);
        doc.text(myInfo.address, 20, 60);

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

        doc.save(`Expense_${expenseData.invoiceNumber || 'draft'}.pdf`);
    };

    return (
        <div className="container max-w-4xl py-8">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm text-secondary hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </button>
                    <h1 className="text-3xl font-bold">Record Received Invoice</h1>
                    <p className="text-secondary">Enter details of a bill/invoice you received</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn btn-outline">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Record
                    </button>
                    <button onClick={generatePDF} className="btn btn-primary">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </header>

            <div className="card p-8 bg-white shadow-sm border border-border">
                {/* Header Section (Vendor Info and Invoice Meta) */}
                <div className="flex justify-between mb-8 border-b border-border pb-8">
                    <div className="w-1/2 pr-4 space-y-2">
                        <label className="text-xs text-secondary uppercase font-semibold">From (Supplier/Vendor)</label>
                        <input
                            className="input font-bold text-lg"
                            value={vendorInfo.name}
                            onChange={(e) => setVendorInfo({ ...vendorInfo, name: e.target.value })}
                            placeholder="Vendor Name"
                        />
                        <input
                            className="input text-sm"
                            value={vendorInfo.address}
                            onChange={(e) => setVendorInfo({ ...vendorInfo, address: e.target.value })}
                            placeholder="Vendor Address (Optional)"
                        />
                        <input
                            className="input text-sm"
                            value={vendorInfo.gstin}
                            onChange={(e) => setVendorInfo({ ...vendorInfo, gstin: e.target.value })}
                            placeholder="GSTIN (Optional)"
                        />
                    </div>
                    <div className="text-right w-1/3 space-y-2">
                        <h2 className="text-2xl font-bold text-gray-400 uppercase mb-4">INVOICE</h2>

                        <div className="flex items-center gap-2 justify-end">
                            <label className="text-sm font-medium text-secondary">No.</label>
                            <input
                                className="input px-2 py-1 w-32 text-right"
                                value={expenseData.invoiceNumber}
                                onChange={(e) => setExpenseData({ ...expenseData, invoiceNumber: e.target.value })}
                                placeholder="INV-000"
                            />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <label className="text-sm font-medium text-secondary">Date</label>
                            <input
                                type="date"
                                className="input px-2 py-1 w-32 text-right"
                                value={expenseData.date}
                                onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <label className="text-sm font-medium text-secondary">Category</label>
                            <select
                                className="input px-2 py-1 w-32 text-right"
                                value={expenseData.category}
                                onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                            >
                                <option value="materials">Materials</option>
                                <option value="labor">Labor</option>
                                <option value="equipment">Equipment</option>
                                <option value="miscellaneous">Misc</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <label className="text-sm font-medium text-secondary">Status</label>
                            <select
                                className="input px-2 py-1 w-32 text-right"
                                value={expenseData.status}
                                onChange={(e) => setExpenseData({ ...expenseData, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bill To Section (Us) */}
                <div className="mb-8 p-4 bg-gray-50 rounded border border-border/50">
                    <h3 className="text-sm font-semibold uppercase text-secondary mb-3">Bill To</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="input bg-white"
                            value={myInfo.name}
                            onChange={(e) => setMyInfo({ ...myInfo, name: e.target.value })}
                        />
                        <input
                            className="input bg-white md:col-span-1"
                            value={myInfo.address}
                            onChange={(e) => setMyInfo({ ...myInfo, address: e.target.value })}
                        />
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
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
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={addItem} className="btn text-primary hover:bg-blue-50 mt-4 text-sm px-0 pl-2">
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                {/* Total Section */}
                <div className="flex justify-end border-t border-border pt-4">
                    <div className="w-64">
                        {/* Optional Notes */}
                        <div className="mb-4">
                            <label className="text-xs text-secondary block mb-1">Notes</label>
                            <textarea
                                className="input text-xs min-h-[60px]"
                                value={expenseData.notes}
                                onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
                                placeholder="Payment terms, delivery notes..."
                            />
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <span className="text-secondary font-medium">Subtotal</span>
                            <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-foreground">
                            <span>Total</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
