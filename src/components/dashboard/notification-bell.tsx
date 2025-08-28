
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, AlertTriangle, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { getTransactions, getBudgetItems, getCalendarEvents } from '@/lib/data';
import type { Transaction, BudgetItem, CalendarEvent, Category } from '@/lib/types';
import { format, isFuture, differenceInDays, getYear, getMonth, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

export default function NotificationBell() {
    const { currency } = useCurrency();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const now = new Date();
            const year = getYear(now);
            const month = format(now, 'MM');

            const [trans, budget, ev] = await Promise.all([
                getTransactions(),
                getBudgetItems(year, month),
                getCalendarEvents(),
            ]);
            setTransactions(trans);
            setBudgetItems(budget);
            setEvents(ev);
        };
        fetchData();
    }, []);

    const upcomingEvents = useMemo(() => {
        const today = new Date();
        return events
            .filter(event => isFuture(new Date(event.date)) && differenceInDays(new Date(event.date), today) <= 7)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events]);

    const overBudgetItems = useMemo(() => {
        if (!budgetItems.length) return [];
        const now = new Date();
        const startDate = startOfMonth(now);
        const endDate = endOfMonth(now);
        const interval = { start: startDate, end: endDate };

        const monthlyTransactions = transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), interval));
        
        const spentByCategory = monthlyTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<Category, number>);

        return budgetItems
            .map(item => ({
                ...item,
                spent: spentByCategory[item.category] || 0,
            }))
            .filter(item => item.planned > 0 && item.spent > item.planned);

    }, [budgetItems, transactions]);

    const notificationCount = upcomingEvents.length + overBudgetItems.length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="p-4">
                    <h4 className="font-medium text-center">Notifications</h4>
                </div>
                <Separator />
                <div className="py-2 max-h-80 overflow-y-auto">
                    {notificationCount === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Aucune nouvelle notification.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                           {overBudgetItems.map(item => (
                                <li key={item.id} className="flex items-start gap-3 p-2 rounded-lg bg-destructive/10">
                                     <AlertTriangle className="h-5 w-5 mt-1 text-destructive flex-shrink-0" />
                                     <div>
                                        <p className="font-semibold text-sm">Budget dépassé</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.category}: {formatCurrency(item.spent, currency)} / {formatCurrency(item.planned, currency)}
                                        </p>
                                     </div>
                                </li>
                           ))}
                           {upcomingEvents.map(event => (
                                <li key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-amber-500/10">
                                     <CalendarClock className="h-5 w-5 mt-1 text-amber-600 flex-shrink-0" />
                                     <div>
                                        <p className="font-semibold text-sm">{event.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(event.date), 'd MMMM', { locale: fr })} - {formatCurrency(event.amount, currency)}
                                        </p>
                                     </div>
                                </li>
                           ))}
                        </ul>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
