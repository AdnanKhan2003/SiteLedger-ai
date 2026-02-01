'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Download, FileText, Save, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function InvoiceGenerator() {
    const router = useRouter();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: 'INV-001',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        clientName: '',
        clientAddress: '',
        clientEmail: '',
    });

    const [companyInfo, setCompanyInfo] = useState({
        name: 'SideLedger Construction',
        address: '123 Business Park, Mumbai, India',
        email: 'accounts@sideledger.com',
        phone: '+91 98765 43210'
    });

    const [items, setItems] = useState([
        { id: 1, description: 'Consulting Services', quantity: 1, rate: 100, amount: 100 }
    ]);

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    const qty = field === 'quantity' ? value : updated.quantity;
                    const rate = field === 'rate' ? value : updated.rate;
                    updated.amount = (Number(qty) || 0) * (Number(rate) || 0);
                }
                return updated;
            }
            return item;
        }));
    };

    const addItem = () => {
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        setItems([...items, { id: newId, description: '', quantity: 1, rate: 0, amount: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const handleSave = async () => {
        if (!invoiceData.clientName) {
            showToast('Client Name is required', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...invoiceData,
                companyName: companyInfo.name,
                companyAddress: companyInfo.address,
                companyEmail: companyInfo.email,
                companyPhone: companyInfo.phone,
                items: items.map(({ id, ...rest }) => rest), // Remove ID for DB (or keep if needed, but DB generates _id)
                totalAmount: calculateTotal(),
                status: 'sent'
            };

            await api.post('/invoices', payload);
            showToast('Invoice saved successfully!', 'success');
            router.push('/invoices'); // Go back to list, finding the "Sent" tab
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || 'Failed to save invoice', 'error');
        } finally {
            setSaving(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text(companyInfo.name, 20, 20);
        doc.setFontSize(10);
        doc.text(companyInfo.address, 20, 30);
        doc.text(`${companyInfo.email} | ${companyInfo.phone}`, 20, 35);

        doc.setFontSize(16);
        doc.text('INVOICE', 150, 20);
        doc.setFontSize(10);
        doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 150, 30);
        doc.text(`Date: ${invoiceData.date}`, 150, 35);
        if (invoiceData.dueDate) doc.text(`Due Date: ${invoiceData.dueDate}`, 150, 40);

        // Bill To
        doc.text('Bill To:', 20, 50);
        doc.setFontSize(12);
        doc.text(invoiceData.clientName, 20, 55);
        doc.setFontSize(10);
        doc.text(invoiceData.clientAddress, 20, 60);
        doc.text(invoiceData.clientEmail, 20, 65);

        // Table
        const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
        const tableRows = items.map(item => [
            item.description,
            item.quantity,
            `$${item.rate}`,
            `$${item.amount.toFixed(2)}`
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
        doc.text(`Total: $${calculateTotal().toFixed(2)}`, 150, finalY);

        doc.save(`${invoiceData.invoiceNumber}.pdf`);
    };

    return (
        <div className="container max-w-4xl">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Invoice Generator</h1>
                    <p className="text-secondary">Create and export invoices for clients</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn btn-outline">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Invoice
                    </button>
                    <button onClick={generatePDF} className="btn btn-primary">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </header>

            <div className="card p-8 bg-white shadow-sm border border-border">
                {/* Header Section */}
                <div className="flex justify-between mb-8 border-b border-border pb-8">
                    <div className="w-1/2 pr-4 space-y-2">
                        <label className="text-xs text-secondary uppercase font-semibold">From (Your Company)</label>
                        <input
                            className="input font-bold text-lg"
                            value={companyInfo.name}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                            placeholder="Your Company Name"
                        />
                        <input
                            className="input text-sm"
                            value={companyInfo.address}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                            placeholder="Company Address"
                        />
                        <div className="flex gap-2">
                            <input
                                className="input text-sm flex-1"
                                value={companyInfo.email}
                                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                                placeholder="Email"
                            />
                            <input
                                className="input text-sm flex-1"
                                value={companyInfo.phone}
                                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                                placeholder="Phone"
                            />
                        </div>
                    </div>
                    <div className="text-right w-1/3">
                        <h2 className="text-4xl font-bold text-gray-100 uppercase mb-4">Invoice</h2>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex items-center gap-2 justify-end w-full">
                                <label className="text-sm font-medium text-secondary whitespace-nowrap">No.</label>
                                <input
                                    className="input px-2 py-1 w-32 text-right"
                                    value={invoiceData.invoiceNumber}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 justify-end w-full">
                                <label className="text-sm font-medium text-secondary whitespace-nowrap">Date</label>
                                <input
                                    type="date"
                                    className="input px-2 py-1 w-32 text-right"
                                    value={invoiceData.date}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To Section */}
                <div className="mb-8 p-4 bg-gray-50 rounded border border-border/50">
                    <h3 className="text-sm font-semibold uppercase text-secondary mb-3">Bill To</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="input bg-white"
                            placeholder="Client Name"
                            value={invoiceData.clientName}
                            onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                        />
                        <input
                            className="input bg-white"
                            placeholder="Client Email"
                            value={invoiceData.clientEmail}
                            onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                        />
                        <input
                            className="input bg-white md:col-span-2"
                            placeholder="Client Address"
                            value={invoiceData.clientAddress}
                            onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                        />
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <div className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] gap-4 mb-2 px-2 font-medium text-sm text-secondary">
                        <span>Description</span>
                        <span>Qty</span>
                        <span>Rate</span>
                        <span>Amount</span>
                        <span></span>
                    </div>

                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] gap-4 items-center group">
                                <input
                                    className="input"
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    placeholder="Item description"
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
                                    value={item.rate}
                                    onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
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
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-secondary font-medium">Subtotal</span>
                            <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
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
