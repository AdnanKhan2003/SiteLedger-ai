'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Check, X, Clock } from 'lucide-react';

interface Worker {
    _id: string;
    name: string;
    email?: string;
    workerRole: string;  // Changed from 'role'
    status: string;
}

interface AttendanceRecord {
    _id: string;
    worker: { _id: string; name: string } | string;
    date: string;
    status: 'present' | 'absent' | 'half-day' | 'leave' | 'pending';
    timeIn?: string;
}

export default function AttendancePage() {
    const { user, token } = useAuth();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        if (!token) return;
        fetchData();
    }, [token, selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Workers
            const res = await api.get('/users/workers');
            const allWorkers = res.data.filter((w: Worker) => w.status === 'active');

            if (user?.role === 'admin') {
                setWorkers(allWorkers);
            } else if (user?.role === 'worker') {
                // Match by user ID (user ID is now the worker ID)
                const me = allWorkers.find((w: Worker) => w._id === user.id);
                setWorkers(me ? [me] : []);
            }

            // 2. Fetch Attendance for Date
            const queryParams = new URLSearchParams({ date: selectedDate });
            const attRes = await api.get(`/attendance?${queryParams.toString()}`);

            // Map attendance by worker ID for easy lookup
            const map: Record<string, AttendanceRecord> = {};
            attRes.data.forEach((rec: AttendanceRecord) => {
                const wId = typeof rec.worker === 'string' ? rec.worker : rec.worker._id;
                map[wId] = rec;
            });
            setAttendanceMap(map);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (workerId: string, status: 'present' | 'absent' | 'half-day' | 'leave' | 'pending') => {
        try {
            await api.post('/attendance', {
                workerId,
                date: selectedDate,
                status,
                timeIn: new Date()
            });
            // Refresh logic
            fetchData();
        } catch (err) {
            alert('Failed to mark attendance');
            console.error(err);
        }
    };

    if (!user) return <div>Loading...</div>;

    const myWorkerProfile = user.role === 'worker' ? workers[0] : null;

    return (
        <div className="container">
            <header className="mb-8 md:sticky md:top-0 md:z-10 md:bg-background/95 md:backdrop-blur md:pt-4 md:pb-4 md:-mt-4">
                <h1 className="text-3xl font-bold">Attendance</h1>
                <p className="text-secondary">
                    {user.role === 'admin' ? 'Verify and manage daily attendance' : 'Mark your daily attendance'}
                </p>
                {user.role === 'worker' && <p className="text-xs text-secondary mt-1">Attendance must be verified by Admin.</p>}
            </header>

            {/* Admin View */}
            {user.role === 'admin' && (
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Worker Attendance</h2>
                        <input
                            type="date"
                            className="input w-auto"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border text-secondary text-sm">
                                    <th className="p-3">Worker Name</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 w-48">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.map(worker => {
                                    const record = attendanceMap[worker._id];
                                    const status = record?.status;

                                    return (
                                        <tr key={worker._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                            <td className="p-3 font-medium">{worker.name}</td>
                                            <td className="p-3 text-secondary text-sm">{worker.workerRole}</td>
                                            <td className="p-3">
                                                {status ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize
                                                        ${status === 'present' ? 'bg-green-100 text-green-700' : ''}
                                                        ${status === 'absent' ? 'bg-red-100 text-red-700' : ''}
                                                        ${status === 'half-day' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                        ${status === 'pending' ? 'bg-orange-100 text-orange-700 animate-pulse' : ''}
                                                    `}>
                                                        {status === 'pending' ? 'Pending Approval' : status}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => markAttendance(worker._id, 'present')}
                                                        className={`p-2 rounded hover:bg-green-100 hover:text-green-600 transition 
                                                            ${status === 'present' ? 'bg-green-100 text-green-600' : 'text-gray-400'}
                                                            ${status === 'pending' ? 'ring-2 ring-green-400 bg-green-50 text-green-600' : ''}
                                                            `}
                                                        title="Mark Present (Verify)"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => markAttendance(worker._id, 'absent')}
                                                        className={`p-2 rounded hover:bg-red-100 hover:text-red-600 transition ${status === 'absent' ? 'bg-red-100 text-red-600' : 'text-gray-400'}`}
                                                        title="Mark Absent"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => markAttendance(worker._id, 'half-day')}
                                                        className={`p-2 rounded hover:bg-yellow-100 hover:text-yellow-600 transition ${status === 'half-day' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'}`}
                                                        title="Mark Half Day"
                                                    >
                                                        <Clock size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {workers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-secondary">No active workers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Worker View */}
            {user.role === 'worker' && (
                <div className="max-w-md mx-auto mt-10">
                    <div className="card text-center p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">{format(new Date(), 'EEEE, MMMM do')}</h2>
                            <p className="text-secondary">Mark your attendance for today</p>
                        </div>

                        {myWorkerProfile ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <p className="text-sm text-secondary mb-2">Current Status</p>
                                    <div className={`text-xl font-semibold capitalize ${attendanceMap[myWorkerProfile._id]?.status === 'pending' ? 'text-orange-600' : ''}`}>
                                        {attendanceMap[myWorkerProfile._id]?.status === 'pending' ? 'Pending Approval' : (attendanceMap[myWorkerProfile._id]?.status || 'Not Marked')}
                                    </div>
                                </div>

                                {attendanceMap[myWorkerProfile._id]?.status ? (
                                    <button
                                        className={`btn w-full py-3 text-lg justify-center cursor-default pointer-events-none
                                            ${attendanceMap[myWorkerProfile._id]?.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}
                                        `}
                                    >
                                        {attendanceMap[myWorkerProfile._id]?.status === 'pending' ? 'Waiting for Admin Verification' : `Marked as ${attendanceMap[myWorkerProfile._id]?.status}`}
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary w-full py-3 text-lg justify-center"
                                        onClick={() => markAttendance(myWorkerProfile._id, 'present')} // This will default to pending on backend
                                        disabled={loading}
                                    >
                                        Mark Present
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-amber-600 text-sm bg-amber-50 p-4 rounded">
                                <p>We couldn't find a Worker Profile matching your name (<strong>{user.name}</strong>).</p>
                                <p className="mt-1">Please ask the Admin to check that your Worker Name matches exactly.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
