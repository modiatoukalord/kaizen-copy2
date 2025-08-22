
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, CalendarDays, ArrowRightLeft, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionSheet } from './add-transaction-sheet';
import { Button } from '../ui/button';

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Board', icon: LayoutDashboard },
        { href: '/charts', label: 'Graphiques', icon: BarChart2 },
        { href: '/planning', label: 'Planning', icon: CalendarDays },
        { href: '/transfers', label: 'Virements', icon: ArrowRightLeft },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className="relative grid h-16 grid-cols-5 items-center">
                {navItems.slice(0, 2).map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                            <span className={cn(isActive && "text-primary")}>{item.label}</span>
                        </Link>
                    )
                })}
                
                <div className="flex justify-center">
                    <AddTransactionSheet>
                         <Button size="icon" className="h-14 w-14 rounded-full shadow-lg -translate-y-4">
                            <Plus className="h-6 w-6" />
                            <span className="sr-only">Ajouter une transaction</span>
                        </Button>
                    </AddTransactionSheet>
                </div>

                {navItems.slice(2, 4).map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                            <span className={cn(isActive && "text-primary")}>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
