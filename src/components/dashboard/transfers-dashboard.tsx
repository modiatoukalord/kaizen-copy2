
'use client';

import React, { useState, useMemo } from 'react';
import type { Transfer } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, SortingState, getSortedRowModel, ColumnFiltersState, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { ArrowUpDown, ArrowRight, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';
import { AddTransferSheet } from './add-transfer-sheet';
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { handleDeleteTransfer } from '@/app/actions';
import { toast } from '@/hooks/use-toast';

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
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setTransfers(initialTransfers);
  }, [initialTransfers]);
  
  const onDelete = (id: string) => {
    startTransition(async () => {
        const result = await handleDeleteTransfer(id);
        if (result.success) {
            toast({
                title: 'Succès',
                description: result.message,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: result.message,
            });
        }
    });
  }

  const columns: ColumnDef<Transfer>[] = React.useMemo(() => [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <>
            {format(new Date(row.getValue('date')), 'dd/MM/yyyy')}
        </>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div className="hidden md:table-cell">{row.original.description}</div>
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
                <div className='flex justify-end'>
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <AddTransferSheet transfer={transfer}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                            </AddTransferSheet>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Le virement sera définitivement supprimé.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(transfer.id)} disabled={isPending}>
                                    Continuer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [currency, isPending]);

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
                    <TableHead key={header.id} className={cn(header.id === 'description' && 'hidden md:table-cell')}>
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
                      <TableCell key={cell.id} className={cn(cell.column.id === 'description' && 'hidden md:table-cell')}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
          </Table>>
        </CardContent>
      </Card>
    </div>
  );
}
