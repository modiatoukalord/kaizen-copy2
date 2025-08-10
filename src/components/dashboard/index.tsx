
'use client';

import React, { useState, useMemo } from 'react';
import {
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from 'date-fns';
import type { Transaction, Period } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from './dashboard-header';
import StatCards from './stat-cards';
import ExpensesChart from './expenses-chart';
import TransactionsTable from './transactions-table';

interface DashboardProps {
  initialTransactions: Transaction[];
}

export default function Dashboard({ initialTransactions }: DashboardProps) {
  const [period, setPeriod] = useState<Period>('monthly');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let interval;

    switch (period) {
      case 'weekly':
        interval = { start: startOfWeek(now), end: endOfWeek(now) };
        break;
      case 'monthly':
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      case 'quarterly':
        interval = { start: startOfQuarter(now), end: endOfQuarter(now) };
        break;
      case 'annually':
        interval = { start: startOfYear(now), end: endOfYear(now) };
        break;
    }

    return transactions.filter(t => isWithinInterval(new Date(t.date), interval));
  }, [period, transactions]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="annually">Annually</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <StatCards transactions={filteredTransactions} />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
                <ExpensesChart transactions={filteredTransactions} />
            </div>
            <div className="col-span-4 lg:col-span-3">
                <TransactionsTable transactions={filteredTransactions} />
            </div>
        </div>
      </main>
    </div>
  );
}
