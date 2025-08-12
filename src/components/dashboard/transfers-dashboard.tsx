
'use client';

import React, { useState, useMemo } from 'react';
import type { Transfer } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, SortingState, getSortedRowModel, ColumnFiltersState, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { ArrowUpDown, ArrowRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';
import { AddTransferSheet } from './add-transfer-sheet';

interface TransfersDashboardProps {
  initialTransfers: Transfer[];
}

export default function TransfersDashboard({ initialTransfers }: TransfersDashboardProps) {
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const { currency } = useCurrency();

  React.useEffect(() => {
    setTransfers(initialTransfers);
  }, [initialTransfers]);

  const columns: ColumnDef<Transfer>[] = [
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
      accessorKey: 'fromAccount',
      header: 'De',
    },
    {
        id: 'arrow',
        cell: () => <ArrowRight className="h-4 w-4 text-muted-foreground" />
    },
    {
      accessorKey: 'toAccount',
      header: 'À',
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
        <div className="text-right font-medium">
          {formatCurrency(row.original.amount, currency)}
        </div>
      ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const transfer = row.original;
            return (
                <AddTransferSheet transfer={transfer}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </AddTransferSheet>
            )
        }
    }
  ];

  const table = useReactTable({
    data: transfers,
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Virements</h1>
        <p className="text-muted-foreground">Suivez les mouvements d'argent entre vos comptes.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historique des virements</CardTitle>
          <CardDescription>Une liste de tous vos virements de compte à compte.</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Aucun virement trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
