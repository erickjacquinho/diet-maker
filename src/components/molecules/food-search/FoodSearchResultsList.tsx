'use client';

import React, { useMemo } from 'react';
import { Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { FoodItem } from '@/lib/tacoStore';
import { cn } from '@/lib/utils';

export type FoodSortField = 'name' | 'protein' | 'carbs' | 'fats' | 'kcal';
export type FoodSortDirection = 'asc' | 'desc';

export interface FoodSortConfig {
  field: FoodSortField;
  direction: FoodSortDirection;
}

export interface FoodSearchResultsListProps {
  searchResults: FoodItem[];
  selectedFoodIds: Set<string>;
  query: string;
  onlyFavorites?: boolean;
  onToggleFood: (food: FoodItem) => void;
  onToggleAll?: () => void;
  onToggleFavorite?: (foodId: string) => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
  sortConfig?: FoodSortConfig | null;
  onSort?: (field: FoodSortField) => void;
  mode?: 'single' | 'multi';
}

function SortHeaderButton({
  field,
  label,
  currentSort,
  onSort,
  align = 'left',
  className,
}: {
  field: FoodSortField;
  label: string;
  currentSort?: FoodSortConfig | null;
  onSort?: (field: FoodSortField) => void;
  align?: 'left' | 'right';
  className?: string;
}) {
  const isSorted = currentSort?.field === field;
  const direction = currentSort?.direction;

  return (
    <button
      type="button"
      onClick={() => onSort?.(field)}
      className={cn(
        'group inline-flex items-center gap-1.5 font-bold text-style-chart-micro uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary select-none cursor-pointer py-1',
        align === 'right' ? 'justify-end w-full' : 'justify-start',
        isSorted ? 'text-text-primary font-black' : 'text-text-secondary hover:text-text-primary',
        className
      )}
      title={`Ordenar por ${label} (${isSorted ? (direction === 'desc' ? 'maior para menor' : 'menor para maior') : 'clique para ordenar'})`}
    >
      <span>{label}</span>
      {isSorted ? (
        direction === 'desc' ? (
          <ArrowDown size={12} strokeWidth={2.5} className="text-primary shrink-0" aria-label="Ordenado decrescente" />
        ) : (
          <ArrowUp size={12} strokeWidth={2.5} className="text-primary shrink-0" aria-label="Ordenado crescente" />
        )
      ) : (
        <ArrowUpDown
          size={12}
          className="opacity-subdued group-hover:opacity-full transition-opacity shrink-0"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function FoodSearchResultsList({
  searchResults,
  selectedFoodIds,
  query,
  onlyFavorites = false,
  onToggleFood,
  onToggleAll,
  onToggleFavorite,
  isAllSelected,
  sortConfig,
  onSort,
  mode = 'multi',
}: FoodSearchResultsListProps) {
  const columns: DataTableColumnDef<FoodItem>[] = useMemo(
    () => [
      {
        id: 'name',
        header: (
          <SortHeaderButton
            field="name"
            label="Nome (100g base)"
            currentSort={sortConfig}
            onSort={onSort}
            align="left"
          />
        ),
        headerClassName: 'text-left min-w-[160px] px-3',
        className: 'text-left py-2 px-3 font-bold text-style-legal text-text-primary min-w-[160px]',
        cell: (food) => (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate block font-bold text-text-primary" title={food.name}>
                {food.name}
              </span>
              <button
                type="button"
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
                className="shrink-0 p-0.5 rounded-compact text-text-muted hover:text-warning hover:bg-warning-soft transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus inline-flex items-center justify-center"
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
              </button>
            </div>
            <span className="text-style-chart-micro text-text-muted font-normal truncate">
              {food.preparo && food.preparo !== 'inNatura' ? `${food.preparo} · ` : ''}
              {food.category || 'Geral'}
            </span>
          </div>
        ),
      },
      {
        id: 'protein',
        align: 'right',
        header: (
          <SortHeaderButton
            field="protein"
            label="Proteína"
            currentSort={sortConfig}
            onSort={onSort}
            align="right"
            className="text-macro-protein hover:text-macro-protein"
          />
        ),
        headerClassName: 'w-24 sm:w-28 text-right px-3 text-macro-protein',
        className: 'w-24 sm:w-28 text-right font-bold text-macro-protein tabular-nums py-2.5 px-3 text-style-legal',
        cell: (food) => `${food.proteinG}g`,
      },
      {
        id: 'carbs',
        align: 'right',
        header: (
          <SortHeaderButton
            field="carbs"
            label="Carboidrato"
            currentSort={sortConfig}
            onSort={onSort}
            align="right"
            className="text-macro-carbohydrate hover:text-macro-carbohydrate"
          />
        ),
        headerClassName: 'w-28 sm:w-32 text-right px-3 text-macro-carbohydrate',
        className: 'w-28 sm:w-32 text-right font-bold text-macro-carbohydrate tabular-nums py-2.5 px-3 text-style-legal',
        cell: (food) => `${food.carbsG}g`,
      },
      {
        id: 'fats',
        align: 'right',
        header: (
          <SortHeaderButton
            field="fats"
            label="Gorduras"
            currentSort={sortConfig}
            onSort={onSort}
            align="right"
            className="text-macro-fat hover:text-macro-fat"
          />
        ),
        headerClassName: 'w-24 sm:w-28 text-right px-3 text-macro-fat',
        className: 'w-24 sm:w-28 text-right font-bold text-macro-fat tabular-nums py-2.5 px-3 text-style-legal',
        cell: (food) => `${food.fatG ?? food.fatsG}g`,
      },
      {
        id: 'kcal',
        align: 'right',
        header: (
          <SortHeaderButton
            field="kcal"
            label="Calorias"
            currentSort={sortConfig}
            onSort={onSort}
            align="right"
          />
        ),
        headerClassName: 'w-28 sm:w-32 text-right px-4',
        className: 'w-28 sm:w-32 text-right font-bold text-text-primary tabular-nums py-2.5 px-4 text-style-legal',
        cell: (food) => (
          <>
            {food.kcal} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
          </>
        ),
      },
    ],
    [sortConfig, onSort, onToggleFavorite]
  );

  if (searchResults.length === 0) {
    return (
      <div className="flex-1 min-h-[450px] max-h-[450px] flex flex-col items-center justify-center p-8 text-center text-text-muted gap-2 border border-dashed border-border-divider rounded-control my-2 bg-surface-subtle">
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
    <div className="my-2 flex-1 min-h-[450px] max-h-[450px] flex flex-col rounded-control border border-border-divider bg-surface overflow-hidden">
      <DataTable
        data={searchResults}
        columns={columns}
        getRowId={(food) => food.id}
        caption="Lista de resultados de alimentos da base TACO"
        emptyMessage="Nenhum alimento encontrado."
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
              if (onToggleAll && nextSet.size === 0 && (isAllSelected || selectedFoodIds.size === searchResults.length)) {
                onToggleAll();
              } else if (onToggleAll && nextSet.size === searchResults.length && selectedFoodIds.size === 0) {
                onToggleAll();
              } else {
                for (const food of searchResults) {
                  const wasSelected = selectedFoodIds.has(food.id);
                  const isSelected = nextSet.has(food.id);
                  if (wasSelected !== isSelected) {
                    onToggleFood(food);
                    break;
                  }
                }
              }
            }
          },
          selectOnRowClick: true,
          selectAllAriaLabel: 'Selecionar todos os alimentos visíveis',
          selectRowAriaLabel: (food) => `Selecionar ${food.name}`,
        }}
        stickyHeader
        maxHeight="450px"
        tableClassName="table-fixed w-full"
        className="flex-1 min-h-0"
      />
    </div>
  );
}
