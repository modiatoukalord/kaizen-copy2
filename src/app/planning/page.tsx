
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, AlertTriangle, Bell } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseSubCategory, AllExpenseSubCategories } from '@/lib/types';
import type { Category, Transaction, ExpenseSubCategoryType } from '@/lib/types';
import { getTransactions } from '@/lib/data';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, getYear, isSameDay, isFuture, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from '@/contexts/currency-context';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type BudgetItem = {
    category: ExpenseSubCategoryType;
    planned: number;
};

type CalendarEvent = {
  id: string;
  date: Date;
  description: string;
  amount: number;
};

export default function PlanningPage() {
  const { currency } = useCurrency();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { category: 'Nourriture', planned: 200000 },
    { category: 'Transport', planned: 50000 },
    { category: 'Divertissement', planned: 75000 },
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventAmount, setNewEventAmount] = useState<number | ''>('');


  useEffect(() => {
    const fetchTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchTransactions();
  }, []);

  const years = useMemo(() => {
    const currentYear = getYear(new Date());
    const yearOptions = [];
    for (let i = 0; i < 5; i++) {
        yearOptions.push(currentYear - i);
    }
    return yearOptions;
  }, []);

  const months = useMemo(() => {
    const monthOptions = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2000, i, 1); // Use a dummy year
      monthOptions.push({
        value: format(date, 'MM'),
        label: format(date, 'MMMM', { locale: fr }),
      });
    }
    return monthOptions;
  }, []);

  const monthlyTransactions = useMemo(() => {
    if (!selectedMonth || !selectedYear) return [];
    const startDate = startOfMonth(new Date(selectedYear, parseInt(selectedMonth, 10) - 1));
    const endDate = endOfMonth(new Date(selectedYear, parseInt(selectedMonth, 10) - 1));
    const interval = { start: startDate, end: endDate };
    return transactions.filter(t => t.type === 'expense' && isWithinInterval(new Date(t.date), interval));
  }, [selectedMonth, selectedYear, transactions]);

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

  const overBudgetItems = useMemo(() => {
    return budgetWithSpent.filter(item => item.planned - item.spent < 0);
  }, [budgetWithSpent]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => 
        isFuture(event.date) && differenceInDays(event.date, today) <= 7
    ).sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [events]);
  
  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => isSameDay(event.date, selectedDate));
  }, [events, selectedDate]);


  const handleAddItem = () => {
    setBudgetItems([...budgetItems, { category: 'Autre', planned: 0 }]);
  }

  const handleRemoveItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  }
  
  const handleCategoryChange = (index: number, newCategory: ExpenseSubCategoryType) => {
    const newItems = [...budgetItems];
    newItems[index].category = newCategory;
    setBudgetItems(newItems);
  }

  const handlePlannedChange = (index: number, newPlanned: number) => {
    const newItems = [...budgetItems];
    newItems[index].planned = newPlanned;
    setBudgetItems(newItems);
  };
  
  const handleAddEvent = () => {
    if (!selectedDate || !newEventDescription || newEventAmount === '') return;
    const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        date: selectedDate,
        description: newEventDescription,
        amount: Number(newEventAmount),
    };
    setEvents([...events, newEvent]);
    setNewEventDescription('');
    setNewEventAmount('');
  };

  const handleRemoveEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
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
                     <div className="flex gap-2">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px]">
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
                        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                             <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Sélectionner une année" />
                            </SelectTrigger>
                            <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={String(year)}>
                                {year}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {overBudgetItems.length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Attention, budget dépassé !</AlertTitle>
                        <AlertDescription>
                            Vous avez dépassé votre budget pour les catégories suivantes : {overBudgetItems.map(item => item.category).join(', ')}.
                        </AlertDescription>
                    </Alert>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sous-catégorie</TableHead>
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
                                        onValueChange={(value) => handleCategoryChange(index, value as ExpenseSubCategoryType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir une sous-catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AllExpenseSubCategories.map((cat) => (
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
                     {upcomingEvents.length > 0 && (
                        <Alert className="mb-4">
                            <Bell className="h-4 w-4" />
                            <AlertTitle>Événements à venir</AlertTitle>
                            <AlertDescription>
                                <ul className="text-sm">
                                    {upcomingEvents.map(event => (
                                        <li key={event.id}>
                                            {format(event.date, 'dd/MM')}: {event.description} ({formatCurrency(event.amount, currency)})
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        locale={fr}
                    />
                    <div className="mt-4 space-y-4">
                        <div>
                            <Label htmlFor="event-description">Nouvel événement</Label>
                            <div className='flex gap-2'>
                                <Input 
                                    id="event-description" 
                                    placeholder="Ex: Facture SENELEC" 
                                    value={newEventDescription}
                                    onChange={(e) => setNewEventDescription(e.target.value)}
                                />
                                <Input 
                                    type="number" 
                                    placeholder="Montant" 
                                    value={newEventAmount}
                                    onChange={(e) => setNewEventAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-[120px]"
                                />
                            </div>
                            <Button onClick={handleAddEvent} className='w-full mt-2'>Ajouter l'événement</Button>
                        </div>
                        
                        {selectedDate && (
                            <div>
                                <h4 className="font-medium mb-2">
                                    Événements pour le {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                                </h4>
                                {eventsForSelectedDate.length > 0 ? (
                                    <ul className='space-y-2'>
                                        {eventsForSelectedDate.map(event => (
                                            <li key={event.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                                <span>{event.description} - {formatCurrency(event.amount, currency)}</span>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveEvent(event.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucun événement pour cette date.</p>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
