

'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, AlertTriangle, Bell, Save, CalendarClock, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AllExpenseSubCategories } from '@/lib/types';
import type { Category, Transaction, ExpenseSubCategoryType, BudgetItem, CalendarEvent } from '@/lib/types';
import { getTransactions } from '@/lib/data';
import { fetchBudgetItems, handleSaveBudget, fetchCalendarEvents, handleDeleteCalendarEvent } from '@/app/actions';
import { format, startOfMonth, endOfMonth, isWithinInterval, getYear, isSameDay, isFuture, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from '@/contexts/currency-context';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import SubNavigation from '@/components/dashboard/sub-navigation';
import { AddOrUpdateEventSheet } from '@/components/dashboard/add-update-event-sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"


export default function PlanningPage() {
  const { currency } = useCurrency();
  const [isPending, startTransition] = useTransition();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const refetchEvents = () => {
    startTransition(async () => {
      const calendarEvents = await fetchCalendarEvents();
      setEvents(calendarEvents || []);
    });
  };

  useEffect(() => {
    setSelectedDate(new Date());
    const fetchAndSetTransactions = async () => {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    };
    fetchAndSetTransactions();
    refetchEvents();
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
    return transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), interval));
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
            refetchEvents();
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
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <CardTitle>Calendrier</CardTitle>
                        <CardDescription>Notez vos prévisions.</CardDescription>
                    </div>
                    <AddOrUpdateEventSheet onEventUpdate={refetchEvents} selectedDate={selectedDate}>
                        <Button disabled={!selectedDate}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un événement
                        </Button>
                    </AddOrUpdateEventSheet>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="overflow-x-auto flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border inline-block"
                        locale={fr}
                    />
                </div>
                    
                <div>
                    <div className="mb-6 rounded-lg border bg-card p-4">
                        <h4 className="mb-3 flex items-center text-lg font-semibold">
                            <CalendarClock className="mr-2 h-5 w-5" />
                            Événements à venir (7 prochains jours)
                        </h4>
                        {upcomingEvents.length > 0 ? (
                            <ul className="space-y-2">
                                {upcomingEvents.map(event => (
                                    <li key={event.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-sm">
                                        <div>
                                            <span className="font-medium">{event.description}</span>
                                            <span className="text-muted-foreground"> - {format(new Date(event.date), 'EEE d MMM', { locale: fr })}</span>
                                        </div>
                                        <span className="font-semibold">{formatCurrency(event.amount, currency)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-muted-foreground">Aucun événement à venir.</p>
                        )}
                    </div>
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
                                        
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <AddOrUpdateEventSheet event={event} onEventUpdate={refetchEvents} selectedDate={selectedDate}>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </DropdownMenuItem>
                                                    </AddOrUpdateEventSheet>
                                                     <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                     </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action est irréversible. L'événement sera définitivement supprimé.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRemoveEvent(event.id)} disabled={isPending}>
                                                        Continuer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
  );
}
