'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, QrCode, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Worker {
    _id: string;
    name: string;
    role: string;
    phone: string;
    dailyRate: number;
    status: string;
}

export default function LaborPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/workers');
            setWorkers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteWorker = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/workers/${id}`);
            fetchWorkers();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="container">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Labor Management</h1>
                    <p className="text-secondary mt-1">Manage workers, attendance, and payroll</p>
                </div>
                <Link href="/labor/add" className="btn btn-primary">
                    <Plus size={18} /> Add Worker
                </Link>
            </header>

            {loading ? (
                <p>Loading workers...</p>
            ) : workers.length === 0 ? (
                <div className="text-center py-16 text-secondary border-2 border-dashed border-border rounded flex flex-col items-center gap-4">
                    <p>No workers found. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workers.map((worker) => (
                        <div key={worker._id} className="card flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-semibold">
                                    {worker.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{worker.name}</h3>
                                    <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full mt-1">
                                        {worker.role}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6 text-sm text-secondary space-y-2">
                                <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span className="text-foreground">{worker.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Rate:</span>
                                    <span className="text-foreground">₹{worker.dailyRate}/day</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Status:</span>
                                    <span className={`font-medium ${worker.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                        {worker.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <Link href={`/labor/${worker._id}`} className="btn btn-outline flex-1" title="View/QR">
                                    <QrCode size={16} /> QR
                                </Link>
                                <button
                                    onClick={() => deleteWorker(worker._id)}
                                    className="btn btn-outline flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
