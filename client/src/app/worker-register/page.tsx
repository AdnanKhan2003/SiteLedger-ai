'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

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
    email?: string;
    password?: string;
    phone?: string;
    specialty?: string;
    workerRole?: string;
    dailyRate?: string;
}

export default function WorkerRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialty: '',
        workerRole: '',
        dailyRate: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState('');
    const [successModal, setSuccessModal] = useState<{ open: boolean; workerName: string }>({
        open: false,
        workerName: ''
    });

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.specialty) newErrors.specialty = 'Specialty is required';
        if (!formData.workerRole.trim()) newErrors.workerRole = 'Role is required';
        if (!formData.dailyRate || Number(formData.dailyRate) <= 0) {
            newErrors.dailyRate = 'Daily rate must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            await api.post('/worker-auth/register', formData);

            // Show success modal
            setSuccessModal({ open: true, workerName: formData.name });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setServerError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (field: keyof typeof formData, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field as keyof FormErrors]) {
            setErrors({ ...errors, [field]: undefined });
        }
        setServerError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Worker Registration</h1>
                    <p className="text-secondary mt-2">Create your worker account</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {serverError}
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input ${errors.name ? 'border-red-500' : ''}`}
                            value={formData.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            className={`input ${errors.email ? 'border-red-500' : ''}`}
                            value={formData.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            placeholder="your.email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            className={`input ${errors.password ? 'border-red-500' : ''}`}
                            value={formData.password}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            placeholder="At least 6 characters"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            className={`input ${errors.phone ? 'border-red-500' : ''}`}
                            value={formData.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            placeholder="e.g. 9876543210"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Specialty <span className="text-red-500">*</span>
                        </label>
                        <select
                            className={`input ${errors.specialty ? 'border-red-500' : ''}`}
                            value={formData.specialty}
                            onChange={(e) => handleFieldChange('specialty', e.target.value)}
                        >
                            <option value="">Select your specialty</option>
                            {SPECIALTIES.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                        {errors.specialty && <p className="text-red-500 text-xs mt-1">{errors.specialty}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Role/Position <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input ${errors.workerRole ? 'border-red-500' : ''}`}
                            value={formData.workerRole}
                            onChange={(e) => handleFieldChange('workerRole', e.target.value)}
                            placeholder="e.g. Senior Mason, Junior Carpenter"
                        />
                        {errors.workerRole && <p className="text-red-500 text-xs mt-1">{errors.workerRole}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Daily Rate (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            className={`input ${errors.dailyRate ? 'border-red-500' : ''}`}
                            value={formData.dailyRate}
                            onChange={(e) => handleFieldChange('dailyRate', e.target.value)}
                            placeholder="e.g. 800"
                        />
                        {errors.dailyRate && <p className="text-red-500 text-xs mt-1">{errors.dailyRate}</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full flex items-center justify-center gap-2 mt-6"
                        disabled={loading}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>

                    <p className="text-center text-sm text-secondary mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Login here
                        </Link>
                    </p>
                </form>

                {/* Success Modal */}
                <Modal
                    isOpen={successModal.open}
                    onClose={() => {
                        setSuccessModal({ open: false, workerName: '' });
                        router.push('/labor');
                    }}
                    onConfirm={() => {
                        setSuccessModal({ open: false, workerName: '' });
                        router.push('/labor');
                    }}
                    title="Worker Registered Successfully!"
                    message={`${successModal.workerName} has been registered and can now log in with their credentials.`}
                    confirmText="Go to Labor Management"
                    cancelText=""
                    variant="success"
                />
            </div>
        </div>
    );
}
