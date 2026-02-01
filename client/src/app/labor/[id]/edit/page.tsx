'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const SPECIALTIES = [
    'Carpenter',
    'Mason',
    'Electrician',
    'Plumber',
    'Painter',
    'Helper',
    'Welder',
    'Tile Worker',
    'Other'
];

interface FormErrors {
    name?: string;
    phone?: string;
    specialty?: string;
    role?: string;
    dailyRate?: string;
}

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const workerId = resolvedParams.id;

    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: '',
        specialty: '',
        dailyRate: '',
    });
    const [loading, setLoading] = useState(false);
    const [fetchingWorker, setFetchingWorker] = useState(true);
    const [errors, setErrors] = useState<FormErrors>({});

    // Protect route - admin only
    useEffect(() => {
        if (user && user.role !== 'admin') {
            showToast('Access denied. Admin only.', 'error');
            router.push('/labor');
        }
    }, [user, router, showToast]);

    // Fetch worker data
    useEffect(() => {
        // Only fetch if user is loaded and is admin
        if (!user) return;
        if (user.role !== 'admin') return;
        if (!workerId) return;

        const fetchWorker = async () => {
            try {
                const res = await api.get(`/workers/${workerId}`);
                const worker = res.data;
                setFormData({
                    name: worker.name || '',
                    phone: worker.phone || '',
                    role: worker.role || '',
                    specialty: worker.specialty || '',
                    dailyRate: worker.dailyRate?.toString() || '',
                });
            } catch (err: any) {
                console.error('Error fetching worker:', err);
                // User-friendly error message
                showToast('Unable to load worker information. Please try again.', 'error');
                router.push('/labor');
            } finally {
                setFetchingWorker(false);
            }
        };
        fetchWorker();
    }, [workerId, user, router, showToast]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim() || formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be exactly 10 digits';
        }

        if (!formData.specialty) {
            newErrors.specialty = 'Please select a specialty';
        }

        if (!formData.role.trim() || formData.role.trim().length < 2) {
            newErrors.role = 'Role must be at least 2 characters';
        }

        if (!formData.dailyRate || Number(formData.dailyRate) <= 0) {
            newErrors.dailyRate = 'Daily rate must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (field: keyof typeof formData, value: string) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the errors before submitting', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/workers/${workerId}`, formData);
            showToast('Worker updated successfully!', 'success');
            router.push('/labor');
        } catch (err: any) {
            console.error('Error updating worker:', err);
            // User-friendly error message
            showToast('Unable to update worker. Please check your information and try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingWorker) {
        return <div className="container">Loading worker data...</div>;
    }

    return (
        <div className="container max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Edit Worker</h1>
            <form onSubmit={handleSubmit} className="card">
                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">
                        Specialty <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={`input appearance-none bg-white ${errors.specialty ? 'border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.specialty}
                        onChange={(e) => handleFieldChange('specialty', e.target.value)}
                    >
                        <option value="">Select specialty</option>
                        {SPECIALTIES.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                    {errors.specialty && <p className="text-red-500 text-xs mt-1">{errors.specialty}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Role/Position <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input ${errors.role ? 'border-red-500 focus:ring-red-500' : ''}`}
                            value={formData.role}
                            onChange={(e) => handleFieldChange('role', e.target.value)}
                            placeholder="e.g. Senior Mason"
                        />
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Daily Rate (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input ${errors.dailyRate ? 'border-red-500 focus:ring-red-500' : ''}`}
                            type="number"
                            min="1"
                            value={formData.dailyRate}
                            onChange={(e) => handleFieldChange('dailyRate', e.target.value)}
                            placeholder="e.g. 800"
                        />
                        {errors.dailyRate && <p className="text-red-500 text-xs mt-1">{errors.dailyRate}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn btn-outline"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Updating...' : 'Update Worker'}
                    </button>
                </div>
            </form>
        </div>
    );
}
