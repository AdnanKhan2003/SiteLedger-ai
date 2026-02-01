'use client';
import { useEffect, useState, useRef } from 'react';
import {
    Users,
    Briefcase,
    DollarSign,
    AlertTriangle,
    Lightbulb,
    TrendingUp,
    CalendarCheck,
    HardHat,
    Clock
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { gsap } from 'gsap';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [insights, setInsights] = useState<any[]>([]);
    const [costs, setCosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                if (user.role === 'admin') {
                    // Admin Data Fetch
                    const [statsRes, insightsRes, costsRes] = await Promise.all([
                        api.get('/analytics/stats'),
                        api.get('/analytics/ai-insights'),
                        api.get('/analytics/costs')
                    ]);
                    setStats(statsRes.data);
                    setInsights(insightsRes.data);
                    setCosts(costsRes.data);
                } else {
                    // Worker Data Fetch (Currently just simple placeholder or user-specific logic)
                    // We can add specific worker stats endpoints here later
                    setLoading(false);
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(containerRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
            );
        }
    }, [loading]);

    if (loading) return <div className="container flex justify-center items-center h-[50vh]">Loading Dashboard...</div>;

    // --- WORKER DASHBOARD ---
    if (user?.role === 'worker') {
        return (
            <div className="container" ref={containerRef}>
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-1">Welcome, {user.name}</h1>
                    <p className="text-secondary">Here is your work overview for today.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card bg-green-50/50 border-green-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CalendarCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Attendance</h3>
                                <p className="text-sm text-secondary">Mark your presence</p>
                            </div>
                        </div>
                        <Link href="/attendance" className="btn btn-primary w-full justify-center">
                            Go to Attendance
                        </Link>
                    </div>

                    <div className="card bg-blue-50/50 border-blue-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <HardHat size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">My Projects</h3>
                                <p className="text-sm text-secondary">View assigned sites</p>
                            </div>
                        </div>
                        <Link href="/projects" className="btn btn-outline w-full justify-center bg-white">
                            View Projects
                        </Link>
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-secondary" />
                        Today's Schedule
                    </h3>
                    <p className="text-secondary text-sm italic">
                        No specific schedule assigned for today. Please check with your supervisor.
                    </p>
                </div>
            </div>
        );
    }

    // --- ADMIN DASHBOARD ---
    return (
        <div className="container" ref={containerRef}>
            <header className="mb-8 md:sticky md:top-0 md:z-10 md:bg-background/95 md:backdrop-blur md:pt-4 md:pb-4 md:-mt-4">
                <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                <p className="text-secondary">Welcome back, Admin</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-secondary text-sm">Total Projects</h3>
                        <p className="text-2xl font-bold">{stats?.totalProjects || 0}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-secondary text-sm">Active Workers</h3>
                        <p className="text-2xl font-bold">{stats?.activeWorkers || 0}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-secondary text-sm">Monthly Expenses</h3>
                        <p className="text-2xl font-bold">₹{stats?.monthlyExpenses?.toLocaleString() || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 min-h-[400px]">
                {/* Charts Section */}
                <div className="card h-[400px] flex flex-col">
                    <h3 className="font-semibold mb-4 text-lg">Cost Breakdown</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costs}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="total"
                                    nameKey="_id"
                                >
                                    {costs.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 -mt-8">
                        {costs.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs text-secondary">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }}></div>
                                <span>{entry._id}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights Section */}
                <div className="card h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                        <Lightbulb size={24} className="text-yellow-500" />
                        <h3 className="font-semibold text-lg">AI Insights</h3>
                    </div>

                    <div className="flex flex-col gap-4 overflow-y-auto">
                        {insights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded border text-sm ${insight.type === 'warning' ? 'bg-red-50 text-red-700 border-red-200' :
                                    insight.type === 'info' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                        'bg-green-50 text-green-700 border-green-200'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2 font-semibold uppercase tracking-wide text-xs">
                                    <span>{insight.metric}</span>
                                    {insight.type === 'warning' && <AlertTriangle size={14} />}
                                    {insight.type === 'success' && <TrendingUp size={14} />}
                                </div>
                                <p>{insight.text}</p>
                            </div>
                        ))}
                        {insights.length === 0 && (
                            <p className="text-secondary text-sm italic text-center py-4">No insights available right now.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
