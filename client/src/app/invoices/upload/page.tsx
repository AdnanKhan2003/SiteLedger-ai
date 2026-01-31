'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Camera, Save, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function InvoiceUploadPage() {
    const router = useRouter();
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [data, setData] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!imageUrl) return;
        setAnalyzing(true);
        try {
            const res = await api.post('/expenses/scan', { imageUrl });
            setData({
                ...res.data,
                category: 'materials', // default
                status: 'pending'
            });
        } catch (err) {
            alert('OCR Failed');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setLoading(true);
        try {
            await api.post('/expenses', { ...data, invoiceUrl: imageUrl });
            router.push('/invoices');
        } catch (err) {
            alert('Failed to save expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Upload Invoice</h1>

            <div className="card mb-8">
                <div className="p-8 border-2 border-dashed border-border rounded-lg bg-gray-50/50">
                    <label className="block mb-2 font-medium text-secondary text-sm">Invoice Image URL (Demo)</label>
                    <div className="flex gap-4">
                        <input
                            className="input bg-white"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/invoice.jpg"
                        />
                        <button onClick={handleAnalyze} className="btn btn-primary min-w-[120px]" disabled={analyzing || !imageUrl}>
                            {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <Camera size={18} />}
                            Analyze
                        </button>
                    </div>
                    <p className="text-xs text-secondary mt-2">
                        * In a real app, this would be a file upload to Cloudinary.
                    </p>
                </div>
            </div>

            {data && (
                <form onSubmit={handleSave} className="card">
                    <h2 className="text-xl font-bold mb-6">Review & Save</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-secondary text-sm">Vendor</label>
                            <input
                                className="input"
                                value={data.vendor}
                                onChange={e => setData({ ...data, vendor: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-secondary text-sm">Date</label>
                            <input
                                className="input"
                                type="date"
                                value={data.date ? new Date(data.date).toISOString().split('T')[0] : ''}
                                onChange={e => setData({ ...data, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-secondary text-sm">Total Amount</label>
                            <input
                                className="input"
                                type="number"
                                value={data.totalAmount}
                                onChange={e => setData({ ...data, totalAmount: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-secondary text-sm">Category</label>
                            <select
                                className="input bg-white"
                                value={data.category}
                                onChange={e => setData({ ...data, category: e.target.value })}
                            >
                                <option value="materials">Materials</option>
                                <option value="labor">Labor</option>
                                <option value="equipment">Equipment</option>
                                <option value="miscellaneous">Miscellaneous</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="font-semibold mt-8 mb-4 border-b border-border pb-2">Items Extracted</h3>
                    <div className="space-y-2 mb-8">
                        {data.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded border border-border text-sm">
                                <span>{item.name} (x{item.quantity})</span>
                                <span className="font-medium">₹{item.amount}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={18} /> Save Expense
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
