'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    HardHat,
    Receipt,
    BrainCircuit,
    Settings,
    LogOut
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: HardHat },
    { name: 'Labor', href: '/labor', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'AI Insights', href: '/ai', icon: BrainCircuit },
    { name: 'Settings', href: '/settings', icon: Settings },
];

import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

// ... (existing imports)

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside className={clsx(
                "fixed left-0 top-0 h-screen w-[260px] flex flex-col p-4 bg-sidebar-bg text-sidebar-text border-r border-border z-50 transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-2 font-semibold text-base">
                        <div className="w-6 h-6 bg-[#37352f] text-white rounded-[3px] flex items-center justify-center text-xs">SL</div>
                        <span>SideLedger AI</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-secondary hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {user && (
                    <div className="mb-4 px-2 py-2 bg-black/5 rounded text-sm">
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-secondary text-xs truncate">{user.email}</p>
                    </div>
                )}

                <nav className="flex flex-col gap-[2px] flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose} // Auto-close on mobile click
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-hover text-foreground font-semibold"
                                        : "text-[#5f5e5b] hover:bg-sidebar-hover hover:text-foreground"
                                )}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {user ? (
                    <button
                        onClick={logout}
                        className="mt-auto flex items-center gap-3 px-3 py-1.5 rounded text-sm text-[#5f5e5b] hover:bg-sidebar-hover hover:text-red-500 w-full text-left transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                ) : (
                    <Link href="/login" className="mt-auto btn btn-primary justify-center text-sm">
                        Login
                    </Link>
                )}
            </aside>
        </>
    );
}
