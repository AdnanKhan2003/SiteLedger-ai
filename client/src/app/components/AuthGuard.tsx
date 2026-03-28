'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const publicPaths = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user && !publicPaths.includes(pathname)) {
                router.push('/login');
            } else if (user && publicPaths.includes(pathname)) {
                router.push('/');
            }
        }
    }, [user, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded mb-4"></div>
                </div>
            </div>
        );
    }


    if (publicPaths.includes(pathname)) {
        return <>{children}</>;
    }


    if (user) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen">
                <div className="md:hidden flex items-center p-4 border-b border-border bg-white fixed top-0 left-0 right-0 z-30 h-14">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-1 mr-3 text-secondary hover:text-foreground"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-sm">SideLedger AI</span>
                </div>

                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="main-content flex-1 w-full">
                    {children}
                </main>
            </div>
        );
    }

    return null;
}
