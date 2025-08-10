
'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
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
import { TransactionCategory, TransactionAccount, type Category, type Account, IncomeCategory, ExpenseCategory } from '@/lib/types';
import { handleAddTransaction, suggestCategory } from '@/app/actions';

const transactionFormSchema = z.object({
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  amount: z.coerce.number().positive({
    message: 'Please enter a positive amount.',
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

export function AddTransactionSheet({ children, type: initialType }: { children: React.ReactNode, type?: 'income' | 'expense' }) {
  const [open, setOpen] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: initialType || 'expense',
      category: 'Other',
      account: 'Banque',
      date: new Date(),
    },
  });

  const transactionType = form.watch('type');

  const availableCategories = React.useMemo(() => {
    return transactionType === 'income' ? IncomeCategory : ExpenseCategory;
  }, [transactionType]);

  React.useEffect(() => {
    if (initialType) {
        form.setValue('type', initialType);
    }
  }, [initialType, form]);

  React.useEffect(() => {
    // Reset category if it's not in the available categories for the selected type
    if (!availableCategories.includes(form.getValues('category') as any)) {
      form.setValue('category', availableCategories[0] as Category);
    }
  }, [transactionType, availableCategories, form]);

  const [state, formAction] = useFormState(handleAddTransaction, initialState);

  React.useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      setOpen(false);
      form.reset();
    } else if (state.message && Object.keys(state.errors).length > 0) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
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
            title: 'Suggestion Failed',
            description: "Please enter a description and amount to get a suggestion.",
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
                title: 'Suggestion Adjusted',
                description: `AI suggested "${result.category}" which is not a valid ${transactionType} category. Please select one from the list.`,
            })
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Suggestion Failed',
            description: 'Could not get an AI suggestion at this time.',
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
          <SheetTitle>Add a New Transaction</SheetTitle>
          <SheetDescription>
            Fill in the details of your income or expense.
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
                formData.set('date', values.date.toISOString());
                formAction(formData);
            })(evt);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" {...form.register('description')} />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" {...form.register('amount')} />
            {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!initialType && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select name="type" onValueChange={(value) => form.setValue('type', value as 'income' | 'expense')} defaultValue={form.getValues('type')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className={cn("space-y-2", !initialType ? "" : "col-span-2")}>
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
                    {form.watch('date') ? format(form.watch('date'), 'PPP') : <span>Pick a date</span>}
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
                <Label>Category</Label>
                <Button variant="ghost" type="button" size="sm" onClick={handleSuggestion} disabled={isSuggesting}>
                    {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Suggest
                </Button>
            </div>
            <Select name="category" onValueChange={(value) => form.setValue('category', value as Category)} value={form.watch('category')}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
                <SelectValue placeholder="Select account" />
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
              Save Transaction
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
