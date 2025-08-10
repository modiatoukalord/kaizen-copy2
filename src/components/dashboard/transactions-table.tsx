
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MoreHorizontal, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { CategoryBadge } from './category-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionAccount, TransactionCategory, IncomeCategory, ExpenseCategory } from '@/lib/types';
import { AddTransactionSheet } from './add-transaction-sheet';
import { useCurrency } from '@/contexts/currency-context';


interface TransactionsTableProps {
  transactions: Transaction[];
  filterType?: 'income' | 'expense';
}

export default function TransactionsTable({ transactions, filterType }: TransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const { currency } = useCurrency();

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'account',
      header: 'Compte',
      cell: ({ row }) => <span>{row.original.account}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
        accessorKey: 'category',
        header: 'Catégorie',
        cell: ({ row }) => <CategoryBadge category={row.original.category} />,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <div className="text-right">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Montant
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={cn(
            'text-right font-medium',
            row.original.type === 'income' ? 'text-chart-2' : 'text-foreground'
          )}
        >
          {row.original.type === 'income' ? '+' : '-'}
          {formatCurrency(row.original.amount, currency)}
        </div>
      ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <AddTransactionSheet transaction={transaction}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </AddTransactionSheet>
            )
        }
    }
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const dateFilterValue = table.getColumn('date')?.getFilterValue() as { start?: Date, end?: Date } | undefined;
  
  const categoryFilterOptions = React.useMemo(() => {
    if (filterType === 'income') return IncomeCategory;
    if (filterType === 'expense') return ExpenseCategory;
    return TransactionCategory;
  }, [filterType]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Transactions Récentes</CardTitle>
        <CardDescription>Une liste de vos activités financières récentes.</CardDescription>
        <div className="mt-4 grid flex-1 grid-cols-1 items-center gap-4 md:grid-cols-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateFilterValue && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilterValue?.start ? (
                    dateFilterValue.end ? (
                      <>
                        {format(dateFilterValue.start, 'LLL dd, y')} -{' '}
                        {format(dateFilterValue.end, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateFilterValue.start, 'LLL dd, y')
                    )
                  ) : (
                    <span>Filtrer par date...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={dateFilterValue}
                  onSelect={(range) => {
                     table.getColumn('date')?.setFilterValue(range);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select
              value={(table.getColumn('account')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) => {
                  if (value === 'all') {
                      table.getColumn('account')?.setFilterValue(undefined);
                  } else {
                      table.getColumn('account')?.setFilterValue(value);
                  }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrer par compte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                {TransactionAccount.map((acc) => (
                  <SelectItem key={acc} value={acc}>
                    {acc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(table.getColumn('category')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) => {
                  if (value === 'all') {
                      table.getColumn('category')?.setFilterValue(undefined);
                  } else {
                      table.getColumn('category')?.setFilterValue(value);
                  }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categoryFilterOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
