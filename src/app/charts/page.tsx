
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTransactions } from '@/lib/data';
import IncomeExpenseChart from '@/components/dashboard/income-expense-chart';
import ParetoChart from '@/components/dashboard/pareto-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Transaction, Scope } from '@/lib/types';

export default function ChartsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const scope: Scope = (searchParams.get('scope') as Scope) || 'Personnel';

  useEffect(() => {
    const fetchTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchTransactions();
  }, []);

  const handleTabChange = (value: string) => {
    router.push(`/charts?scope=${value}`);
  };

  const years = useMemo(() => {
    if (transactions.length === 0) return [getYear(new Date())];
    const uniqueYears = [...new Set(transactions.map(t => getYear(new Date(t.date))))];
    return uniqueYears.sort((a, b) => b - a);
  }, [transactions]);
  
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
        value: format(new Date(2000, i), 'MM'),
        label: format(new Date(2000, i), 'MMMM', { locale: fr }),
    }));
  }, []);


  const filteredTransactions = useMemo(() => {
    const year = selectedYear;
    const month = parseInt(selectedMonth, 10);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const interval = { start: startDate, end: endDate };
    
    let scopeTransactions = transactions.filter(t => t.scope === scope);
    
    return scopeTransactions.filter(t => isWithinInterval(new Date(t.date), interval));
  }, [selectedYear, selectedMonth, transactions, scope]);

  const title = scope === 'Personnel' ? 'Graphiques Personnels' : "Graphiques d'Entreprise";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
          <Tabs value={scope} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="Personnel">Personnel</TabsTrigger>
                  <TabsTrigger value="Entreprise">Entreprise</TabsTrigger>
              </TabsList>
          </Tabs>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
              <p className="text-muted-foreground">Visualisez vos données financières.</p>
            </div>
            <div className="flex gap-2">
                <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year} value={String(year)}>
                        {year}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Mois" />
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <IncomeExpenseChart transactions={filteredTransactions} />
        <ParetoChart transactions={filteredTransactions} />
      </div>
    </div>
  );
}
