'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import {
    BrainCircuit,
    TrendingUp,
    TrendingDown,
    Users,
    HardHat,
    CalendarCheck,
    DollarSign,
    AlertCircle
} from 'lucide-react';

export default function AIInsightsPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [insights, setInsights] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const response = await axios.get('http://localhost:5000/api/ai/insights', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data.data);
                setInsights(response.data.insights);
            } catch (error) {
                console.error("Error fetching AI insights:", error);
                setInsights("Failed to load insights. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-[#F7F6F3] min-h-screen transition-all duration-300 overflow-x-hidden">
            <div className="p-4 md:p-8 pt-20 md:pt-8 w-full space-y-8 overflow-x-hidden">

                {/* Header */}
                <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                    <div className="p-2 md:p-3 bg-purple-100 rounded-lg text-purple-600">
                        <BrainCircuit size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#37352f] tracking-tight">AI Insights</h1>
                        <p className="text-xs md:text-sm text-secondary">Smart analysis of your project data</p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-40 bg-gray-200 rounded-xl w-full"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-32 bg-gray-200 rounded-xl"></div>
                            <div className="h-32 bg-gray-200 rounded-xl"></div>
                            <div className="h-32 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* AI Summary Card */}
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 hidden md:block">
                                <BrainCircuit size={120} />
                            </div>
                            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                AI Executive Summary
                            </h2>
                            <div className="prose text-sm md:text-base text-gray-600 max-w-none whitespace-pre-line leading-relaxed break-words overflow-wrap-anywhere">
                                {insights}
                            </div>
                        </div>

                        {/* Admin View */}
                        {user?.role === 'admin' && stats && (
                            <>
                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                                <CreditCardIcon />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">This Month</span>
                                        </div>
                                        <p className="text-secondary text-xs md:text-sm">Monthly Revenue</p>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{formatCurrency(stats.monthlyStats?.revenue || 0)}</h3>
                                    </div>

                                    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                <CreditCardIcon />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Lifetime</span>
                                        </div>
                                        <p className="text-secondary text-xs md:text-sm">Total Profit</p>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{formatCurrency(stats.lifetimeStats?.profit || 0)}</h3>
                                    </div>

                                    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                                <TrendingDown size={20} />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">Lifetime</span>
                                        </div>
                                        <p className="text-secondary text-xs md:text-sm">Total Expenses</p>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{formatCurrency(stats.lifetimeStats?.expense || 0)}</h3>
                                    </div>

                                    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <HardHat size={20} />
                                            </div>
                                        </div>
                                        <p className="text-secondary text-xs md:text-sm">Active Projects</p>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalProjects}</h3>
                                    </div>
                                </div>

                                {/* Project Wise Breakdown */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Project Performance</h3>
                                        <p className="text-xs text-gray-500 mt-1 md:hidden">Scroll horizontally to view all columns →</p>
                                    </div>
                                    <div className="overflow-x-auto -mx-4 md:mx-0 scrollbar-thin">
                                        <div className="inline-block min-w-full align-middle">
                                            <table className="min-w-full text-left text-xs md:text-sm">
                                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">Project Name</th>
                                                        <th className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">Est. Profit</th>
                                                        <th className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">Expenses</th>
                                                        <th className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">Workers</th>
                                                        <th className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">High Leaves</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {stats.projectStats.map((project: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-900 whitespace-nowrap">{project.name}</td>
                                                            <td className="px-3 py-2 md:px-6 md:py-4 text-green-600 font-medium whitespace-nowrap">{formatCurrency(project.profit)}</td>
                                                            <td className="px-3 py-2 md:px-6 md:py-4 text-red-500 whitespace-nowrap">{formatCurrency(project.expense)}</td>
                                                            <td className="px-3 py-2 md:px-6 md:py-4 text-gray-600 whitespace-nowrap">{project.workerCount}</td>
                                                            <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                                                                {project.workerLeaves.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {project.workerLeaves.map((w: any, i: number) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full border border-red-200">
                                                                                {w.name} ({w.leaves})
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Global Leaves Alert */}
                                {stats.globalLeaves.length > 0 && (
                                    <div className="bg-orange-50 rounded-xl border border-orange-100 p-4 md:p-6">
                                        <h3 className="font-semibold text-orange-800 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                            <AlertCircle size={18} />
                                            Top Absenteeism Impact
                                        </h3>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {stats.globalLeaves.map((w: any, idx: number) => (
                                                <div key={idx} className="bg-white px-3 py-2 rounded-lg border border-orange-100 shadow-sm flex items-center gap-2">
                                                    <span className="text-gray-700 font-medium text-xs md:text-sm">{w.name}</span>
                                                    <span className="text-orange-600 font-bold text-xs md:text-sm">{w.leaves} days</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs md:text-sm text-orange-700 mt-2 md:mt-3">High absenteeism can impact project delivery timelines.</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Worker View */}
                        {user?.role === 'worker' && stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 text-green-600">
                                        <div className="p-1.5 md:p-2 bg-green-50 rounded-lg"><DollarSign size={18} className="md:w-5 md:h-5" /></div>
                                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Est. Wages</h3>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(stats.estimatedWages)}</p>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1">Based on {stats.daysPresent} days present</p>
                                </div>

                                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 text-blue-600">
                                        <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg"><CalendarCheck size={18} className="md:w-5 md:h-5" /></div>
                                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Attendance</h3>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.daysPresent} <span className="text-xs md:text-sm font-normal text-gray-500">Days Present</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base md:text-lg font-bold text-red-500">{stats.daysAbsent} <span className="text-xs md:text-sm font-normal text-gray-500">Absent</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-3">
                                    <h3 className="font-semibold text-gray-800 mb-3 md:mb-4 text-sm md:text-base">Assigned Projects</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.projectsInvolved?.map((pName: string, i: number) => (
                                            <span key={i} className="px-2.5 md:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm border border-gray-200">
                                                {pName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </>
                )}
            </div>
        </div>
    );
}

// Icon component
function CreditCardIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}
