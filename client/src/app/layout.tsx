import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from './components/AuthGuard';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
    title: 'SideLedger AI',
    description: 'AI-Powered Construction Management',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    <AuthProvider>
                        <AuthGuard>
                            {children}
                        </AuthGuard>
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
