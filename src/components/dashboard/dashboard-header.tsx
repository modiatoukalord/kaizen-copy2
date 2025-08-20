
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiggyBank, PlusCircle, ArrowRightLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionSheet } from './add-transaction-sheet';
import { AddTransferSheet } from './add-transfer-sheet';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/contexts/currency-context';
import { useEffect, useMemo, useState } from 'react';
import { getTransactions } from '@/lib/data';
import type { Transaction, Category, Transfer, Scope } from '@/lib/types';
import { format, startOfMonth, endOfMonth, isWithinInterval, isFuture, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';


type BudgetItem = {
    category: Category;
    planned: number;
};

type CalendarEvent = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  scope: Scope;
};


export default function DashboardHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currency, setCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
   const [events, setEvents] = useState<CalendarEvent[]>([]);

   const scope: Scope = (searchParams.get('scope') as Scope) || 'Personnel';


  useEffect(() => {
    const fetchTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchTransactions();
    
    // Initialize state that depends on browser APIs here
    setBudgetItems([
        { category: 'Nourriture', planned: 200000 },
        { category: 'Transport', planned: 50000 },
        { category: 'Divertissement', planned: 75000 },
    ]);
  }, []);

  const monthlyTransactions = useMemo(() => {
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);
    const interval = { start: startDate, end: endDate };
    return transactions.filter(t => t.type === 'expense' && isWithinInterval(new Date(t.date), interval));
  }, [transactions]);

  const budgetWithSpent = useMemo(() => {
    const spentByCategory = monthlyTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<Category, number>);

    return budgetItems.map(item => ({
        ...item,
        spent: spentByCategory[item.category] || 0,
    }));
  }, [budgetItems, monthlyTransactions]);

  const overBudgetItemsCount = useMemo(() => {
    return budgetWithSpent.filter(item => item.planned - item.spent < 0).length;
  }, [budgetWithSpent]);
  
  const upcomingEventsCount = useMemo(() => {
    const today = new Date();
    return events.filter(event => 
        event.scope === scope && isFuture(event.date) && differenceInDays(event.date, today) <= 7
    ).length;
  }, [events, scope]);

  const totalAlerts = overBudgetItemsCount + upcomingEventsCount;


  const navItems = [
    { href: '/', label: 'Tableau de bord' },
    { href: '/income', label: 'Revenus' },
    { href: '/expenses', label: 'Dépenses' },
    { href: '/transfers', label: 'Virements' },
    { href: '/charts', label: 'Graphiques' },
    { href: '/planning', label: 'Planning', alerts: totalAlerts },
  ];

  const transactionType = (() => {
    if (pathname === '/income') return 'income';
    if (pathname === '/expenses') return 'expense';
    return undefined;
  })();
  
  const isTransfersPage = pathname === '/transfers';
  const isPlanningPage = pathname === '/planning';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <PiggyBank className="h-6 w-6 text-primary" />
          <span className="font-headline">Le KAIZEN</span>
        </Link>
      </div>

      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:justify-center md:gap-5 md:text-sm lg:gap-6">
        {navItems.map((item) => {
            const finalHref = item.href === '/' || item.href === '/transfers' ? item.href : `${item.href}?scope=${scope}`;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
                <Link
                key={item.href}
                href={finalHref}
                className={cn(
                    'text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2',
                    isActive && 'text-foreground'
                )}
                >
                {item.label}
                {item.alerts !== undefined && item.alerts > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 justify-center rounded-full p-0">{item.alerts}</Badge>
                )}
                </Link>
            );
        })}
      </nav>

      <div className="flex items-center justify-end gap-4 md:gap-2 lg:gap-4">
        <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Devise" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="XOF">FCFA</SelectItem>
            </SelectContent>
        </Select>
        {!isPlanningPage && (
          isTransfersPage ? (
              <AddTransferSheet>
                  <Button>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Nouveau virement
                  </Button>
              </AddTransferSheet>
          ) : (
              <AddTransactionSheet type={transactionType} scope={scope}>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter une transaction
                  </Button>
              </AddTransactionSheet>
          )
        )}
      </div>
    </header>
  );
}
