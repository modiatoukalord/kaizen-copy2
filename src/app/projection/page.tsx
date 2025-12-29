

'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Save, Loader2, List, FilePlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import SubNavigation from '@/components/dashboard/sub-navigation';
import { useCurrency } from '@/contexts/currency-context';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProjections, handleSaveProjection, handleDeleteProjection } from '@/app/actions';
import type { Projection, ProjectionItem } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';

const initialState: Omit<Projection, 'id' | 'createdAt'> = {
  name: `Projection du ${formatDate(new Date(), 'dd/MM/yyyy')}`,
  initialBalance: 0,
  projectionMonths: 12,
  incomes: [],
  expenses: [],
};

export default function ProjectionPage() {
  const { currency } = useCurrency();
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const [projection, setProjection] = useState(initialState);
  const [savedProjections, setSavedProjections] = useState<Projection[]>([]);
  
  useEffect(() => {
    const fetchProjections = async () => {
        const projections = await getProjections();
        setSavedProjections(projections);
    };
    fetchProjections();
  }, []);

  const resetProjection = () => {
    setProjection(initialState);
  }

  const handleAddItem = (type: 'incomes' | 'expenses') => {
    const newItem: ProjectionItem = { id: crypto.randomUUID(), description: '', amount: 0, type: 'once' };
    setProjection(prev => ({
        ...prev,
        [type]: [...prev[type], newItem]
    }));
  };

  const handleRemoveItem = (id: string, type: 'incomes' | 'expenses') => {
    setProjection(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  const handleItemChange = (id: string, field: keyof Omit<ProjectionItem, 'id'>, value: string | number, type: 'incomes' | 'expenses') => {
    setProjection(prev => ({
        ...prev,
        [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };
  
  const projectionData = useMemo(() => {
    const data = [];
    let currentBalance = projection.initialBalance;

    for (let i = 0; i <= projection.projectionMonths; i++) {
      let monthIncome = 0;
      let monthExpense = 0;

      if (i > 0) {
        projection.incomes.filter(item => item.type === 'recurring').forEach(item => monthIncome += item.amount);
        projection.expenses.filter(item => item.type === 'recurring').forEach(item => monthExpense += item.amount);
        
        if (i === 1) {
            projection.incomes.filter(item => item.type === 'once').forEach(item => monthIncome += item.amount);
            projection.expenses.filter(item => item.type === 'once').forEach(item => monthExpense += item.amount);
        }
        currentBalance += monthIncome - monthExpense;
      }
      
      data.push({
        month: `Mois ${i}`,
        balance: currentBalance,
      });
    }
    return data;
  }, [projection.initialBalance, projection.projectionMonths, projection.incomes, projection.expenses]);

  const finalBalance = projectionData[projectionData.length - 1]?.balance || 0;

  const onSave = () => {
    startSaveTransition(async () => {
        const formData = new FormData();
        formData.append('name', projection.name);
        formData.append('initialBalance', String(projection.initialBalance));
        formData.append('projectionMonths', String(projection.projectionMonths));
        formData.append('incomes', JSON.stringify(projection.incomes));
        formData.append('expenses', JSON.stringify(projection.expenses));

        const result = await handleSaveProjection(null, formData);

        if (result.success) {
            toast({ title: "Succès", description: result.message });
            const projections = await getProjections();
            setSavedProjections(projections);
        } else {
            toast({ variant: "destructive", title: "Erreur", description: result.message });
        }
    });
  };

  const onDelete = (id: string) => {
    startDeleteTransition(async () => {
        const result = await handleDeleteProjection(id);
        if (result.success) {
            toast({ title: "Succès", description: result.message });
            const projections = await getProjections();
            setSavedProjections(projections);
        } else {
            toast({ variant: "destructive", title: "Erreur", description: result.message });
        }
    });
  };
  
  const loadProjection = (p: Projection) => {
    setProjection({
      name: p.name,
      initialBalance: p.initialBalance,
      projectionMonths: p.projectionMonths,
      incomes: p.incomes,
      expenses: p.expenses,
    });
  }
  
  const renderTable = (title: string, items: ProjectionItem[], type: 'incomes' | 'expenses') => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Récurrence</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={e => handleItemChange(item.id, 'description', e.target.value, type)}
                    placeholder="Ex: Salaire, Loyer..."
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.amount}
                    onChange={e => handleItemChange(item.id, 'amount', parseFloat(e.target.value) || 0, type)}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={item.type}
                    onValueChange={value => handleItemChange(item.id, 'type', value, type)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Unique</SelectItem>
                      <SelectItem value="recurring">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id, type)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button onClick={() => handleAddItem(type)} className="mt-4 w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <SubNavigation />
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Projection Financière</h1>
          <p className="text-muted-foreground">Simulez l'évolution de votre solde sur plusieurs mois.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Configuration de la Projection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="projection-name">Nom de la projection</Label>
                    <Input
                      id="projection-name"
                      value={projection.name}
                      onChange={e => setProjection(p => ({...p, name: e.target.value}))}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="initial-balance">Solde de départ ({currency})</Label>
                    <Input
                      id="initial-balance"
                      type="number"
                      value={projection.initialBalance}
                      onChange={e => setProjection(p => ({...p, initialBalance: parseFloat(e.target.value) || 0}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projection-months">Horizon (en mois): {projection.projectionMonths}</Label>
                    <Slider
                      id="projection-months"
                      min={1}
                      max={60}
                      step={1}
                      value={[projection.projectionMonths]}
                      onValueChange={([value]) => setProjection(p => ({...p, projectionMonths: value}))}
                    />
                  </div>
                </div>
                 <Button onClick={onSave} disabled={isSaving || !projection.name}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder la projection
                </Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Projections sauvegardées
                        <Button variant="outline" size="sm" onClick={resetProjection}>
                            <FilePlus className="mr-2 h-4 w-4"/>
                            Nouvelle
                        </Button>
                    </CardTitle>
                    <CardDescription>Chargez une simulation existante.</CardDescription>
                </CardHeader>
                <CardContent>
                    {savedProjections.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {savedProjections.map(p => (
                                <li key={p.id} className="flex items-center justify-between p-2 rounded-md border">
                                    <button onClick={() => loadProjection(p)} className="flex-1 text-left hover:underline">
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">Créée le {formatDate(new Date(p.createdAt), 'dd/MM/yy')}</p>
                                    </button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(p.id)} disabled={isDeleting}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune projection sauvegardée.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Résultats de la Projection</CardTitle>
                <CardDescription>
                    Solde final après {projection.projectionMonths} mois : 
                    <span className="font-bold text-lg text-primary ml-2">{formatCurrency(finalBalance, currency)}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => formatCurrency(value, currency, true)} />
                        <Tooltip content={({ active, payload, label }) => {
                             if (active && payload && payload.length) {
                                return (
                                <div className="p-2 border rounded-lg bg-background shadow-lg">
                                    <p className="label font-bold">{label}</p>
                                    <p style={{ color: 'hsl(var(--primary))' }}>
                                        {`Solde: ${formatCurrency(payload[0].value as number, currency)}`}
                                    </p>
                                </div>
                                );
                            }
                            return null;
                        }} />
                        <Legend />
                        <Line type="monotone" dataKey="balance" name="Solde Projeté" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderTable('Revenus Projetés', projection.incomes, 'incomes')}
          {renderTable('Dépenses Projetées', projection.expenses, 'expenses')}
        </div>
      </div>
    </div>
  );
}
