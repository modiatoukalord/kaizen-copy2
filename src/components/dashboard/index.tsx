

'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  sub,
  add,
  format,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Transaction, Category, Period, Transfer } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StatCards from './stat-cards';
import TransactionsTable from './transactions-table';
import SummaryChart from './summary-chart';
import ExpensesChart from './expenses-chart';
import { IncomeCategory, AllExpenseSubCategories } from '@/lib/types';
import { getTransactions, getTransfers } from '@/lib/data';


interface DashboardProps {
  initialTransactions: Transaction[];
  initialTransfers?: Transfer[];
  title?: string;
  filterType?: 'income' | 'expense';
  hideCharts?: boolean;
}

export default function Dashboard({ initialTransactions, initialTransfers = [], title, filterType, hideCharts = false }: DashboardProps) {
  const [period, setPeriod] = useState<Period>('monthly');
  const [date, setDate] = useState(new Date());

  const { startDate, endDate, display } = useMemo(() => {
    let start, end;
    let displayStr;
    switch (period) {
      case 'weekly':
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
        displayStr = `Semaine du ${format(start, 'd MMM', { locale: fr })}`;
        break;
      case 'quarterly':
        start = startOfQuarter(date);
        end = endOfQuarter(date);
        const quarter = Math.floor(start.getMonth() / 3) + 1;
        displayStr = `T${quarter} ${format(start, 'yyyy')}`;
        break;
      case 'annually':
        start = startOfYear(date);
        end = endOfYear(date);
        displayStr = format(start, 'yyyy');
        break;
      case 'monthly':
      default:
        start = startOfMonth(date);
        end = endOfMonth(date);
        displayStr = format(start, 'MMMM yyyy', { locale: fr });
        break;
    }
    return { startDate: start, endDate: end, display: displayStr };
  }, [period, date]);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setDate(new Date()); // Reset date when period changes
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const duration =
      period === 'weekly' ? { weeks: 1 }
      : period === 'monthly' ? { months: 1 }
      : period === 'quarterly' ? { quarters: 1 }
      : { years: 1 };
    
    setDate(d => (direction === 'prev' ? sub(d, duration) : add(d, duration)));
  };

  const filteredData = useMemo(() => {
    const interval = { start: startDate, end: endDate };
    let periodTransactions = initialTransactions.filter(t => isWithinInterval(parseISO(t.date), interval));
    const periodTransfers = initialTransfers.filter(t => isWithinInterval(parseISO(t.date), interval));

    if (filterType) {
        periodTransactions = periodTransactions.filter(t => t.type === filterType);
    }
    
    return { transactions: periodTransactions, transfers: periodTransfers };
  }, [startDate, endDate, initialTransactions, initialTransfers, filterType]);
  
  const allTransactionsForType = useMemo(() => {
     let filtered = initialTransactions;
     if (filterType) {
        filtered = filtered.filter(t => t.type === filterType);
    }
    return filtered;
  }, [initialTransactions, filterType]);

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


  return (
    <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            <div className="flex w-full flex-col items-stretch justify-end gap-2 sm:w-auto sm:flex-row">
                <Tabs value={period} onValueChange={(value) => handlePeriodChange(value as Period)} className='w-full sm:w-auto'>
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        <TabsTrigger value="monthly">Mois</TabsTrigger>
                        <TabsTrigger value="weekly">Semaine</TabsTrigger>
                        <TabsTrigger value="quarterly">Trimestre</TabsTrigger>
                        <TabsTrigger value="annually">Année</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="flex-1 text-sm font-medium w-32 text-center">{display}</span>
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
        
        <StatCards transactions={filteredData.transactions} transfers={filteredData.transfers} filterType={filterType} />

        {!hideCharts && (
             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SummaryChart transactions={filteredData.transactions} period={period}/>
                <ExpensesChart transactions={filteredData.transactions} />
             </div>
        )}
        
        <div className="overflow-x-auto">
            <TransactionsTable 
                transactions={allTransactionsForType} 
                filterType={filterType}
                categoryOptions={categoryOptions}
            />
        </div>
    </div>
  );
}
