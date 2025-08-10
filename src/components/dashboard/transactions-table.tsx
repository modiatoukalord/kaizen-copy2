
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { CategoryBadge } from './category-badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionCategory, Category } from '@/lib/types';

interface TransactionsTableProps {
  transactions: Transaction[];
  filterType?: 'income' | 'expense';
}

const incomeCategories: Category[] = ['Salary'];
const expenseCategories: Category[] = TransactionCategory.filter(c => c !== 'Salary');


export default function TransactionsTable({ transactions, filterType }: TransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

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
      accessorKey: 'category',
      header: 'Compte',
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
                Amount
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
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
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

  const availableCategories = React.useMemo(() => {
    if (filterType === 'income') return incomeCategories;
    if (filterType === 'expense') return expenseCategories;
    return TransactionCategory;
  }, [filterType]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A list of your recent financial activities.</CardDescription>
        <div className="mt-4 flex items-center gap-4">
            <Input
                placeholder="Filter by date..."
                value={(table.getColumn('date')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('date')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
            />
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
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Filter by account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[340px] overflow-y-auto">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
