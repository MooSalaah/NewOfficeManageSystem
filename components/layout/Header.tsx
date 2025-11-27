'use client';

import { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { Notifications } from '@/components/notifications';
import { Button } from '@/components/ui/button';
import { MobileSidebar } from '@/components/layout/MobileSidebar';

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4 w-1/3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative w-full max-w-sm hidden md:block">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث..." className="pr-10" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ModeToggle />
                <Notifications />
                <UserNav />
            </div>

            <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </header>
    );
}
