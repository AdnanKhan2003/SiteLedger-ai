import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from './components/AuthGuard';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
    metadataBase: new URL('https://site-ledger-ai.vercel.app'),
    title: 'SideLedger AI - AI-Powered Construction Management',
    description: 'Streamline your construction projects with AI-powered insights, labor management, invoicing, and real-time analytics.',
    keywords: ['construction management', 'AI', 'project management', 'labor tracking', 'invoicing'],
    authors: [{ name: 'SideLedger AI' }],
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
    openGraph: {
        title: 'SideLedger AI - AI-Powered Construction Management',
        description: 'Streamline your construction projects with AI-powered insights, labor management, invoicing, and real-time analytics.',
        url: '/',
        siteName: 'SideLedger AI',
        images: [
            {
                url: '/opengraph-image.jpg',
                width: 1200,
                height: 630,
                alt: 'SideLedger AI - Construction Management Platform',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SideLedger AI - AI-Powered Construction Management',
        description: 'Streamline your construction projects with AI-powered insights, labor management, invoicing, and real-time analytics.',
        creator: '@SideLedgerAI',
        images: ['/twitter-image.jpg'],
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@graph": [
                                {
                                    "@type": "Organization",
                                    "@id": "https://site-ledger-ai.vercel.app/#organization",
                                    "name": "SideLedger AI",
                                    "url": "https://site-ledger-ai.vercel.app",
                                    "logo": "https://site-ledger-ai.vercel.app/logo.png",
                                    "description": "Next-generation AI-powered construction management and expense tracking platform."
                                },
                                {
                                    "@type": "WebSite",
                                    "@id": "https://site-ledger-ai.vercel.app/#website",
                                    "url": "https://site-ledger-ai.vercel.app",
                                    "name": "SideLedger AI",
                                    "publisher": { "@id": "https://site-ledger-ai.vercel.app/#organization" },
                                    "potentialAction": {
                                        "@type": "SearchAction",
                                        "target": "https://site-ledger-ai.vercel.app/search?q={search_term_string}",
                                        "query-input": "required name=search_term_string"
                                    }
                                },
                                {
                                    "@type": "SoftwareApplication",
                                    "name": "SideLedger AI",
                                    "operatingSystem": "Web",
                                    "applicationCategory": "BusinessApplication",
                                    "description": "AI-powered construction management and expense tracking platform for modern developers and contractors.",
                                    "aggregateRating": {
                                        "@type": "AggregateRating",
                                        "ratingValue": "4.9",
                                        "ratingCount": "120"
                                    },
                                    "offers": {
                                        "@type": "Offer",
                                        "price": "0",
                                        "priceCurrency": "INR"
                                    }
                                },
                                {
                                    "@type": "FAQPage",
                                    "mainEntity": [
                                        {
                                            "@type": "Question",
                                            "name": "How does SideLedger AI help construction managers?",
                                            "acceptedAnswer": {
                                                "@type": "Answer",
                                                "text": "It automates expense tracking, provides AI-driven project insights, and manages worker attendance in real-time."
                                            }
                                        },
                                        {
                                            "@type": "Question",
                                            "name": "Is there a limit to AI insights?",
                                            "acceptedAnswer": {
                                                "@type": "Answer",
                                                "text": "The free tier has a daily limit for AI-generated insights, which resets every 24 hours."
                                            }
                                        }
                                    ]
                                },
                                {
                                    "@type": "HowTo",
                                    "name": "How to track construction expenses with SideLedger AI",
                                    "step": [
                                        { "@type": "HowToStep", "text": "Navigate to the Expenses section." },
                                        { "@type": "HowToStep", "text": "Upload your invoice or enter manual entries." },
                                        { "@type": "HowToStep", "text": "View real-time cost breakdown in the analytics dashboard." }
                                    ]
                                },
                                {
                                    "@type": "ItemList",
                                    "name": "Core Features",
                                    "itemListElement": [
                                        { "@type": "ListItem", "position": 1, "name": "AI Executive Summaries" },
                                        { "@type": "ListItem", "position": 2, "name": "Dynamic Cost Breakdown" },
                                        { "@type": "ListItem", "position": 3, "name": "Attendance Monitoring" }
                                    ]
                                },
                                {
                                    "@type": "WebPage",
                                    "@id": "https://site-ledger-ai.vercel.app/#webpage",
                                    "url": "https://site-ledger-ai.vercel.app",
                                    "name": "SideLedger AI Dashboard",
                                    "isPartOf": { "@id": "https://site-ledger-ai.vercel.app/#website" },
                                    "description": "Admin dashboard for managing construction projects, expenses, and AI-driven insights."
                                },
                                {
                                    "@type": "SiteNavigationElement",
                                    "name": "Main Navigation",
                                    "hasPart": [
                                        { "@type": "WebPage", "name": "Dashboard", "url": "https://site-ledger-ai.vercel.app/" },
                                        { "@type": "WebPage", "name": "Projects", "url": "https://site-ledger-ai.vercel.app/projects" },
                                        { "@type": "WebPage", "name": "AI Insights", "url": "https://site-ledger-ai.vercel.app/ai" },
                                        { "@type": "WebPage", "name": "Settings", "url": "https://site-ledger-ai.vercel.app/settings" }
                                    ]
                                }
                            ]
                        })
                    }}
                />
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
