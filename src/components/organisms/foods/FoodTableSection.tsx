import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { Star, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditIconButton } from '@/components/atoms';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { FoodItem } from '@/lib/tacoStore';

interface FoodTableSectionProps {
  data: FoodItem[];
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  onToggleFavorite: (id: string) => void;
  onEditCustomFood: (food: FoodItem) => void;
}

export function FoodTableSection({
  data,
  sorting,
  setSorting,
  onToggleFavorite,
  onEditCustomFood,
}: FoodTableSectionProps) {
  const columns = useMemo<ColumnDef<FoodItem>[]>(
    () => [
      {
        id: 'favorite',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="quiet"
            size="compact"
            iconOnly
            onClick={() => onToggleFavorite(row.original.id)}
            className="hover:bg-amber-50 text-amber-400"
          >
            <Star
              className={`w-4 h-4 ${row.original.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            />
          </Button>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Nome do Alimento
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-slate-800 flex items-center gap-2">
            <span>{row.original.name}</span>
            {(row.original.isCustom || row.original.source === 'CUSTOM') && (
              <Badge variant="secondary" className="text-[10px]">
                Custom
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => <span className="text-slate-600 text-xs">{row.original.category || '-'}</span>,
      },
      {
        accessorKey: 'preparo',
        header: 'Preparo',
        cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.preparo || 'Cru'}</span>,
      },
      {
        accessorKey: 'kcal',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Kcal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-semibold text-slate-700">{row.original.kcal} kcal</span>,
      },
      {
        accessorKey: 'proteinG',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Proteína
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-emerald-700 font-medium">{row.original.proteinG}g</span>,
      },
      {
        accessorKey: 'carbsG',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Carboidrato
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-amber-700 font-medium">{row.original.carbsG}g</span>,
      },
      {
        accessorKey: 'fatG',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Gordura
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-rose-700 font-medium">{row.original.fatG ?? row.original.fatsG}g</span>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.isCustom || row.original.source === 'CUSTOM' ? (
            <EditIconButton onClick={() => onEditCustomFood(row.original)} title="Editar alimento customizado" />
          ) : null,
      },
    ],
    [onToggleFavorite, onEditCustomFood]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-3">
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  Nenhum alimento encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-slate-500">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="compact"
            iconOnly
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="compact"
            iconOnly
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="compact"
            iconOnly
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="compact"
            iconOnly
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
