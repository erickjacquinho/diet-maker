import { useMemo } from 'react';
import { ArrowUpDown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditIconButton } from '@/components/atoms';
import type { DataTableColumnDef } from '@/components/molecules/DataTable';
import type { FoodItem } from '@/lib/tacoStore';

export function useFoodTableColumns({
  onToggleFavorite,
  onEditCustomFood,
}: {
  onToggleFavorite: (id: string) => void;
  onEditCustomFood: (food: FoodItem) => void;
}): DataTableColumnDef<FoodItem>[] {
  return useMemo<DataTableColumnDef<FoodItem>[]>(
    () => [
      {
        id: 'favorite',
        header: <span className="sr-only">Favorito</span>,
        cell: (food) => (
          <Button
            variant="quiet"
            size="compact"
            iconOnly
            type="button"
            aria-label={food.isFavorite ? `Remover ${food.name} dos favoritos` : `Favoritar ${food.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(food.id);
            }}
            className="hover:bg-warning-soft text-warning"
          >
            <Star
              size={16}
              aria-hidden="true"
              className={food.isFavorite ? 'fill-warning text-warning' : 'text-text-muted'}
            />
          </Button>
        ),
      },
      {
        id: 'name',
        header: (
          <span className="inline-flex items-center gap-2">
            Nome do Alimento
            <ArrowUpDown size={16} aria-hidden="true" />
          </span>
        ),
        sortLabel: 'nome do alimento',
        sortable: true,
        sortValue: (food) => food.name,
        cell: (food) => (
          <div className="flex items-center gap-2 font-medium text-text-primary">
            <span>{food.name}</span>
            {(food.isCustom || food.source === 'CUSTOM') && (
              <Badge variant="secondary" className="text-style-legal">
                Custom
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Categoria',
        cell: (food) => <span className="text-style-legal text-text-secondary">{food.category || '-'}</span>,
      },
      {
        id: 'preparo',
        header: 'Preparo',
        cell: (food) => <span className="text-style-legal text-text-muted">{food.preparo || 'Cru'}</span>,
      },
      {
        id: 'kcal',
        header: (
          <span className="inline-flex items-center gap-2">
            Kcal
            <ArrowUpDown size={16} aria-hidden="true" />
          </span>
        ),
        sortLabel: 'kcal',
        sortable: true,
        sortValue: (food) => food.kcal,
        align: 'right',
        cell: (food) => <span className="font-semibold text-text-secondary">{food.kcal} kcal</span>,
      },
      {
        id: 'proteinG',
        header: (
          <span className="inline-flex items-center gap-2">
            Proteína
            <ArrowUpDown size={16} aria-hidden="true" />
          </span>
        ),
        sortLabel: 'proteína',
        sortable: true,
        sortValue: (food) => food.proteinG,
        align: 'right',
        cell: (food) => <span className="font-medium text-macro-protein">{food.proteinG}g</span>,
      },
      {
        id: 'carbsG',
        header: (
          <span className="inline-flex items-center gap-2">
            Carboidrato
            <ArrowUpDown size={16} aria-hidden="true" />
          </span>
        ),
        sortLabel: 'carboidrato',
        sortable: true,
        sortValue: (food) => food.carbsG,
        align: 'right',
        cell: (food) => <span className="font-medium text-macro-carbohydrate">{food.carbsG}g</span>,
      },
      {
        id: 'fatG',
        header: (
          <span className="inline-flex items-center gap-2">
            Gordura
            <ArrowUpDown size={16} aria-hidden="true" />
          </span>
        ),
        sortLabel: 'gordura',
        sortable: true,
        sortValue: (food) => food.fatG ?? food.fatsG,
        align: 'right',
        cell: (food) => <span className="font-medium text-macro-fat">{food.fatG ?? food.fatsG}g</span>,
      },
      {
        id: 'actions',
        header: <span className="sr-only">Ações</span>,
        cell: (food) =>
          food.isCustom || food.source === 'CUSTOM' ? (
            <EditIconButton
              onClick={(event) => {
                event.stopPropagation();
                onEditCustomFood(food);
              }}
              title="Editar alimento customizado"
            />
          ) : null,
      },
    ],
    [onToggleFavorite, onEditCustomFood],
  );
}
