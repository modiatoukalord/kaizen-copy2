'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiggyBank, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionSheet } from './add-transaction-sheet';
import { cn } from '@/lib/utils';

export default function DashboardHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/income', label: 'Revenus' },
    { href: '/expenses', label: 'Dépenses' },
  ];

  const transactionType = (() => {
    if (pathname === '/income') return 'income';
    if (pathname === '/expenses') return 'expense';
    return undefined;
  })();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <nav className="hidden w-full flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <PiggyBank className="h-6 w-6 text-primary" />
          <span className="font-headline">Financial Compass</span>
        </Link>
        {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-muted-foreground transition-colors hover:text-foreground',
                pathname === item.href && 'text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
      </nav>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <AddTransactionSheet type={transactionType}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </AddTransactionSheet>
      </div>
    </header>
  );
}
