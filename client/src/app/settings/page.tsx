'use client';

import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Shield, Camera } from 'lucide-react';

export default function SettingsPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Please log in to view settings.</div>;
    }

    return (
        <div className="bg-[#F7F6F3] min-h-screen p-4 md:p-8 pt-20 md:pt-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                        <User size={32} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                        <p className="text-sm text-secondary">View your personal information</p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="space-y-6">

                            {/* Avatar placeholder */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                                        <span className="text-3xl font-bold text-gray-400">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={user.name || ''}
                                            readOnly
                                            className="input pl-10 w-full bg-gray-50 text-gray-600 border-gray-200 cursor-default"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={user.phone || 'Not provided'}
                                            readOnly
                                            className="input pl-10 w-full bg-gray-50 text-gray-600 border-gray-200 cursor-default"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={user.email || ''}
                                            readOnly
                                            className="input pl-10 w-full bg-gray-50 text-gray-600 border-gray-200 cursor-default"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <Shield size={20} className="text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Current Role: <span className="uppercase">{user.role}</span></p>
                                    <p className="text-xs text-blue-700">Contact administrator for role changes.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-400 mt-8">
                    <p>SideLedger AI • Version 1.0.0</p>
                </div>

            </div>
        </div>
    );
}
