import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from './components/AuthGuard';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    ),
    title: 'SideLedger AI - AI-Powered Construction Management',
    description: 'Streamline your construction projects with AI-powered insights, labor management, invoicing, and real-time analytics.',
    keywords: ['construction management', 'AI', 'project management', 'labor tracking', 'invoicing'],
    authors: [{ name: 'SideLedger AI' }],
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon.png', type: 'image/png', sizes: '512x512' },
        ],
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'SideLedger AI - AI-Powered Construction Management',
        description: 'Streamline your construction projects with AI-powered insights, labor management, invoicing, and real-time analytics.',
        url: '/',
        siteName: 'SideLedger AI',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SideLedger AI - AI-Powered Construction Management',
        description: 'Streamline your construction projects with AI-powered insights, labor management, invoicing, and real-time analytics.',
        creator: '@SideLedgerAI',
    },
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
