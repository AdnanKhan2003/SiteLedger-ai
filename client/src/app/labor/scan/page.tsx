'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '@/lib/api';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [manualId, setManualId] = useState('');
    const [mode, setMode] = useState<'scan' | 'manual'>('scan');

    useEffect(() => {
        if (mode === 'scan') {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );

            scanner.render((decodedText) => {
                handleScan(decodedText);
                scanner.clear(); // Stop scanning after success
            }, (error) => {
                // console.warn(error);
            });

            return () => {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            };
        }
    }, [mode]);

    const handleScan = async (workerId: string) => {
        setScanResult(workerId);
        await markAttendance(workerId);
    };

    const markAttendance = async (workerId: string) => {
        try {
            const res = await api.post('/attendance', {
                workerId,
                date: new Date(),
                timeIn: new Date(),
                status: 'present'
            });
            setMessage({ type: 'success', text: `Attendance Marked for Worker ID: ${workerId}` });
            setTimeout(() => {
                setMessage(null);
                setScanResult(null);
                window.location.reload();
            }, 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to mark attendance' });
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        markAttendance(manualId);
    };

    return (
        <div className="container max-w-xl flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Attendance Scanner</h1>

            <div className="flex gap-4 mb-2">
                <button
                    className={`btn flex-1 ${mode === 'scan' ? 'bg-foreground text-background border-foreground' : 'btn-outline'}`}
                    onClick={() => setMode('scan')}
                >
                    QR Scanner
                </button>
                <button
                    className={`btn flex-1 ${mode === 'manual' ? 'bg-foreground text-background border-foreground' : 'btn-outline'}`}
                    onClick={() => setMode('manual')}
                >
                    Manual Entry
                </button>
            </div>

            {message && (
                <div className={`card flex items-center gap-3 p-4 font-semibold border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {mode === 'scan' && (
                <div className="card">
                    <div id="reader" className="w-full"></div>
                    <p className="text-center mt-4 text-secondary text-sm">
                        Point camera at worker QR code
                    </p>
                </div>
            )}

            {mode === 'manual' && (
                <form onSubmit={handleManualSubmit} className="card">
                    <div className="mb-4">
                        <label className="block mb-2 font-medium text-secondary text-sm">Worker ID</label>
                        <input
                            className="input"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            placeholder="Enter Worker ID manually"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                        Mark Present
                    </button>
                </form>
            )}
        </div>
    );
}
