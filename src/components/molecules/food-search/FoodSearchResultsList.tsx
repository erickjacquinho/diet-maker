'use client';

import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/atoms';
import { DataTable, type DataTableColumnDef, type DataTableProps } from '@/components/molecules/DataTable';
import { textStyle } from '@/design-system';
import { FoodItem } from '@/lib/tacoStore';
import { cn } from '@/lib/utils';

export interface FoodSearchResultsListProps {
  searchResults: FoodItem[];
  selectedFoodIds: Set<string>;
  query: string;
  onlyFavorites?: boolean;
  onToggleFood: (food: FoodItem) => void;
  onToggleAll?: () => void;
  onToggleFavorite?: (foodId: string) => void;
  sort?: DataTableProps<FoodItem>['sort'];
  mode?: 'single' | 'multi';
}

export function FoodSearchResultsList({
  searchResults,
  selectedFoodIds,
  query,
  onlyFavorites = false,
  onToggleFood,
  onToggleAll,
  onToggleFavorite,
  sort,
  mode = 'multi',
}: FoodSearchResultsListProps) {
  const columns: DataTableColumnDef<FoodItem>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Nome (100g base)',
        sortable: true,
        sortValue: (food) => food.name,
        sortLabel: 'Nome (100g base)',
        headerClassName: 'w-56 px-3 text-left',
        className: 'w-56 h-table-row-food text-left py-1 px-3 font-bold text-style-body-small text-text-primary',
        cell: (food) => (
          <div className="grid h-full min-w-0 content-center">
            <div className="flex min-w-0 items-center gap-0.5 whitespace-nowrap">
              <span className="min-w-0 truncate whitespace-nowrap text-style-body-small font-bold text-text-primary" title={food.name}>
                {food.name}
              </span>
              <Button
                type="button"
                variant="quiet"
                size="compact"
                iconOnly
                aria-label={
                  food.isFavorite
                    ? `Remover ${food.name} dos favoritos`
                    : `Favoritar ${food.name}`
                }
                title={food.isFavorite ? 'Remover dos favoritos' : 'Favoritar alimento'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(food.id);
                }}
                className="size-8 shrink-0 whitespace-nowrap p-1 rounded-compact text-text-muted hover:text-warning hover:bg-warning-soft"
              >
                <Star
                  size={14}
                  aria-hidden="true"
                  className={cn(
                    'transition-colors',
                    food.isFavorite
                      ? 'fill-warning text-warning'
                      : 'text-text-muted hover:text-warning'
                  )}
                />
              </Button>
            </div>
            <span className={cn(textStyle('metadata'), '-mt-1 truncate whitespace-nowrap')}>
              {food.preparo && food.preparo !== 'inNatura' ? `${food.preparo} · ` : ''}
              {food.category || 'Geral'}
            </span>
          </div>
        ),
      },
      {
        id: 'protein',
        align: 'center',
        header: <span className="text-macro-protein">Proteína</span>,
        sortable: true,
        sortValue: (food) => food.proteinG,
        sortLabel: 'Proteína',
        headerClassName: 'w-28 px-3 text-center text-macro-protein',
        className: 'w-28 text-center font-bold text-macro-protein tabular-nums py-2 px-3 text-style-legal',
        cell: (food) => `${food.proteinG}g`,
      },
      {
        id: 'carbs',
        align: 'center',
        header: <span className="text-macro-carbohydrate">Carboidrato</span>,
        sortable: true,
        sortValue: (food) => food.carbsG,
        sortLabel: 'Carboidrato',
        headerClassName: 'w-32 px-3 text-center text-macro-carbohydrate',
        className: 'w-32 text-center font-bold text-macro-carbohydrate tabular-nums py-2 px-3 text-style-legal',
        cell: (food) => `${food.carbsG}g`,
      },
      {
        id: 'fats',
        align: 'center',
        header: <span className="text-macro-fat">Gorduras</span>,
        sortable: true,
        sortValue: (food) => food.fatG ?? food.fatsG,
        sortLabel: 'Gorduras',
        headerClassName: 'w-28 px-3 text-center text-macro-fat',
        className: 'w-28 text-center font-bold text-macro-fat tabular-nums py-2 px-3 text-style-legal',
        cell: (food) => `${food.fatG ?? food.fatsG}g`,
      },
      {
        id: 'kcal',
        align: 'center',
        header: 'Calorias',
        sortable: true,
        sortValue: (food) => food.kcal,
        sortLabel: 'Calorias',
        headerClassName: 'w-32 px-3 text-center',
        className: 'w-32 text-center font-bold text-text-primary tabular-nums py-2 px-3 text-style-legal',
        cell: (food) => (
          <>
            {food.kcal} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
          </>
        ),
      },
    ],
    [onToggleFavorite]
  );

  if (searchResults.length === 0) {
    return (
      <div className="flex-1 min-h-table-modal max-h-table-modal flex flex-col items-center justify-center p-8 text-center text-text-muted gap-2 border border-dashed border-border-divider rounded-control my-2 bg-surface-subtle">
        <span className="font-semibold text-text-secondary">
          {onlyFavorites ? 'Nenhum alimento favorito encontrado' : 'Nenhum alimento encontrado'}
        </span>
        <span className="text-style-caption max-w-sm">
          {onlyFavorites
            ? query
              ? `Nenhum alimento favorito corresponde a "${query}".`
              : 'Você ainda não favoritou nenhum alimento. Clique na estrela ao lado de qualquer alimento para favoritá-lo.'
            : query
            ? `Nenhum resultado para "${query}". Tente buscar por termos genéricos como "Frango", "Arroz", "Ovo" ou "Banana".`
            : 'Digite o nome do alimento acima para buscar na base TACO.'}
        </span>
      </div>
    );
  }

  return (
    <div className="my-2 flex-1 min-h-table-modal max-h-table-modal flex flex-col bg-surface overflow-hidden">
      <DataTable
        data={searchResults}
        columns={columns}
        getRowId={(food) => food.id}
        caption="Lista de resultados de alimentos da base TACO"
        emptyMessage="Nenhum alimento encontrado."
        sort={sort}
        selection={{
          mode,
          selectedRowIds: selectedFoodIds,
          onSelectionChange: (nextSet) => {
            if (mode === 'single') {
              const selectedId = Array.from(nextSet)[0];
              const found = searchResults.find((f) => f.id === selectedId) || null;
              if (found) {
                onToggleFood(found);
              } else {
                const previous = searchResults.find((f) => selectedFoodIds.has(f.id));
                if (previous) onToggleFood(previous);
              }
            } else {
              const changedFoods = searchResults.filter((food) => selectedFoodIds.has(food.id) !== nextSet.has(food.id));
              if (onToggleAll && changedFoods.length === searchResults.length) {
                onToggleAll();
              } else {
                changedFoods.forEach(onToggleFood);
              }
            }
          },
          selectOnRowClick: true,
          selectAllAriaLabel: 'Selecionar todos os alimentos visíveis',
          selectRowAriaLabel: (food) => `Selecionar ${food.name}`,
        }}
        stickyHeader
        maxHeight="table-modal"
        virtualization={{ overscan: 8 }}
        tableClassName="table-fixed w-max min-w-full"
        className="flex-1 min-h-0"
      />
    </div>
  );
}
