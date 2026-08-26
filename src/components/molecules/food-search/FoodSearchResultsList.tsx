'use client';

import React from 'react';
import { Check, Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
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
  onToggleAll: () => void;
  onToggleFavorite?: (foodId: string) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  sortConfig?: FoodSortConfig | null;
  onSort?: (field: FoodSortField) => void;
}

interface FoodSearchResultRowProps {
  food: FoodItem;
  isSelected: boolean;
  onToggleFood: (food: FoodItem) => void;
  onToggleFavorite?: (foodId: string) => void;
}

const FoodSearchResultRow = React.memo(function FoodSearchResultRow({
  food,
  isSelected,
  onToggleFood,
  onToggleFavorite,
}: FoodSearchResultRowProps) {
  return (
    <TableRow
      data-state={isSelected ? 'selected' : undefined}
      onClick={() => onToggleFood(food)}
      className={cn(
        'cursor-pointer select-none transition-colors border-b border-border-divider hover:bg-surface-hover',
        isSelected && 'bg-primary-soft/30 hover:bg-primary-soft/40'
      )}
    >
      {/* 1. Checkbox da Linha */}
      <TableCell
        className="w-10 px-3 py-2 text-center"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFood(food);
        }}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Selecionar ${food.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFood(food);
          }}
          className={cn(
            'size-4 rounded-compact border flex items-center justify-center transition-colors duration-fast mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
            isSelected
              ? 'bg-primary border-primary text-on-primary'
              : 'border-border-subtle bg-surface hover:border-border-hover'
          )}
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </button>
      </TableCell>

      {/* 2. Nome + Categoria/Preparo */}
      <TableCell className="text-left py-2 px-3 font-bold text-style-legal text-text-primary min-w-[160px]">
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
              className="shrink-0 p-0.5 rounded-compact text-text-muted hover:text-warning hover:bg-warning-soft/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus inline-flex items-center justify-center"
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
      </TableCell>

      {/* 3. Proteína */}
      <TableCell className="w-24 sm:w-28 text-right font-bold text-macro-protein tabular-nums py-2.5 px-3 text-style-legal">
        {food.proteinG}g
      </TableCell>

      {/* 4. Carboidrato */}
      <TableCell className="w-28 sm:w-32 text-right font-bold text-macro-carbohydrate tabular-nums py-2.5 px-3 text-style-legal">
        {food.carbsG}g
      </TableCell>

      {/* 5. Gorduras */}
      <TableCell className="w-24 sm:w-28 text-right font-bold text-macro-fat tabular-nums py-2.5 px-3 text-style-legal">
        {food.fatG ?? food.fatsG}g
      </TableCell>

      {/* 6. Calorias */}
      <TableCell className="w-28 sm:w-32 text-right font-bold text-text-primary tabular-nums py-2.5 px-4 text-style-legal">
        {food.kcal} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
      </TableCell>
    </TableRow>
  );
});

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
          className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0"
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
  isSomeSelected,
  sortConfig,
  onSort,
}: FoodSearchResultsListProps) {
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
      {/* 1. Header Fixo (fora da área de rolagem) */}
      <div className="bg-surface-subtle border-b border-border-divider shrink-0">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-surface-subtle">
            <TableRow className="hover:bg-surface-subtle border-0">
              {/* 1. Header Checkbox (Selecionar Todos) */}
              <TableHead className="w-10 px-3 text-center h-9 bg-surface-subtle">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isAllSelected ? true : isSomeSelected ? 'mixed' : false}
                  aria-label="Selecionar todos os alimentos visíveis"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAll();
                  }}
                  className={cn(
                    'size-4 rounded-compact border flex items-center justify-center transition-colors duration-fast mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
                    isAllSelected
                      ? 'bg-primary border-primary text-on-primary'
                      : isSomeSelected
                      ? 'bg-primary-soft border-primary text-primary'
                      : 'border-border-subtle bg-surface hover:border-border-hover'
                  )}
                >
                  {isAllSelected && <Check size={12} strokeWidth={3} />}
                  {isSomeSelected && !isAllSelected && (
                    <span className="w-2 h-0.5 bg-primary rounded-round" />
                  )}
                </button>
              </TableHead>

              {/* 2. Nome do Alimento */}
              <TableHead className="text-left font-bold text-style-chart-micro uppercase tracking-wider text-text-secondary h-9 bg-surface-subtle px-3">
                <SortHeaderButton
                  field="name"
                  label="Nome (100g base)"
                  currentSort={sortConfig}
                  onSort={onSort}
                  align="left"
                />
              </TableHead>

              {/* 3. Proteína (P) */}
              <TableHead className="w-24 sm:w-28 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-protein h-9 bg-surface-subtle px-3">
                <SortHeaderButton
                  field="protein"
                  label="Proteína"
                  currentSort={sortConfig}
                  onSort={onSort}
                  align="right"
                  className="text-macro-protein hover:text-macro-protein"
                />
              </TableHead>

              {/* 4. Carboidrato (C) */}
              <TableHead className="w-28 sm:w-32 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-carbohydrate h-9 bg-surface-subtle px-3">
                <SortHeaderButton
                  field="carbs"
                  label="Carboidrato"
                  currentSort={sortConfig}
                  onSort={onSort}
                  align="right"
                  className="text-macro-carbohydrate hover:text-macro-carbohydrate"
                />
              </TableHead>

              {/* 5. Gorduras (G) */}
              <TableHead className="w-24 sm:w-28 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-fat h-9 bg-surface-subtle px-3">
                <SortHeaderButton
                  field="fats"
                  label="Gorduras"
                  currentSort={sortConfig}
                  onSort={onSort}
                  align="right"
                  className="text-macro-fat hover:text-macro-fat"
                />
              </TableHead>

              {/* 6. Calorias (kcal) */}
              <TableHead className="w-28 sm:w-32 text-right font-bold text-style-chart-micro uppercase tracking-wider text-text-primary h-9 bg-surface-subtle px-4">
                <SortHeaderButton
                  field="kcal"
                  label="Calorias"
                  currentSort={sortConfig}
                  onSort={onSort}
                  align="right"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* 2. Corpo Rolável (apenas as linhas rolam) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <Table className="table-fixed w-full">
          <TableBody>
            {searchResults.map((food) => (
              <FoodSearchResultRow
                key={food.id}
                food={food}
                isSelected={selectedFoodIds.has(food.id)}
                onToggleFood={onToggleFood}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
