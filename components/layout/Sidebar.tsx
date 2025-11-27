'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Briefcase, Users, DollarSign, UserCheck, Settings, LogOut } from 'lucide-react';

const menuItems = [
    { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'المشاريع', icon: Briefcase },
    { href: '/dashboard/clients', label: 'العملاء', icon: Users },
    { href: '/dashboard/finance', label: 'المالية', icon: DollarSign },
    { href: '/dashboard/hr', label: 'الموارد البشرية', icon: UserCheck },
    { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-card border-l border-border h-screen flex flex-col hidden md:flex sticky top-0">
            <div className="p-6 border-b border-border flex items-center justify-center">
                <h1 className="text-xl font-bold text-primary">المكتب الهندسي</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <button
                    onClick={async () => {
                        try {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            window.location.href = '/login';
                        } catch (error) {
                            console.error('Logout failed', error);
                            window.location.href = '/login';
                        }
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-destructive hover:bg-destructive/10 rounded-md transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
