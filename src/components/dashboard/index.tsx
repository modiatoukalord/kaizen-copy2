
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
import type { Transaction, Period, Category, Transfer } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCards from './stat-cards';
import TransactionsTable from './transactions-table';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { IncomeCategory, ExpenseCategory, TransactionAccount } from '@/lib/types';
import { Button } from '../ui/button';

interface DashboardProps {
  initialTransactions: Transaction[];
  initialTransfers?: Transfer[];
  title?: string;
  filterType?: 'income' | 'expense';
  hideCharts?: boolean;
}

export default function Dashboard({ initialTransactions, initialTransfers = [], title="Tableau de bord", filterType, hideCharts = false }: DashboardProps) {
  const [period, setPeriod] = useState<Period>('monthly');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);


  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);
  
  React.useEffect(() => {
    setTransfers(initialTransfers);
  }, [initialTransfers]);

  const filteredData = useMemo(() => {
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

    let periodTransactions = transactions.filter(t => isWithinInterval(new Date(t.date), interval));
    const periodTransfers = transfers.filter(t => isWithinInterval(new Date(t.date), interval));

    if (filterType) {
        periodTransactions = periodTransactions.filter(t => t.type === filterType);
    }

    return { transactions: periodTransactions, transfers: periodTransfers };
  }, [period, transactions, transfers, filterType]);
  
  const allTransactionsForType = useMemo(() => {
     if (filterType) {
        return transactions.filter(t => t.type === filterType);
    }
    return transactions;
  }, [transactions, filterType]);

  const categoryOptions = React.useMemo(() => {
    let categories: readonly string[];
    if (filterType === 'income') {
      categories = IncomeCategory;
    } else if (filterType === 'expense') {
      categories = ExpenseCategory;
    } else {
      categories = [...IncomeCategory, ...ExpenseCategory];
    }
    return categories.map(cat => ({ label: cat, value: cat }));
  }, [filterType]);


  if (filterType) {
    return (
        <>
            <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
            <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="space-y-4">
                <TabsList>
                <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
                <TabsTrigger value="monthly">Mensuel</TabsTrigger>
                <TabsTrigger value="quarterly">Trimestriel</TabsTrigger>
                <TabsTrigger value="annually">Annuel</TabsTrigger>
                </TabsList>
            </Tabs>
            </div>
            
            <StatCards transactions={filteredData.transactions} transfers={filteredData.transfers} filterType={filterType} />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 lg:col-span-7">
                    <TransactionsTable 
                        transactions={allTransactionsForType} 
                        filterType={filterType} 
                        categoryOptions={categoryOptions}
                    />
                </div>
            </div>
        </>
    )
  }

  return (
    <>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
              <TabsTrigger value="monthly">Mensuel</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestriel</TabsTrigger>
              <TabsTrigger value="annually">Annuel</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <StatCards transactions={filteredData.transactions} transfers={filteredData.transfers} filterType={filterType} />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 lg:col-span-7">
                <TransactionsTable 
                    transactions={transactions} 
                    categoryOptions={categoryOptions}
                />
            </div>
        </div>
    </>
  );
}
