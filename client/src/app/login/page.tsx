'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { Eye, EyeOff, ShieldCheck, HardHat } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Function to handle login (used by form and guest buttons)
    const handleLogin = async (emailToUse: string, passwordToUse: string) => {
        setError('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/login', { email: emailToUse, password: passwordToUse });
            login(res.data.token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="card w-full max-w-md p-8 shadow-md relative z-10">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="SideLedger AI" className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-secondary">Login to SideLedger AI</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} // Toggle type
                                className="input pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-xs text-secondary uppercase">Quick Access</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            setEmail('admin@sideledger.ai');
                            setPassword('password123');
                            handleLogin('admin@sideledger.ai', 'password123');
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full p-2 rounded border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium"
                    >
                        <ShieldCheck size={16} />
                        Skip & Sign In as Admin
                    </button>
                    <button
                        onClick={() => {
                            setEmail('rahul@sideledger.ai');
                            setPassword('password123');
                            handleLogin('rahul@sideledger.ai', 'password123');
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full p-2 rounded border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors text-sm font-medium"
                    >
                        <HardHat size={16} />
                        Skip & Sign In as Worker
                    </button>
                </div>

                <p className="text-center mt-6 text-sm text-secondary">
                    Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
                </p>
                <p className="text-center mt-2 text-sm text-secondary">
                    Are you a worker? <Link href="/worker-register" className="text-primary hover:underline font-medium">Register here</Link>
                </p>
            </div>
        </div>
    );
}
