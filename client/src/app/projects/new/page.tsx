'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function NewProjectPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        location: '',
        budget: '',
        startDate: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/projects', formData);
            router.push('/projects');
        } catch (err) {
            alert('Failed to creating project');
        }
    };

    return (
        <div className="container max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
            <form onSubmit={handleSubmit} className="card">
                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">Project Name</label>
                    <input
                        className="input"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Villa Renovation"
                    />
                </div>

                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">Client Name</label>
                    <input
                        className="input"
                        required
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    />
                </div>

                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">Location</label>
                    <input
                        className="input"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">Budget (₹)</label>
                        <input
                            className="input"
                            required
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">Start Date</label>
                        <input
                            className="input"
                            required
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-medium text-secondary text-sm">Description</label>
                    <textarea
                        className="input"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Project</button>
                </div>
            </form>
        </div>
    );
}
