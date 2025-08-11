
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getTransactions } from '@/lib/data';
import IncomeExpenseChart from '@/components/dashboard/income-expense-chart';
import ParetoChart from '@/components/dashboard/pareto-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Transaction } from '@/lib/types';

export default function ChartsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    const fetchTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchTransactions();
  }, []);

  const months = useMemo(() => {
    const monthOptions = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      monthOptions.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: fr }),
      });
    }
    return monthOptions;
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const interval = { start: startDate, end: endDate };
    return transactions.filter(t => isWithinInterval(new Date(t.date), interval));
  }, [selectedMonth, transactions]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Graphiques</h1>
          <p className="text-muted-foreground">Visualisez vos données financières.</p>
        </div>
        <div className="w-[200px]">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <IncomeExpenseChart transactions={filteredTransactions} />
        <ParetoChart transactions={filteredTransactions} />
      </div>
    </div>
  );
}
