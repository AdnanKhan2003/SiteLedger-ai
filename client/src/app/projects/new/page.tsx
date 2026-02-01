'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

interface Worker {
    _id: string;
    name: string;
    role: string;
    workerRole?: string; // Specific role like "Mason"
    specialty?: string;
    status?: string;
}

interface FormErrors {
    name?: string;
    client?: string;
    location?: string;
    budget?: string;
    startDate?: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        location: '',
        budget: '',
        startDate: '',
        description: ''
    });
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [workerSearch, setWorkerSearch] = useState('');

    // Filter workers based on search
    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
        (worker.workerRole && worker.workerRole.toLowerCase().includes(workerSearch.toLowerCase())) ||
        (worker.specialty && worker.specialty.toLowerCase().includes(workerSearch.toLowerCase()))
    );

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await api.get('/users/workers');
                setWorkers(res.data.filter((w: any) => w.status === 'active'));
            } catch (err) {
                console.error('Failed to fetch workers', err);
                showToast('Failed to load workers', 'error');
            }
        };
        fetchWorkers();
    }, [showToast]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required';
        }
        if (!formData.client.trim()) {
            newErrors.client = 'Client name is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!formData.budget || Number(formData.budget) <= 0) {
            newErrors.budget = 'Budget must be a positive number';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the errors before submitting', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/projects', { ...formData, workers: selectedWorkers });
            showToast('Project created successfully!', 'success');
            router.push('/projects');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create project';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleWorker = (id: string) => {
        setSelectedWorkers(prev =>
            prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
        );
    };

    const handleFieldChange = (field: keyof typeof formData, value: string) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    return (
        <div className="container max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
            <form onSubmit={handleSubmit} className="card">
                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">
                        Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="e.g. Villa Renovation"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">
                        Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`input ${errors.client ? 'border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.client}
                        onChange={(e) => handleFieldChange('client', e.target.value)}
                        placeholder="e.g. Mr. Sharma"
                    />
                    {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
                </div>

                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">
                        Location <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`input ${errors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        placeholder="e.g. Mumbai, Andheri West"
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Budget (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input ${errors.budget ? 'border-red-500 focus:ring-red-500' : ''}`}
                            type="number"
                            min="1"
                            value={formData.budget}
                            onChange={(e) => handleFieldChange('budget', e.target.value)}
                            placeholder="e.g. 5000000"
                        />
                        {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleFieldChange('startDate', e.target.value)}
                        />
                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-medium text-secondary text-sm">Assign Team</label>

                    {/* Search Input */}
                    <div className="relative mb-2">
                        <input
                            type="text"
                            placeholder="Search workers by name or role..."
                            value={workerSearch}
                            onChange={(e) => setWorkerSearch(e.target.value)}
                            className="input pl-9"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="8" cy="8" r="6" />
                            <path d="M12.5 12.5l3 3" />
                        </svg>
                    </div>

                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-background">
                        {filteredWorkers.length === 0 ? (
                            <p className="text-xs text-secondary">
                                {workerSearch ? 'No workers found matching your search.' : 'No active workers found.'}
                            </p>
                        ) : (
                            filteredWorkers.map(worker => (
                                <label key={worker._id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        checked={selectedWorkers.includes(worker._id)}
                                        onChange={() => toggleWorker(worker._id)}
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium block">{worker.name}</span>
                                        <span className="text-xs text-secondary">
                                            {worker.workerRole || worker.role} {worker.specialty ? `• ${worker.specialty}` : ''}
                                        </span>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                    {selectedWorkers.length > 0 && (
                        <p className="text-xs text-secondary mt-2">{selectedWorkers.length} worker(s) selected</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-medium text-secondary text-sm">Description</label>
                    <textarea
                        className="input"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        placeholder="Optional project description..."
                    />
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
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}
