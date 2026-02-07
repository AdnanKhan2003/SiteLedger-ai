'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Download, FileText, Save, Loader2, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function EditInvoicePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        date: '',
        dueDate: '',
        clientName: '',
        clientAddress: '',
        clientEmail: '',
    });

    const [companyInfo, setCompanyInfo] = useState({
        name: '',
        address: '',
        email: '',
        phone: ''
    });

    const [items, setItems] = useState<any[]>([]);

    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const [invoiceRes, projectsRes] = await Promise.all([
                    api.get(`/invoices/${id}`),
                    api.get('/projects')
                ]);

                const data = invoiceRes.data;
                setProjects(projectsRes.data);

                setInvoiceData({
                    invoiceNumber: data.invoiceNumber,
                    date: data.date ? data.date.split('T')[0] : '',
                    dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
                    clientName: data.clientName,
                    clientAddress: data.clientAddress || '',
                    clientEmail: data.clientEmail || ''
                });

                if (data.project) {
                    // Check if it's an object (populated) or just ID
                    setSelectedProjectId(typeof data.project === 'object' ? data.project._id : data.project);
                }

                setCompanyInfo({
                    name: data.companyName,
                    address: data.companyAddress || '',
                    email: data.companyEmail || '',
                    phone: data.companyPhone || ''
                });

                // Ensure items have IDs for internal React keys
                const mappedItems = data.items.map((item: any, idx: number) => ({
                    ...item,
                    _id: item._id,
                    id: idx + 1
                }));
                setItems(mappedItems);

            } catch (err: any) {
                console.error(err);
                showToast('Failed to load data', 'error');
                router.push('/invoices');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, router, showToast]);

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
        // Ensure we find the max NUMBER id
        const maxId = items.reduce((max, item) => (typeof item.id === 'number' && item.id > max ? item.id : max), 0);
        setItems([...items, { id: maxId + 1, description: '', quantity: 1, rate: 0, amount: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const handleUpdate = async () => {
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
                items: items.map(({ id, ...rest }) => rest), // remove UI ids
                totalAmount: calculateTotal(),
                project: selectedProjectId || undefined
            };

            await api.put(`/invoices/${id}`, payload);
            showToast('Invoice updated successfully!', 'success');
            // router.push('/invoices'); // Or stay? User asked to edit changes. Usually nice to go back or show success.
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || 'Failed to update invoice', 'error');
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
            `₹${item.rate}`,
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
        doc.text(`Total: ₹${calculateTotal().toFixed(2)}`, 150, finalY);

        doc.save(`${invoiceData.invoiceNumber}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm text-secondary hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </button>
                    <h1 className="text-3xl font-bold">Edit Invoice</h1>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handleUpdate} disabled={saving} className="btn btn-outline flex-1 md:flex-none justify-center">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Update Invoice
                    </button>
                    <button onClick={generatePDF} className="btn btn-primary flex-1 md:flex-none justify-center">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </header>

            <div className="card p-8 bg-white shadow-sm border border-border">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-border pb-8 gap-6">
                    <div className="w-full md:w-1/2 pr-0 md:pr-4 space-y-2">
                        <label className="text-xs text-secondary uppercase font-semibold">From (Your Company)</label>
                        <input
                            className="input font-bold text-lg w-full"
                            value={companyInfo.name}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                            placeholder="Your Company Name"
                        />
                        <input
                            className="input text-sm w-full"
                            value={companyInfo.address}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                            placeholder="Company Address"
                        />
                        <div className="flex flex-col md:flex-row gap-2">
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
                    <div className="text-left md:text-right w-full md:w-1/3">
                        <h2 className="text-4xl font-bold text-gray-100 uppercase mb-4">Invoice</h2>
                        <div className="flex flex-col gap-2 items-start md:items-end">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end w-full">
                                <label className="text-sm font-medium text-secondary whitespace-nowrap w-24 md:w-auto text-left md:text-right">Project</label>
                                <select
                                    className="input px-2 py-1 w-full md:w-48 text-left md:text-right bg-white"
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                >
                                    <option value="">-- No Project --</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end w-full">
                                <label className="text-sm font-medium text-secondary whitespace-nowrap w-24 md:w-auto text-left md:text-right">No.</label>
                                <input
                                    className="input px-2 py-1 w-full md:w-32 text-left md:text-right"
                                    value={invoiceData.invoiceNumber}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end w-full">
                                <label className="text-sm font-medium text-secondary whitespace-nowrap w-24 md:w-auto text-left md:text-right">Date</label>
                                <input
                                    type="date"
                                    className="input px-2 py-1 w-full md:w-32 text-left md:text-right"
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
                <div className="mb-8 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                    <div className="min-w-[700px]">
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
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={addItem} className="btn text-primary hover:bg-blue-50 mt-4 text-sm px-0 pl-2">
                        <Plus size={16} /> Add Item
                    </button>


                    {/* Total Section */}
                    <div className="flex justify-end border-t border-border pt-4">
                        <div className="w-full md:w-64">
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
        </div>
    );
}
