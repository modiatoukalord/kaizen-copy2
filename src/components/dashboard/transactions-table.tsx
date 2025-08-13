
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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { TransactionAccount, IncomeCategory, ExpenseSubCategory, ExpenseParentCategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import { handleDeleteTransaction } from '@/app/actions';
import { toast } from '@/hooks/use-toast';

interface TransactionsTableProps {
  transactions: Transaction[];
  filterType?: 'income' | 'expense';
  categoryOptions: { label: string; value: string; }[];
  globalFilter: string;
  onGlobalFilterChange: (filter: string) => void;
}

export default function TransactionsTable({ transactions, filterType, categoryOptions, globalFilter, onGlobalFilterChange }: TransactionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const { currency } = useCurrency();

  const [isPending, startTransition] = React.useTransition();

  const onDelete = (id: string) => {
    startTransition(async () => {
        const result = await handleDeleteTransaction(id);
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

  const columns: ColumnDef<Transaction>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<Transaction>[] = [
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
    ];

    if (filterType === 'expense') {
        baseColumns.push(
            {
                accessorKey: 'parentCategory',
                header: 'Catégorie',
                cell: ({ row }) => <span>{row.original.parentCategory || 'N/A'}</span>,
                filterFn: (row, id, value) => {
                  return value.includes(row.getValue(id));
                },
            },
            {
                accessorKey: 'category',
                header: 'Sous-catégorie',
                cell: ({ row }) => <CategoryBadge category={row.original.category} />,
                filterFn: (row, id, value) => {
                  return value.includes(row.getValue(id));
                },
            }
        );
    } else {
         baseColumns.push({
            accessorKey: 'category',
            header: 'Catégorie',
            cell: ({ row }) => <CategoryBadge category={row.original.category} />,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        });
    }

    baseColumns.push(
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
                              <AddTransactionSheet transaction={transaction}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                              </AddTransactionSheet>
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
                                      Cette action est irréversible. La transaction sera définitivement supprimée.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDelete(transaction.id)} disabled={isPending}>
                                      Continuer
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )
            }
        }
    );

    return baseColumns;

  }, [filterType, currency, isPending]);

  const table = useReactTable({
    data: transactions,
    columns,
    onGlobalFilterChange: onGlobalFilterChange,
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
    initialState: {
        columnVisibility: {
            parentCategory: filterType === 'expense'
        }
    }
  });

  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;

  const parentCategoryOptions = React.useMemo(() => {
    return ExpenseParentCategory.map(cat => ({ label: cat, value: cat }));
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Une liste de vos activités financières.</CardDescription>
        <div className="flex items-center gap-2 py-4 flex-wrap">
            <Input
              placeholder="Filtrer toutes les colonnes..."
              value={globalFilter ?? ''}
              onChange={(event) =>
                onGlobalFilterChange(event.target.value)
              }
              className="max-w-sm"
            />
            {filterType === 'expense' && table.getColumn('parentCategory') && (
              <DataTableFacetedFilter
                column={table.getColumn('parentCategory')}
                title="Catégorie"
                options={parentCategoryOptions}
              />
            )}
            {table.getColumn('category') && (
              <DataTableFacetedFilter
                column={table.getColumn('category')}
                title={filterType === 'expense' ? "Sous-catégorie" : "Catégorie"}
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
                        onGlobalFilterChange('');
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
