
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiggyBank, PlusCircle, ArrowRightLeft, Menu } from 'lucide-react';
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
import { useState } from 'react';

export default function DashboardHeader() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Tableau de bord' },
    { href: '/income', label: 'Revenus' },
    { href: '/expenses', label: 'Dépenses' },
    { href: '/transfers', label: 'Virements' },
    { href: '/charts', label: 'Graphiques' },
    { href: '/planning', label: 'Planning' },
  ];
  
  const showNav = pathname !== '/';

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

      {showNav && (
        <nav className="hidden flex-col items-center justify-center gap-6 text-lg font-medium md:flex md:flex-row md:gap-2 lg:gap-4">
            {navItems.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'transition-colors hover:text-foreground rounded-md px-3 py-2 text-sm font-medium',
                        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    )}
                    >
                    {item.label}
                    </Link>
                );
            })}
        </nav>
      )}

        <div className="flex items-center gap-2">
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

            <div className="hidden md:flex items-center gap-2">
                 {!isPlanningPage && (
                  isTransfersPage ? (
                      <AddTransferSheet>
                          <Button>
                              <ArrowRightLeft className="mr-2 h-4 w-4" />
                              Nouveau virement
                          </Button>
                      </AddTransferSheet>
                  ) : (
                      <AddTransactionSheet type={transactionType}>
                          <Button>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Ajouter une transaction
                          </Button>
                      </AddTransactionSheet>
                  )
                )}
            </div>
            
            {/* The mobile navigation is now handled by MobileNav component, so we remove the Sheet here */}
        </div>
    </header>
  );
}
