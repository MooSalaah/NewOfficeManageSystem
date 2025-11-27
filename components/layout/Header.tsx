'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { Notifications } from '@/components/notifications';

export function Header() {
    return (
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث..." className="pr-10" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ModeToggle />
                <Notifications />
                <UserNav />
            </div>
        </header>
    );
}
