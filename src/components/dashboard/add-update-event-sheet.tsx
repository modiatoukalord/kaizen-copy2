
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import type { CalendarEvent } from '@/lib/types';
import { handleAddOrUpdateCalendarEvent } from '@/app/actions';


const calendarEventSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  amount: z.coerce.number().min(0.01, 'Le montant est requis'),
  date: z.string().min(1, 'La date est requise'),
});

type CalendarEventFormValues = z.infer<typeof calendarEventSchema>;

const initialState = {
  message: '',
  errors: {},
  success: false,
};

interface AddOrUpdateEventSheetProps {
    children: React.ReactNode;
    event?: CalendarEvent;
    selectedDate?: Date;
    onEventUpdate: () => void;
}

export function AddOrUpdateEventSheet({ children, event, selectedDate, onEventUpdate }: AddOrUpdateEventSheetProps) {
  const [open, setOpen] = React.useState(false);
  const isEditing = !!event;

  const [state, formAction, isPending] = useActionState(handleAddOrUpdateCalendarEvent, initialState);

  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
        id: event?.id,
        description: event?.description || '',
        amount: event?.amount || 0,
        date: event?.date ? new Date(event.date).toISOString() : selectedDate?.toISOString() || new Date().toISOString(),
    },
  });

  React.useEffect(() => {
    form.reset({
        id: event?.id,
        description: event?.description || '',
        amount: event?.amount || 0,
        date: event?.date ? new Date(event.date).toISOString() : selectedDate?.toISOString() || new Date().toISOString(),
    });
  }, [event, selectedDate, form, open]);
  
  React.useEffect(() => {
    if (state.success) {
      toast({
        title: 'Succès!',
        description: state.message,
      });
      setOpen(false);
      onEventUpdate();
    } else if (state.message && Object.keys(state.errors || {}).length > 0) {
      toast({
        variant: 'destructive',
        title: 'Oh oh! Quelque chose s\'est mal passé.',
        description: state.message,
      });
    }
  }, [state, onEventUpdate]);

  const dateValue = form.watch('date') ? new Date(form.watch('date')) : undefined;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Modifier un événement' : 'Ajouter un nouvel événement'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Mettez à jour les détails de votre événement.' : 'Remplissez les détails de votre événement.'}
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="space-y-4 py-4">
          <input type="hidden" {...form.register('id')} />
          <input type="hidden" {...form.register('date')} />

          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Input id="event-description" {...form.register('description')} />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-amount">Montant</Label>
            <Input id="event-amount" type="number" step="0.01" {...form.register('amount')} />
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
                    !dateValue && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue ? format(dateValue, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => date && form.setValue('date', date.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
             {state.errors?.date && <p className="text-sm text-destructive">{state.errors.date[0]}</p>}
          </div>
          
          <SheetFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Enregistrer les modifications' : 'Enregistrer l\'événement'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
