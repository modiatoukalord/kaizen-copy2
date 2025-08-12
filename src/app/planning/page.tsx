
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseCategory, TransactionCategory } from '@/lib/types';
import type { Category, Transaction } from '@/lib/types';
import { getTransactions } from '@/lib/data';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from '@/contexts/currency-context';
import { formatCurrency } from '@/lib/utils';


type BudgetItem = {
    category: Category;
    planned: number;
};

export default function PlanningPage() {
  const { currency } = useCurrency();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { category: 'Nourriture', planned: 200000 },
    { category: 'Transport', planned: 50000 },
    { category: 'Divertissement', planned: 75000 },
  ]);
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

  const monthlyTransactions = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const interval = { start: startDate, end: endDate };
    return transactions.filter(t => t.type === 'expense' && isWithinInterval(new Date(t.date), interval));
  }, [selectedMonth, transactions]);

  const budgetWithSpent = useMemo(() => {
    const spentByCategory = monthlyTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<Category, number>);

    return budgetItems.map(item => ({
        ...item,
        spent: spentByCategory[item.category] || 0,
    }));
  }, [budgetItems, monthlyTransactions]);

  const handleAddItem = () => {
    setBudgetItems([...budgetItems, { category: 'Autre', planned: 0 }]);
  }

  const handleRemoveItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  }
  
  const handleCategoryChange = (index: number, newCategory: Category) => {
    const newItems = [...budgetItems];
    newItems[index].category = newCategory;
    setBudgetItems(newItems);
  }

  const handlePlannedChange = (index: number, newPlanned: number) => {
    const newItems = [...budgetItems];
    newItems[index].planned = newPlanned;
    setBudgetItems(newItems);
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Planning</h1>
        <p className="text-muted-foreground">Planifiez vos projets, dépenses et budget.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Plan budgétaire</CardTitle>
                        <CardDescription>Définissez et suivez votre budget mensuel.</CardDescription>
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
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Catégorie</TableHead>
                            <TableHead className="text-right">Prévu</TableHead>
                            <TableHead className="text-right">Dépensé</TableHead>
                            <TableHead className="text-right">Restant</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {budgetWithSpent.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="w-[200px]">
                                    <Select
                                        value={item.category}
                                        onValueChange={(value) => handleCategoryChange(index, value as Category)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir une catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ExpenseCategory.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Input 
                                        type="number" 
                                        value={item.planned}
                                        onChange={(e) => handlePlannedChange(index, Number(e.target.value))}
                                        className="text-right" 
                                    />
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(item.spent, currency)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.planned - item.spent, currency)}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button onClick={handleAddItem} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une ligne
                </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                <CardTitle>Calendrier</CardTitle>
                <CardDescription>Notez vos prévisions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="event">Événement pour la date sélectionnée</Label>
                        <Input id="event" placeholder="Ex: Paiement facture SENELEC" />
                        <Button className='w-full'>Ajouter l'événement</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
