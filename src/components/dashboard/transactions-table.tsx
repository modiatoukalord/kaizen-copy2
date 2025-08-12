
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
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table';
import { Pencil } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Transaction, Category } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { CategoryBadge } from './category-badge';
import { AddTransactionSheet } from './add-transaction-sheet';
import { useCurrency } from '@/contexts/currency-context';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { TransactionAccount, IncomeCategory, ExpenseCategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionsTableProps {
  transactions: Transaction[];
  filterType?: 'income' | 'expense';
  categoryOptions: { label: string; value: string; }[];
  globalFilter?: string;
}

export default function TransactionsTable({ transactions, filterType, categoryOptions, globalFilter: initialGlobalFilter }: TransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState(initialGlobalFilter ?? '');
  const { currency } = useCurrency();

  React.useEffect(() => {
    if (initialGlobalFilter !== undefined) {
      setGlobalFilter(initialGlobalFilter);
    }
  }, [initialGlobalFilter]);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(parseISO(row.getValue('date')), 'dd/MM/yyyy', { locale: fr }),
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
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Une liste de vos activités financières.</CardDescription>
        <div className="flex items-center gap-2 py-4">
            <Input
              placeholder="Filtrer toutes les colonnes..."
              value={globalFilter ?? ''}
              onChange={(event) =>
                setGlobalFilter(event.target.value)
              }
              className="max-w-sm"
            />
            {table.getColumn('category') && (
              <DataTableFacetedFilter
                column={table.getColumn('category')}
                title="Catégorie"
                options={categoryOptions}
              />
            )}
            {table.getColumn('account') && (
                <DataTableFacetedFilter
                    column={table.getColumn('account')}
                    title="Compte"
                    options={TransactionAccount.map(acc => ({ label: acc, value: acc }))}
                />
            )}
            {isFiltered && (
                <Button
                    variant="ghost"
                    onClick={() => {
                        table.resetColumnFilters();
                        setGlobalFilter('');
                    }}
                    className="h-10 px-2 lg:px-3"
                >
                    Réinitialiser
                </Button>
            )}
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
