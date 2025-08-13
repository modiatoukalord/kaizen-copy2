
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Dashboard from '@/components/dashboard';
import { getTransactions } from '@/lib/data';
import type { Transaction, Scope } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExpensesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const scope: Scope = (searchParams.get('scope') as Scope) || 'Personnel';

  useState(() => {
    const fetchTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchTransactions();
  });

  const handleTabChange = (value: string) => {
    router.push(`/expenses?scope=${value}`);
  };
  
  const title = scope === 'Personnel' ? 'Dépenses Personnelles' : "Dépenses d'Entreprise";

  return (
    <div className="flex flex-col gap-4">
        <Tabs value={scope} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="Personnel">Personnel</TabsTrigger>
                <TabsTrigger value="Entreprise">Entreprise</TabsTrigger>
            </TabsList>
        </Tabs>
        <Dashboard 
            initialTransactions={transactions} 
            title={title}
            filterType='expense'
            scope={scope}
            hideCharts={true}
        />
    </div>
  )
}
