
'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, eachMonthOfInterval, startOfDay, parseISO, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction, Period } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

interface SummaryChartProps {
  transactions: Transaction[];
  period: Period;
}

export default function SummaryChart({ transactions, period }: SummaryChartProps) {
  const { currency } = useCurrency();

  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    const sortedTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startDate = new Date(sortedTransactions[0].date);
    const endDate = new Date(sortedTransactions[sortedTransactions.length - 1].date);
    
    let interval;
    let dateFormat;

    switch (period) {
        case 'annually':
            interval = eachMonthOfInterval({ start: startDate, end: endDate });
            dateFormat = (date: Date) => format(date, 'MMM', { locale: fr });
            break;
        case 'quarterly':
            interval = eachMonthOfInterval({ start: startDate, end: endDate });
            dateFormat = (date: Date) => format(date, 'MMM', { locale: fr });
            break;
        case 'monthly':
        default:
            interval = eachDayOfInterval({ start: startDate, end: endDate });
            dateFormat = (date: Date) => format(date, 'd MMM', { locale: fr });
            break;
    }
    
    const dataByDate = interval.map(date => {
        const key = period === 'annually' || period === 'quarterly' 
            ? format(date, 'yyyy-MM') 
            : format(date, 'yyyy-MM-dd');
        
        return {
            date: dateFormat(date),
            income: 0,
            expense: 0,
            net: 0,
            fullDate: key,
        };
    });

    const dataMap = new Map(dataByDate.map(d => [d.fullDate, d]));

    sortedTransactions.forEach(t => {
      const dateKey = period === 'annually' || period === 'quarterly'
        ? format(new Date(t.date), 'yyyy-MM')
        : format(new Date(t.date), 'yyyy-MM-dd');
        
      const entry = dataMap.get(dateKey);
      if (entry) {
        if (t.type === 'income') {
          entry.income += t.amount;
        } else {
          entry.expense += t.amount;
        }
      }
    });

    let cumulativeNet = 0;
    return Array.from(dataMap.values()).map(entry => {
        cumulativeNet += entry.income - entry.expense;
        entry.net = cumulativeNet;
        return entry;
    });

  }, [transactions, period]);


  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Synthèse financière</CardTitle>
          <CardDescription>Évolution de vos revenus, dépenses et solde net.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">Aucune transaction pour la période sélectionnée.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synthèse financière</CardTitle>
        <CardDescription>Évolution de vos revenus, dépenses et solde net sur la période.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value as number, currency, true)} />
              <Tooltip
                content={<ChartTooltipContent
                    formatter={(value, name) => {
                        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                        return `${capitalizedName}: ${formatCurrency(value as number, currency)}`;
                    }}
                />}
              />
              <Legend />
              <Line type="monotone" dataKey="income" name="Revenus" stroke="hsl(var(--chart-2))" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="expense" name="Dépenses" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="net" name="Solde net" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
