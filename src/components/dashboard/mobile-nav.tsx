
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, CalendarDays, ArrowRightLeft, Plus, Wallet, TrendingUp, TrendingDown, Repeat, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionSheet } from './add-transaction-sheet';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetClose } from '../ui/sheet';
import { useState } from 'react';
import ChatAssistant from '../assistant/chat-assistant';

export default function MobileNav() {
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const mainNavItems = [
        { href: '/', label: 'Board', icon: LayoutDashboard },
        { href: '/charts', label: 'Graphiques', icon: BarChart2 },
    ];
    
    const secondaryNavItems = [
         { href: '/planning', label: 'Planning', icon: CalendarDays },
    ];

    const actionsNavItems = [
        { href: '/income', label: 'Revenus', icon: TrendingUp },
        { href: '/expenses', label: 'Dépenses', icon: TrendingDown },
        { href: '/transfers', label: 'Virements', icon: ArrowRightLeft },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className="relative grid h-16 grid-cols-5 items-center">
                {mainNavItems.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                            <span className={cn(isActive && "text-primary")}>{item.label}</span>
                        </Link>
                    )
                })}
                
                <div className="flex justify-center">
                   <ChatAssistant>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg -translate-y-4">
                            <Bot className="h-6 w-6" />
                            <span className="sr-only">Ouvrir l'assistant</span>
                        </Button>
                   </ChatAssistant>
                </div>
                
                 {secondaryNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                            <span className={cn(isActive && "text-primary")}>{item.label}</span>
                        </Link>
                    )
                })}

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                            <Repeat className="h-5 w-5" />
                            <span>Actions</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-lg">
                        <SheetHeader>
                            <SheetTitle>Actions rapides</SheetTitle>
                            <SheetDescription>Naviguez vers les sections financières.</SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-3 py-4">
                            <AddTransactionSheet>
                                <Button variant="ghost" className='justify-start text-base p-3 h-auto'>
                                    <Plus className="mr-3 h-5 w-5" />
                                    Ajouter une transaction
                                </Button>
                            </AddTransactionSheet>

                            {actionsNavItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link key={item.href} href={item.href} onClick={() => setIsSheetOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-base", isActive && "bg-muted text-primary")}>
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
