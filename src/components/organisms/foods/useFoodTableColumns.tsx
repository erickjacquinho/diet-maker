import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Star, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditIconButton } from '@/components/atoms';
import { FoodItem } from '@/lib/tacoStore';

export function useFoodTableColumns({
  onToggleFavorite,
  onEditCustomFood,
}: {
  onToggleFavorite: (id: string) => void;
  onEditCustomFood: (food: FoodItem) => void;
}) {
  return useMemo<ColumnDef<FoodItem>[]>(
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
            className="hover:bg-warning-soft text-warning"
          >
            <Star
              className={`w-4 h-4 ${row.original.isFavorite ? 'fill-warning text-warning' : 'text-text-muted'}`}
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
          <div className="font-medium text-text-primary flex items-center gap-2">
            <span>{row.original.name}</span>
            {(row.original.isCustom || row.original.source === 'CUSTOM') && (
              <Badge variant="secondary" className="text-style-legal">
                Custom
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => <span className="text-text-secondary text-style-legal">{row.original.category || '-'}</span>,
      },
      {
        accessorKey: 'preparo',
        header: 'Preparo',
        cell: ({ row }) => <span className="text-text-muted text-style-legal">{row.original.preparo || 'Cru'}</span>,
      },
      {
        accessorKey: 'kcal',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Kcal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-semibold text-text-secondary">{row.original.kcal} kcal</span>,
      },
      {
        accessorKey: 'proteinG',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Proteína
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-macro-protein font-medium">{row.original.proteinG}g</span>,
      },
      {
        accessorKey: 'carbsG',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Carboidrato
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-macro-carbohydrate font-medium">{row.original.carbsG}g</span>,
      },
      {
        accessorKey: 'fatG',
        header: ({ column }) => (
          <Button variant="quiet" size="compact" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Gordura
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-macro-fat font-medium">{row.original.fatG ?? row.original.fatsG}g</span>,
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
}
