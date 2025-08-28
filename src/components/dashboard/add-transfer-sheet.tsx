
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
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
import { TransactionAccount, type Account, type Transfer } from '@/lib/types';
import { handleAddOrUpdateTransfer } from '@/app/actions';

const transferFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(2, {
    message: 'La description doit comporter au moins 2 caractères.',
  }),
  amount: z.coerce.number().positive({
    message: 'Veuillez entrer un montant positif.',
  }),
  fromAccount: z.enum(TransactionAccount),
  toAccount: z.enum(TransactionAccount),
  date: z.date(),
}).refine(data => data.fromAccount !== data.toAccount, {
    message: "Les comptes de départ et d'arrivée doivent être différents.",
    path: ["toAccount"],
});


type TransferFormValues = z.infer<typeof transferFormSchema>;

const initialState = {
  message: '',
  errors: {},
  success: false,
};

interface AddTransferSheetProps {
    children: React.ReactNode;
    transfer?: Transfer;
    onSheetToggle?: () => void;
}

export function AddTransferSheet({ children, transfer, onSheetToggle }: AddTransferSheetProps) {
  const [open, setOpen] = React.useState(false);
  const isEditing = !!transfer;
  
  const [state, formAction, isPending] = useActionState(handleAddOrUpdateTransfer, initialState);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
        id: transfer?.id || undefined,
        description: transfer?.description || '',
        amount: transfer?.amount || 0,
        fromAccount: transfer?.fromAccount || 'Banque',
        toAccount: transfer?.toAccount || 'Espèces',
        date: transfer?.date ? new Date(transfer.date) : new Date(),
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onSheetToggle) {
        onSheetToggle();
    }
  }
  
  React.useEffect(() => {
    if (transfer) {
      form.reset({
        id: transfer.id,
        description: transfer.description,
        amount: transfer.amount,
        fromAccount: transfer.fromAccount,
        toAccount: transfer.toAccount,
        date: new Date(transfer.date),
      });
    } else {
        form.reset({
            description: '',
            amount: 0,
            fromAccount: 'Banque',
            toAccount: 'Espèces',
            date: new Date(),
        });
    }
  }, [transfer, form, open]);


  React.useEffect(() => {
    if (state.success) {
      toast({
        title: 'Succès!',
        description: state.message,
      });
      handleOpenChange(false);
      form.reset();
    } else if (state.message && Object.keys(state.errors || {}).length > 0) {
      toast({
        variant: 'destructive',
        title: 'Oh oh! Quelque chose s\'est mal passé.',
        description: state.message,
      });
    }
  }, [state, form]);
  
  const fromAccountValue = form.watch('fromAccount');
  const availableToAccounts = React.useMemo(() => 
    TransactionAccount.filter(acc => acc !== fromAccountValue),
    [fromAccountValue]
  );

  React.useEffect(() => {
    if (fromAccountValue === form.watch('toAccount')) {
      form.setValue('toAccount', availableToAccounts[0]);
    }
  }, [fromAccountValue, availableToAccounts, form]);


  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Modifier le virement' : 'Ajouter un nouveau virement'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Mettez à jour les détails de votre virement.' : 'Remplissez les détails du virement entre comptes.'}
          </SheetDescription>
        </SheetHeader>
        <form
          action={formAction}
          className="space-y-4 py-4"
        >
          <input type="hidden" {...form.register('id')} />
          <input type="hidden" {...form.register('date')} value={form.watch('date').toISOString()} />
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register('description')} />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input id="amount" type="number" step="0.01" {...form.register('amount')} />
            {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount[0]}</p>}
          </div>
          
          <div className="space-y-2">
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>De</Label>
              <Select {...form.register('fromAccount')} onValueChange={(value) => form.setValue('fromAccount', value as Account)} value={form.watch('fromAccount')}>
                <SelectTrigger>
                  <SelectValue placeholder="Compte source" />
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
             <div className="space-y-2">
              <Label>À</Label>
              <Select {...form.register('toAccount')} onValueChange={(value) => form.setValue('toAccount', value as Account)} value={form.watch('toAccount')}>
                <SelectTrigger>
                  <SelectValue placeholder="Compte destination" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAccounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {state.errors?.toAccount && <p className="text-sm text-destructive col-span-2">{state.errors.toAccount[0]}</p>}


          <SheetFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Enregistrer les modifications' : 'Enregistrer le virement'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
