
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

export default function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const { currency } = useCurrency();

  const chartData = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return [{ name: 'Finances', income, expenses }];
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus vs Dépenses</CardTitle>
        <CardDescription>Une comparaison de vos revenus et dépenses totaux.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickFormatter={(value) => formatCurrency(value as number, currency, true, true)} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent formatter={(value, name) => `${name}: ${formatCurrency(value as number, currency)}`} />}
            />
            <Legend />
            <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Revenus" radius={4} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-1))" name="Dépenses" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
