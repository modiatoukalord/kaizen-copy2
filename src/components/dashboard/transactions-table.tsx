
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
import { MoreHorizontal, Pencil } from 'lucide-react';
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


interface TransactionsTableProps {
  transactions: Transaction[];
  filterType?: 'income' | 'expense';
  showFilters?: boolean;
}

export default function TransactionsTable({ transactions, filterType, showFilters = false }: TransactionsTableProps) {
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

  const categoryOptions = (filterType === 'income' ? IncomeCategory : ExpenseCategory).map(c => ({label: c, value: c}));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Transactions Récentes</CardTitle>
        <CardDescription>Une liste de vos activités financières récentes.</CardDescription>
        {showFilters && (
            <div className="flex items-center gap-2 pt-4">
                <Input
                    placeholder="Filtrer par description..."
                    value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('description')?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                {table.getColumn('account') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('account')}
                        title="Comptes"
                        options={TransactionAccount.map(acc => ({label: acc, value: acc}))}
                    />
                )}
                {table.getColumn('category') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('category')}
                        title="Catégories"
                        options={categoryOptions}
                    />
                )}
            </div>
        )}
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
