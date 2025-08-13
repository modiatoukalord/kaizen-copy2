

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
  parseISO,
} from 'date-fns';
import type { Transaction, Period, Category, Transfer, Scope } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCards from './stat-cards';
import TransactionsTable from './transactions-table';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { IncomeCategory, AllExpenseSubCategories } from '@/lib/types';
import { Button } from '../ui/button';
import SummaryChart from './summary-chart';


interface DashboardProps {
  initialTransactions: Transaction[];
  initialTransfers?: Transfer[];
  title?: string;
  filterType?: 'income' | 'expense';
  scope?: Scope;
  hideCharts?: boolean;
}

export default function Dashboard({ initialTransactions, initialTransfers = [], title="Tableau de bord", filterType, scope, hideCharts = false }: DashboardProps) {
  const [period, setPeriod] = useState<Period>('monthly');
  const [globalFilter, setGlobalFilter] = React.useState('');


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

    let periodTransactions = initialTransactions.filter(t => isWithinInterval(parseISO(t.date), interval));
    const periodTransfers = initialTransfers.filter(t => isWithinInterval(parseISO(t.date), interval));

    if (filterType) {
        periodTransactions = periodTransactions.filter(t => t.type === filterType);
    }
    
    if (scope) {
      periodTransactions = periodTransactions.filter(t => t.scope === scope);
    }

    return { transactions: periodTransactions, transfers: periodTransfers };
  }, [period, initialTransactions, initialTransfers, filterType, scope]);
  
  const allTransactionsForType = useMemo(() => {
     let transactions = initialTransactions;
     if (filterType) {
        transactions = transactions.filter(t => t.type === filterType);
    }
    if (scope) {
        transactions = transactions.filter(t => t.scope === scope);
    }
    return transactions;
  }, [initialTransactions, filterType, scope]);

  const categoryOptions = React.useMemo(() => {
    let categories: readonly string[];
    if (filterType === 'income') {
      categories = IncomeCategory;
    } else if (filterType === 'expense') {
      categories = AllExpenseSubCategories;
    } else {
      categories = [...IncomeCategory, ...AllExpenseSubCategories];
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
                        scope={scope}
                        categoryOptions={categoryOptions}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={setGlobalFilter}
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
        
        <div className="grid gap-4">
            <SummaryChart transactions={filteredData.transactions} period={period} />
        </div>
    </>
  );
}
