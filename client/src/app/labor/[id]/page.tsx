'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Download } from 'lucide-react';

export default function WorkerDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [worker, setWorker] = useState<any>(null);
    const [qrUrl, setQrUrl] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isAdmin = user?.role === 'admin';

    const workerId = params.id;

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const res = await api.get(`/workers/${workerId}`);
                setWorker(res.data);
                generateQR(res.data._id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchWorker();
    }, [workerId]);

    const generateQR = async (id: string) => {
        try {
            const url = await QRCode.toDataURL(id);
            setQrUrl(url);
        } catch (err) {
            console.error(err);
        }
    };

    const downloadQR = () => {
        if (!qrUrl) return;
        const link = document.createElement('a');
        link.download = `worker-${worker?.name}-qr.png`;
        link.href = qrUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!worker) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <button onClick={() => router.back()} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="card" style={{ maxWidth: '800px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ marginBottom: '0.5rem' }}>{worker.name}</h1>
                    <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>{worker.role}</p>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <strong>Specialty:</strong> {worker.specialty || 'Not specified'}
                        </div>
                        <div>
                            <strong>Phone:</strong> {worker.phone}
                        </div>
                        {isAdmin && (
                            <div>
                                <strong>Daily Rate:</strong> ₹{worker.dailyRate}
                            </div>
                        )}
                        <div>
                            <strong>Status:</strong> {worker.status}
                        </div>
                        <div>
                            <strong>Joined:</strong> {new Date(worker.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <h3>Worker ID QR</h3>
                    {qrUrl && <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />}
                    <button onClick={downloadQR} className="btn btn-primary">
                        <Download size={16} /> Download PNG
                    </button>
                </div>
            </div>
        </div>
    );
}
