'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Briefcase, Users, DollarSign, UserCheck, Settings, LogOut, X, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
    { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/projects', label: 'المشاريع', icon: Briefcase },
    { href: '/tasks', label: 'المهام', icon: ClipboardList },
    { href: '/clients', label: 'العملاء', icon: Users },
    { href: '/finance', label: 'المالية', icon: DollarSign },
    { href: '/hr', label: 'الموارد البشرية', icon: UserCheck },
    { href: '/settings', label: 'الإعدادات', icon: Settings },
];

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
    const pathname = usePathname();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <aside className="relative w-64 bg-card border-l border-border h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary">المكتب الهندسي</h1>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
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
                        className="flex items-center gap-3 px-4 py-3 w-full text-destructive hover:bg-destructive/10 rounded-md transition-colors font-medium cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </div>
    );
}
