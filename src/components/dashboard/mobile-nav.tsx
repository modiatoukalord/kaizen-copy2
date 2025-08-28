
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, CalendarDays, ArrowRightLeft, Plus, Settings, TrendingUp, TrendingDown, Repeat, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionSheet } from './add-transaction-sheet';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetClose } from '../ui/sheet';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AddTransferSheet } from './add-transfer-sheet';

export default function MobileNav() {
    const pathname = usePathname();
    const [isActionsSheetOpen, setIsActionsSheetOpen] = useState(false);
    const [isAddSheetOpen, setAddSheetOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated || pathname === '/login') {
        return null;
    }

    const mainNavItems = [
        { href: '/dashboard', label: 'Board', icon: LayoutDashboard },
        { href: '/charts', label: 'Graphiques', icon: BarChart2 },
    ];
    
    const secondaryNavItems = [
         { href: '/planning', label: 'Planning', icon: CalendarDays },
    ];

    const actionsNavItems = [
        { href: '/income', label: 'Revenus', icon: TrendingUp },
        { href: '/expenses', label: 'Dépenses', icon: TrendingDown },
        { href: '/transfers', label: 'Virements', icon: ArrowRightLeft },
        { href: '/settings', label: 'Paramètres', icon: Settings },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className="relative grid h-16 grid-cols-5 items-center">
                {mainNavItems.map((item) => {
                    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                            <span className={cn(isActive && "text-primary")}>{item.label}</span>
                        </Link>
                    )
                })}
                
                <div className="flex justify-center">
                    <Sheet open={isAddSheetOpen} onOpenChange={setAddSheetOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg -translate-y-4">
                                <Plus className="h-6 w-6" />
                                <span className="sr-only">Ajouter une opération</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-lg">
                            <SheetHeader>
                                <SheetTitle>Nouvelle opération</SheetTitle>
                                <SheetDescription>Que souhaitez-vous ajouter ?</SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-3 py-4">
                                <AddTransactionSheet type="income" onSheetToggle={() => setAddSheetOpen(false)}>
                                    <Button variant="ghost" className='justify-start text-base p-3 h-auto'>
                                        <TrendingUp className="mr-3 h-5 w-5" />
                                        Ajouter un revenu
                                    </Button>
                                </AddTransactionSheet>
                                <AddTransactionSheet type="expense" onSheetToggle={() => setAddSheetOpen(false)}>
                                     <Button variant="ghost" className='justify-start text-base p-3 h-auto'>
                                        <TrendingDown className="mr-3 h-5 w-5" />
                                        Ajouter une dépense
                                    </Button>
                                </AddTransactionSheet>
                                 <AddTransferSheet onSheetToggle={() => setAddSheetOpen(false)}>
                                     <Button variant="ghost" className='justify-start text-base p-3 h-auto'>
                                        <ArrowLeftRight className="mr-3 h-5 w-5" />
                                        Ajouter un virement
                                    </Button>
                                </AddTransferSheet>
                            </div>
                        </SheetContent>
                    </Sheet>
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

                <Sheet open={isActionsSheetOpen} onOpenChange={setIsActionsSheetOpen}>
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
                            {actionsNavItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link key={item.href} href={item.href} onClick={() => setIsActionsSheetOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-base", isActive && "bg-muted text-primary")}>
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
