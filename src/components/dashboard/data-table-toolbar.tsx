
'use client';

import { X } from 'lucide-react';
import type { Table } from '@tanstack/react-table';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  categoryOptions: {
    label: string;
    value: string;
  }[];
  filterType?: 'income' | 'expense';
}

export function DataTableToolbar<TData>({
  table,
  categoryOptions,
  filterType,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [date, setDate] = React.useState<DateRange | undefined>();
  
  React.useEffect(() => {
    table.getColumn('date')?.setFilterValue(date);
  }, [date, table]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4">
      <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2">
        <Input
          placeholder="Filtrer..."
          value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('description')?.setFilter(event.target.value)
          }
          className="h-10 w-full sm:w-[150px] lg:w-[250px]"
        />
        <DateRangePicker date={date} onDateChange={setDate} />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-10 px-2 lg:px-3 justify-center"
          >
            Réinitialiser
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
