

'use client';

import React, { useState, useEffect, useMemo, useTransition, useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, AlertTriangle, Bell, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AllExpenseSubCategories } from '@/lib/types';
import type { Category, Transaction, ExpenseSubCategoryType, BudgetItem, CalendarEvent } from '@/lib/types';
import { getTransactions } from '@/lib/data';
import { fetchBudgetItems, handleSaveBudget, fetchCalendarEvents, handleAddCalendarEvent, handleDeleteCalendarEvent } from '@/app/actions';
import { format, startOfMonth, endOfMonth, isWithinInterval, getYear, isSameDay, isFuture, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from '@/contexts/currency-context';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import SubNavigation from '@/components/dashboard/sub-navigation';

const initialAddEventState = {
  message: '',
  errors: {},
  success: false,
};


export default function PlanningPage() {
  const { currency } = useCurrency();
  const [isPending, startTransition] = useTransition();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [addEventState, addEventFormAction] = useActionState(handleAddCalendarEvent, initialAddEventState);

  useEffect(() => {
    setSelectedDate(new Date());
    const fetchAndSetTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchAndSetTransactions();
    
    const fetchAndSetEvents = async () => {
        const calendarEvents = await fetchCalendarEvents();
        setEvents(calendarEvents || []);
    };
    fetchAndSetEvents();

  }, []);

  useEffect(() => {
    const fetchAndSetBudgetItems = async () => {
      startTransition(async () => {
        const items = await fetchBudgetItems(selectedYear, selectedMonth);
        setBudgetItems(items || []);
      });
    };
    fetchAndSetBudgetItems();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (addEventState.success && addEventState.message) {
        toast({ title: "Succès", description: addEventState.message });
        (document.getElementById('add-event-form') as HTMLFormElement)?.reset();
        startTransition(() => {
            fetchCalendarEvents().then(setEvents); // Re-fetch events
        });
    } else if (addEventState.message && !addEventState.success) {
        toast({ variant: "destructive", title: "Erreur", description: addEventState.message });
    }
  }, [addEventState]);

  const years = useMemo(() => {
    const currentYear = getYear(new Date());
    const yearOptions = [];
    for (let i = 0; i < 5; i++) {
        yearOptions.push(currentYear - i);
    }
    return yearOptions;
  }, []);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: format(new Date(2000, i), 'MM'),
      label: format(new Date(2000, i), 'MMMM', { locale: fr }),
    }));
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
    return budgetWithSpent.filter(item => item.planned > 0 && item.spent > item.planned);
  }, [budgetWithSpent]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => 
        isFuture(new Date(event.date)) && differenceInDays(new Date(event.date), today) <= 7
    ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);
  
  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => isSameDay(new Date(event.date), selectedDate));
  }, [events, selectedDate]);


  const handleAddItem = () => {
    setBudgetItems([...budgetItems, { id: crypto.randomUUID(), category: 'Autre', planned: 0 }]);
  }

  const handleRemoveItem = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id));
  }
  
  const handleCategoryChange = (id: string, newCategory: ExpenseSubCategoryType) => {
    const newItems = budgetItems.map(item => item.id === id ? { ...item, category: newCategory } : item);
    setBudgetItems(newItems);
  }

  const handlePlannedChange = (id: string, newPlanned: number) => {
    const newItems = budgetItems.map(item => item.id === id ? { ...item, planned: newPlanned } : item);
    setBudgetItems(newItems);
  };
  
  const onSaveBudget = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('year', String(selectedYear));
      formData.append('month', selectedMonth);
      // Remove the client-side 'id' before sending to the server action
      const itemsToSave = budgetItems.map(({ id, ...rest }) => rest);
      formData.append('items', JSON.stringify(itemsToSave));
      const result = await handleSaveBudget(null, formData);
      if (result.success) {
        toast({ title: 'Succès', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: result.message });
      }
    });
  };

  const handleRemoveEvent = (eventId: string) => {
     startTransition(async () => {
        const result = await handleDeleteCalendarEvent(eventId);
        if (result.success) {
            toast({ title: "Succès", description: result.message });
            fetchCalendarEvents().then(setEvents); // Re-fetch
        } else {
            toast({ variant: "destructive", title: "Erreur", description: result.message });
        }
    });
  };
  
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <SubNavigation />
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Planning</h1>
          <p className="text-muted-foreground">Planifiez vos projets, dépenses et budget.</p>
        </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Plan budgétaire</CardTitle>
                        <CardDescription>Définissez et suivez votre budget mensuel.</CardDescription>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-full">
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
                            <SelectTrigger className="w-full">
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
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[150px]">Sous-catégorie</TableHead>
                                <TableHead className="text-right min-w-[120px]">Prévu</TableHead>
                                <TableHead className="text-right min-w-[120px]">Dépensé</TableHead>
                                <TableHead className="text-right min-w-[120px]">Restant</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgetWithSpent.length > 0 ? budgetWithSpent.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Select
                                            value={item.category}
                                            onValueChange={(value) => handleCategoryChange(item.id, value as ExpenseSubCategoryType)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une sous-catégorie" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {AllExpenseSubCategories.map((cat, index) => (
                                                    <SelectItem key={`${cat}-${index}`} value={cat}>
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
                                            onChange={(e) => handlePlannedChange(item.id, Number(e.target.value))}
                                            className="text-right" 
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.spent, currency)}</TableCell>
                                    <TableCell className={`text-right ${item.planned - item.spent < 0 ? 'text-destructive' : ''}`}>{formatCurrency(item.planned - item.spent, currency)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                              <TableRow>
                                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                                      Aucun budget défini pour ce mois. Ajoutez des lignes pour commencer.
                                  </TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                    <Button onClick={handleAddItem} className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter une ligne
                    </Button>
                    <Button onClick={onSaveBudget} disabled={isPending || budgetItems.length === 0} className="w-full md:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        {isPending ? 'Enregistrement...' : 'Enregistrer le budget'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Calendrier</CardTitle>
            <CardDescription>Notez vos prévisions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border inline-block"
                        locale={fr}
                    />
                </div>
                <form action={addEventFormAction} id="add-event-form" className="mt-4 space-y-4">
                    <div>
                        <Label htmlFor="event-description">Nouvel événement</Label>
                        <div className='flex flex-col md:flex-row gap-2'>
                            <Input 
                                id="event-description"
                                name="description" 
                                placeholder="Ex: Facture SENELEC" 
                                required
                            />
                            <Input 
                                type="number" 
                                name="amount"
                                placeholder="Montant" 
                                className="md:w-[120px]"
                                required
                            />
                            <input type="hidden" name="date" value={selectedDate?.toISOString() || ''} />
                        </div>
                        {addEventState.errors?.description && <p className="text-sm text-destructive">{addEventState.errors.description[0]}</p>}
                        {addEventState.errors?.amount && <p className="text-sm text-destructive">{addEventState.errors.amount[0]}</p>}
                         {addEventState.errors?.date && <p className="text-sm text-destructive">{addEventState.errors.date[0]}</p>}
                        <Button type="submit" className='w-full mt-2' disabled={isPending || !selectedDate}>Ajouter l'événement</Button>
                    </div>
                </form>
                    
                {selectedDate && (
                    <div className="mt-4">
                        <h4 className="font-medium mb-2">
                            Événements pour le {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                        </h4>
                        {eventsForSelectedDate.length > 0 ? (
                            <ul className='space-y-2'>
                                {eventsForSelectedDate.map(event => (
                                    <li key={event.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                        <span>{event.description} - {formatCurrency(event.amount, currency)}</span>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEvent(event.id)} disabled={isPending}>
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
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
