'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Download, Printer, Pencil } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ViewInvoicePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const { showToast } = useToast();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return;
            try {
                const res = await api.get(`/invoices/${id}`);
                setInvoice(res.data);
            } catch (err: any) {
                console.error(err);
                showToast('Failed to load invoice', 'error');
                router.push('/invoices');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id, router, showToast]);

    const generatePDF = () => {
        if (!invoice) return;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text(invoice.companyName, 20, 20);
        doc.setFontSize(10);
        doc.text(invoice.companyAddress || '', 20, 30);
        doc.text(`${invoice.companyEmail || ''} | ${invoice.companyPhone || ''}`, 20, 35);

        doc.setFontSize(16);
        doc.text('INVOICE', 150, 20);
        doc.setFontSize(10);
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 30);
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 150, 35);
        if (invoice.dueDate) doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 40);

        // Bill To
        doc.text('Bill To:', 20, 50);
        doc.setFontSize(12);
        doc.text(invoice.clientName, 20, 55);
        doc.setFontSize(10);
        doc.text(invoice.clientAddress || '', 20, 60);
        doc.text(invoice.clientEmail || '', 20, 65);

        // Table
        const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
        const tableRows = invoice.items.map((item: any) => [
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
        doc.text(`Total: ₹${invoice.totalAmount.toFixed(2)}`, 150, finalY);

        doc.save(`${invoice.invoiceNumber}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="container max-w-4xl py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-secondary hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to List
                </button>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => router.push(`/invoices/sent/${id}/edit`)} className="btn btn-outline flex-1 md:flex-none justify-center">
                        <Pencil size={18} /> Edit
                    </button>
                    <button onClick={generatePDF} className="btn btn-primary flex-1 md:flex-none justify-center">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="card p-8 bg-white border border-border shadow-sm print:shadow-none print:border-0">
                {/* Visual Preview (HTML version of PDF) */}
                <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-border pb-8 gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">{invoice.companyName}</h2>
                        <p className="text-sm text-secondary">{invoice.companyAddress}</p>
                        <p className="text-sm text-secondary">{invoice.companyEmail} | {invoice.companyPhone}</p>
                    </div>
                    <div className="text-left md:text-right">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-200 uppercase mb-4">Invoice</h2>
                        <p className="font-medium">#{invoice.invoiceNumber}</p>
                        <p className="text-sm text-secondary">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mb-8 bg-gray-50 p-4 rounded">
                    <h3 className="text-xs uppercase font-bold text-secondary mb-2">Bill To</h3>
                    <p className="font-bold text-lg">{invoice.clientName}</p>
                    <p className="text-sm text-secondary">{invoice.clientAddress}</p>
                    <p className="text-sm text-secondary">{invoice.clientEmail}</p>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full text-left mb-8 min-w-[600px] md:min-w-0 px-4 md:px-0">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="py-2 pl-4 md:pl-0 text-sm font-semibold text-secondary">Description</th>
                                <th className="py-2 text-sm font-semibold text-secondary text-right">Qty</th>
                                <th className="py-2 text-sm font-semibold text-secondary text-right">Rate</th>
                                <th className="py-2 pr-4 md:pr-0 text-sm font-semibold text-secondary text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-border last:border-0">
                                    <td className="py-2 pl-4 md:pl-0">{item.description}</td>
                                    <td className="py-2 text-right">{item.quantity}</td>
                                    <td className="py-2 text-right">₹{item.rate}</td>
                                    <td className="py-2 pr-4 md:pr-0 text-right font-medium">₹{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <div className="w-full md:w-64 border-t border-border pt-4">
                        <div className="flex justify-between items-center text-xl font-bold text-foreground">
                            <span>Total</span>
                            <span>₹{invoice.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
