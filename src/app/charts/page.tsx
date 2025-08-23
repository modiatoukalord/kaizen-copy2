
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { getTransactions } from '@/lib/data';
import IncomeExpenseChart from '@/components/dashboard/income-expense-chart';
import ParetoChart from '@/components/dashboard/pareto-chart';
import type { Transaction } from '@/lib/types';
import SubNavigation from '@/components/dashboard/sub-navigation';

function ChartsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchTransactions();
  }, []);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <SubNavigation />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Graphiques</h1>
                <p className="text-muted-foreground">Visualisez vos données financières.</p>
              </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <IncomeExpenseChart transactions={transactions} />
            <ParetoChart transactions={transactions} />
        </div>
      </div>
    </div>
  );
}


export default function ChartsPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ChartsContent />
    </Suspense>
  )
}
