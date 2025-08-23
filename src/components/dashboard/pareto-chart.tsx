
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

interface ParetoChartProps {
  transactions: Transaction[];
}

export default function ParetoChart({ transactions }: ParetoChartProps) {
  const { currency } = useCurrency();

  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
    
    const top5Categories = sortedCategories.slice(0, 5);

    const totalExpenses = top5Categories.reduce((sum, item) => sum + item.total, 0);
    
    if (totalExpenses === 0) return [];

    let cumulative = 0;
    return top5Categories.map(item => {
      cumulative += item.total;
      return {
        ...item,
        cumulativePercent: (cumulative / totalExpenses) * 100,
      };
    });
  }, [transactions]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Diagramme de Pareto des Dépenses</CardTitle>
                <CardDescription>Analyse des catégories de dépenses les plus importantes.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">Aucune donnée de dépense à analyser.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagramme de Pareto des Dépenses</CardTitle>
        <CardDescription>Analyse des 5 catégories de dépenses les plus importantes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <ComposedChart data={chartData} accessibilityLayer margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" tickFormatter={(value) => formatCurrency(value as number, currency, true, true)} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" tickFormatter={(value) => `${value.toFixed(0)}%`} />
            <Tooltip
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                        return (
                            <div className="p-2 border rounded-lg bg-background shadow-lg">
                                <p className="label font-bold">{label}</p>
                                <p style={{ color: 'hsl(var(--primary))' }}>
                                    {`Dépense: ${formatCurrency(payload[0].value as number, currency)}`}
                                </p>
                                <p style={{ color: 'hsl(var(--accent))' }}>
                                    {`Pourcentage cumulé: ${(payload[1].value as number).toFixed(2)}%`}
                                </p>
                            </div>
                        );
                    }
                    return null;
                }}
            />
            <Legend />
            <Bar dataKey="total" yAxisId="left" name="Dépenses" fill="hsl(var(--primary))" radius={4} />
            <Line type="monotone" yAxisId="right" dataKey="cumulativePercent" name="% cumulé" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
