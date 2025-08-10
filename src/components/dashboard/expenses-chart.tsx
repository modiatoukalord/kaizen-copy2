'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

interface ExpensesChartProps {
  transactions: Transaction[];
}

export default function ExpensesChart({ transactions }: ExpensesChartProps) {
  const { currency } = useCurrency();
  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  if (chartData.length === 0) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>A breakdown of your spending by category.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">No expense data for this period.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="h-full">
        <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>A breakdown of your spending by category.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
            <BarChart data={chartData} accessibilityLayer>
                <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => formatCurrency(value as number, currency).replace(/\.00$/, '')} />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number, currency)} />}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
            </ChartContainer>
      </CardContent>
    </Card>
  );
}
