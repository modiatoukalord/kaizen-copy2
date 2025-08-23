
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

const navigationGroups = {
  transactions: [
    { href: '/income', label: 'Revenus' },
    { href: '/expenses', label: 'Dépenses' },
    { href: '/transfers', label: 'Virements' },
  ],
  synthesis: [
    { href: '/charts', label: 'Graphiques' },
  ],
  planning: [
    { href: '/planning', label: 'Planning' },
  ],
};

const findGroup = (pathname: string) => {
  if (navigationGroups.transactions.some(item => pathname.startsWith(item.href))) {
    return navigationGroups.transactions;
  }
  if (navigationGroups.synthesis.some(item => pathname.startsWith(item.href))) {
    return navigationGroups.synthesis;
  }
  if (navigationGroups.planning.some(item => pathname.startsWith(item.href))) {
    return navigationGroups.planning;
  }
  return [];
}

export default function SubNavigation() {
  const pathname = usePathname();
  const currentGroup = findGroup(pathname);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <Button variant="outline" asChild className="hidden sm:inline-flex">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tableau de bord
        </Link>
      </Button>
      <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
        {currentGroup.map(item => {
          const isActive = pathname === item.href;
          return (
            <Button key={item.href} variant={isActive ? 'default' : 'ghost'} size="sm" asChild className="text-sm">
              <Link href={item.href}>
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  );
}
