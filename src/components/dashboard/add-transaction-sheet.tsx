
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { TransactionCategory, TransactionAccount, type Category, type Account, IncomeCategory, ExpenseCategory, type Transaction } from '@/lib/types';
import { handleAddOrUpdateTransaction, suggestCategory } from '@/app/actions';

const transactionFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(2, {
    message: 'La description doit comporter au moins 2 caractères.',
  }),
  amount: z.coerce.number().positive({
    message: 'Veuillez entrer un montant positif.',
  }),
  type: z.enum(['income', 'expense']),
  category: z.enum(TransactionCategory),
  account: z.enum(TransactionAccount),
  date: z.date(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

const initialState = {
  message: '',
  errors: {},
  success: false,
};

export function AddTransactionSheet({ children, type: initialType, transaction }: { children: React.ReactNode, type?: 'income' | 'expense', transaction?: Transaction }) {
  const [open, setOpen] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const isEditing = !!transaction;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
        id: transaction?.id || undefined,
        description: transaction?.description || '',
        amount: transaction?.amount || 0,
        type: transaction?.type || initialType || 'expense',
        category: transaction?.category || 'Other',
        account: transaction?.account || 'Banque',
        date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  });
  
  React.useEffect(() => {
    if (transaction) {
      form.reset({
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        account: transaction.account,
        date: new Date(transaction.date),
      });
    } else {
        form.reset({
            description: '',
            amount: 0,
            type: initialType || 'expense',
            category: 'Other',
            account: 'Banque',
            date: new Date(),
        });
    }
  }, [transaction, form, initialType, open]);


  const transactionType = form.watch('type');

  const availableCategories = React.useMemo(() => {
    return transactionType === 'income' ? IncomeCategory : ExpenseCategory;
  }, [transactionType]);

  React.useEffect(() => {
    if (initialType && !isEditing) {
        form.setValue('type', initialType);
    }
  }, [initialType, form, isEditing]);

  React.useEffect(() => {
    // Reset category if it's not in the available categories for the selected type
    if (!availableCategories.includes(form.getValues('category') as any)) {
      form.setValue('category', availableCategories[0] as Category);
    }
  }, [transactionType, availableCategories, form]);

  const [state, formAction] = useActionState(handleAddOrUpdateTransaction, initialState);

  React.useEffect(() => {
    if (state.success) {
      toast({
        title: 'Succès!',
        description: state.message,
      });
      setOpen(false);
      form.reset();
    } else if (state.message && Object.keys(state.errors || {}).length > 0) {
      toast({
        variant: 'destructive',
        title: 'Oh oh! Quelque chose s\'est mal passé.',
        description: state.message,
      });
    }
  }, [state, form]);

  const handleSuggestion = async () => {
    const description = form.getValues('description');
    const amount = form.getValues('amount');
    if (!description || !amount) {
        toast({
            variant: 'destructive',
            title: 'Échec de la suggestion',
            description: "Veuillez entrer une description et un montant pour obtenir une suggestion.",
        })
        return;
    }
    
    setIsSuggesting(true);
    try {
        const result = await suggestCategory(description, amount);
        if (result?.category && availableCategories.includes(result.category as any)) {
            form.setValue('category', result.category);
        } else if (result?.category) {
            toast({
                variant: 'default',
                title: 'Suggestion ajustée',
                description: `L'IA a suggéré "${result.category}" qui n'est pas une catégorie de ${transactionType} valide. Veuillez en sélectionner une dans la liste.`,
            })
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Échec de la suggestion',
            description: 'Impossible d\'obtenir une suggestion de l\'IA pour le moment.',
        })
    } finally {
        setIsSuggesting(false);
    }
  };


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Modifier la transaction' : 'Ajouter une nouvelle transaction'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Mettez à jour les détails de votre transaction.' : 'Remplissez les détails de vos revenus ou dépenses.'}
          </SheetDescription>
        </SheetHeader>
        <form
          ref={formRef}
          action={formAction}
          className="space-y-4 py-4"
          onSubmit={(evt) => {
            evt.preventDefault();
            form.handleSubmit(() => {
                const formData = new FormData(formRef.current!);
                const values = form.getValues();
                if (values.id) {
                    formData.set('id', values.id);
                }
                formData.set('date', values.date.toISOString());
                formAction(formData);
            })(evt);
          }}
        >
          {isEditing && <input type="hidden" name="id" value={transaction.id} />}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" {...form.register('description')} />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input id="amount" name="amount" type="number" step="0.01" {...form.register('amount')} />
            {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!initialType && !isEditing && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select name="type" onValueChange={(value) => form.setValue('type', value as 'income' | 'expense')} defaultValue={form.getValues('type')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Dépense</SelectItem>
                    <SelectItem value="income">Revenu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
             {isEditing && <input type="hidden" name="type" value={form.getValues('type')} />}
             {!isEditing && initialType && <input type="hidden" name="type" value={initialType} />}
            <div className={cn("space-y-2", (!initialType && !isEditing) ? "" : "col-span-2")}>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !form.watch('date') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('date') ? format(form.watch('date'), 'PPP') : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch('date')}
                    onSelect={(date) => date && form.setValue('date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Catégorie</Label>
                <Button variant="ghost" type="button" size="sm" onClick={handleSuggestion} disabled={isSuggesting}>
                    {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Suggérer
                </Button>
            </div>
            <Select name="category" onValueChange={(value) => form.setValue('category', value as Category)} value={form.watch('category')}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Compte</Label>
            <Select name="account" onValueChange={(value) => form.setValue('account', value as Account)} value={form.watch('account')}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un compte" />
              </SelectTrigger>
              <SelectContent>
                {TransactionAccount.map((acc) => (
                  <SelectItem key={acc} value={acc}>
                    {acc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SheetFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Enregistrer les modifications' : 'Enregistrer la transaction'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
