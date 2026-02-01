'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, QrCode, Trash2, Edit, Info } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface Worker {
    _id: string;
    name: string;
    workerRole: string;  // Changed from 'role'
    phone: string;
    dailyRate: number;
    status: string;
    specialty: string;
}

export default function LaborPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; workerId: string | null; workerName: string }>({
        open: false,
        workerId: null,
        workerName: ''
    });
    const [deleting, setDeleting] = useState(false);
    const { user } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/users/workers');
            setWorkers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id: string, name: string) => {
        setDeleteModal({ open: true, workerId: id, workerName: name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, workerId: null, workerName: '' });
    };

    const confirmDelete = async () => {
        if (!deleteModal.workerId) return;

        setDeleting(true);
        try {
            await api.delete(`/workers/${deleteModal.workerId}`);
            showToast('Worker deleted successfully', 'success');
            fetchWorkers();
            closeDeleteModal();
        } catch (err) {
            console.error('Error deleting worker:', err);
            showToast('Unable to delete worker. Please try again.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="container">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:sticky md:top-0 md:z-10 md:bg-background/95 md:backdrop-blur md:pt-4 md:pb-4 md:-mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Labor Management</h1>
                    <p className="text-secondary mt-1">
                        {isAdmin ? 'Manage workers, attendance, and payroll' : 'View workers and their details'}
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/worker-register" className="btn btn-primary w-full md:w-auto">
                        <Plus size={18} /> Add Worker
                    </Link>
                )}
            </header>

            {/* Info Banner for Admin */}
            {isAdmin && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-blue-900 mb-1">Adding Workers:</p>
                        <p className="text-blue-800">
                            Click "Add Worker" to register a new worker. All workers must have login credentials to access the app and mark attendance.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <p>Loading workers...</p>
            ) : workers.length === 0 ? (
                <div className="text-center py-16 text-secondary border-2 border-dashed border-border rounded flex flex-col items-center gap-4">
                    <p>No workers found. {isAdmin && 'Add one to get started.'}</p>
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
                                        {worker.workerRole}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6 text-sm text-secondary space-y-2">
                                <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span className="text-foreground">{worker.phone}</span>
                                </div>
                                {isAdmin && (
                                    <div className="flex justify-between">
                                        <span>Rate:</span>
                                        <span className="text-foreground">₹{worker.dailyRate}/day</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span>Status:</span>
                                    <span className={`font-medium ${worker.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                        {worker.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                {isAdmin && (
                                    <>
                                        <Link href={`/labor/${worker._id}/edit`} className="btn btn-outline flex-1" title="Edit">
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(worker._id, worker.name)}
                                            className="btn btn-outline flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Delete Worker"
                message={`Are you sure you want to delete ${deleteModal.workerName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
}
