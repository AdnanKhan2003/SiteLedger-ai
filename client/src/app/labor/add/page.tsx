'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AddWorkerPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: 'Helper',
        dailyRate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/workers', formData);
            router.push('/labor');
        } catch (err) {
            alert('Failed to add worker');
        }
    };

    return (
        <div className="container max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Add New Worker</h1>
            <form onSubmit={handleSubmit} className="card">
                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">Full Name</label>
                    <input
                        className="input"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="mb-5">
                    <label className="block mb-2 font-medium text-secondary text-sm">Phone Number</label>
                    <input
                        className="input"
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">Role</label>
                        <select
                            className="input appearance-none bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option>Helper</option>
                            <option>Mason</option>
                            <option>Carpenter</option>
                            <option>Electrician</option>
                            <option>Plumber</option>
                            <option>Supervisor</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-secondary text-sm">Daily Rate (₹)</label>
                        <input
                            className="input"
                            required
                            type="number"
                            value={formData.dailyRate}
                            onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Worker</button>
                </div>
            </form>
        </div>
    );
}
