'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Download, Pencil } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ViewExpensePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const { showToast } = useToast();
    const [expense, setExpense] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpense = async () => {
            if (!id) return;
            try {
                const res = await api.get(`/expenses/${id}`);
                setExpense(res.data);
            } catch (err: any) {
                console.error(err);
                showToast('Failed to load expense', 'error');
                router.push('/invoices');
            } finally {
                setLoading(false);
            }
        };
        fetchExpense();
    }, [id, router, showToast]);

    const generatePDF = () => {
        if (!expense) return;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text(expense.vendor || 'Vendor', 20, 20);
        doc.setFontSize(10);
        // doc.text(expense.vendorAddress || '', 20, 30);

        doc.setFontSize(16);
        doc.text('INVOICE (RECEIVED)', 140, 20);
        doc.setFontSize(10);
        doc.text(`Invoice #: ${expense.invoiceNumber || 'N/A'}`, 140, 30);
        doc.text(`Date: ${new Date(expense.invoiceDate).toLocaleDateString()}`, 140, 35);
        doc.text(`Category: ${expense.category}`, 140, 40);

        // Bill To (Us - Placeholder if not in DB, usually it's us)
        doc.text('Bill To:', 20, 50);
        doc.setFontSize(12);
        doc.text('SideLedger Construction', 20, 55);

        // Items Table
        const tableColumn = ["Item", "Quantity", "Price", "Amount"];
        const items = expense.items && expense.items.length > 0
            ? expense.items
            : [{ name: expense.category, quantity: 1, price: expense.totalAmount, amount: expense.totalAmount }];

        const tableRows = items.map((item: any) => [
            item.name || 'Item',
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
        doc.text(`Total: ₹${expense.totalAmount.toFixed(2)}`, 140, finalY);

        doc.save(`Expense_${expense.invoiceNumber || id}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!expense) return null;

    return (
        <div className="container max-w-4xl py-8">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-secondary hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to List
                </button>
                <div className="flex gap-2">
                    <button onClick={() => router.push(`/invoices/${id}/edit`)} className="btn btn-outline">
                        <Pencil size={18} /> Edit
                    </button>
                    <button onClick={generatePDF} className="btn btn-primary">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="card p-8 bg-white border border-border shadow-sm">
                {/* Visual Preview */}
                <div className="flex justify-between mb-8 border-b border-border pb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">{expense.vendor}</h2>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${expense.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {expense.status}
                        </span>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-bold text-gray-200 uppercase mb-4">INVOICE</h2>
                        <p className="font-medium">#{expense.invoiceNumber || 'N/A'}</p>
                        <p className="text-sm text-secondary">Date: {new Date(expense.invoiceDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mb-8 bg-gray-50 p-4 rounded">
                    <h3 className="text-xs uppercase font-bold text-secondary mb-2">Bill To</h3>
                    <p className="font-bold text-lg">SideLedger Construction</p>
                </div>

                <table className="w-full text-left mb-8">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="py-2 text-sm font-semibold text-secondary">Item</th>
                            <th className="py-2 text-sm font-semibold text-secondary text-right">Qty</th>
                            <th className="py-2 text-sm font-semibold text-secondary text-right">Price</th>
                            <th className="py-2 text-sm font-semibold text-secondary text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(expense.items && expense.items.length > 0 ? expense.items : [{ name: expense.category, quantity: 1, price: expense.totalAmount, amount: expense.totalAmount }]).map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-border last:border-0">
                                <td className="py-2">{item.name || 'Item'}</td>
                                <td className="py-2 text-right">{item.quantity}</td>
                                <td className="py-2 text-right">₹{item.price}</td>
                                <td className="py-2 text-right font-medium">₹{item.amount?.toFixed(2) || expense.totalAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-64 border-t border-border pt-4">
                        <div className="flex justify-between items-center text-xl font-bold text-foreground">
                            <span>Total</span>
                            <span>₹{expense.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {expense.notes && (
                    <div className="mt-8 pt-4 border-t border-dashed border-border">
                        <h4 className="text-sm font-semibold text-secondary mb-1">Notes:</h4>
                        <p className="text-sm">{expense.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
