'use client';

import React, { useMemo } from 'react';
import { Clock, UtensilsCrossed } from 'lucide-react';
import { DataTable, type DataTableColumnDef, type DataTableProps } from '@/components/molecules/DataTable';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { textStyle } from '@/design-system';
import type { ReadyMeal } from '@/lib/readyMealsStore';
import { cn } from '@/lib/utils';

export interface ReadyMealSearchResultsListProps {
  searchResults: ReadyMeal[];
  selectedMealIds: Set<string>;
  query: string;
  onToggleMeal: (meal: ReadyMeal) => void;
  onToggleAll?: () => void;
  sort?: DataTableProps<ReadyMeal>['sort'];
  mode?: 'single' | 'multi';
}

export function ReadyMealSearchResultsList({
  searchResults,
  selectedMealIds,
  query,
  onToggleMeal,
  onToggleAll,
  sort,
  mode = 'multi',
}: ReadyMealSearchResultsListProps) {
  const columns: DataTableColumnDef<ReadyMeal>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Refeição Pronta',
        sortable: true,
        sortValue: (meal) => meal.name,
        sortLabel: 'Refeição Pronta',
        headerClassName: 'w-80 px-3 text-left',
        className: 'w-80 h-table-row-food text-left py-1 px-3 font-bold text-style-body-small text-text-primary',
        cell: (meal) => (
          <div className="grid h-full min-w-0 content-center -mt-1.5">
            <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    className="min-w-0 truncate whitespace-nowrap text-style-body-small font-bold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {meal.name}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-md whitespace-normal">
                  <p className="font-semibold text-style-caption">{meal.name}</p>
                  <p className="text-style-legal text-text-muted mt-1">{meal.itemsPreview}</p>
                </TooltipContent>
              </Tooltip>
              {meal.suggestedTime && (
                <span className="flex items-center gap-0.5 text-style-chart-micro font-medium text-text-muted">
                  <Clock size={11} aria-hidden="true" />
                  <span>{meal.suggestedTime}</span>
                </span>
              )}
            </div>
            <span className={cn(textStyle('metadata'), '-mt-1 truncate whitespace-nowrap text-text-muted')} title={meal.itemsPreview}>
              {meal.itemsPreview}
            </span>
          </div>
        ),
      },
      {
        id: 'itemsCount',
        align: 'center',
        header: 'Itens',
        sortable: true,
        sortValue: (meal) => meal.itemsCount,
        sortLabel: 'Itens',
        headerClassName: 'w-24 px-3 text-center',
        className: 'w-24 text-center py-2 px-3 text-style-legal',
        cell: (meal) => (
          <Badge variant="neutral" className="text-style-chart-micro font-bold">
            {meal.itemsCount} {meal.itemsCount === 1 ? 'item' : 'itens'}
          </Badge>
        ),
      },
      {
        id: 'protein',
        align: 'center',
        header: <span className="text-macro-protein">Proteína</span>,
        sortable: true,
        sortValue: (meal) => meal.proteinG,
        sortLabel: 'Proteína',
        headerClassName: 'w-32 px-3 text-center text-macro-protein',
        className: 'w-32 text-center font-bold text-macro-protein tabular-nums py-2 px-3 text-style-legal',
        cell: (meal) => `${meal.proteinG}g`,
      },
      {
        id: 'carbs',
        align: 'center',
        header: <span className="text-macro-carbohydrate">Carboidrato</span>,
        sortable: true,
        sortValue: (meal) => meal.carbsG,
        sortLabel: 'Carboidrato',
        headerClassName: 'w-32 px-3 text-center text-macro-carbohydrate',
        className: 'w-32 text-center font-bold text-macro-carbohydrate tabular-nums py-2 px-3 text-style-legal',
        cell: (meal) => `${meal.carbsG}g`,
      },
      {
        id: 'fats',
        align: 'center',
        header: <span className="text-macro-fat">Gorduras</span>,
        sortable: true,
        sortValue: (meal) => meal.fatsG,
        sortLabel: 'Gorduras',
        headerClassName: 'w-32 px-3 text-center text-macro-fat',
        className: 'w-32 text-center font-bold text-macro-fat tabular-nums py-2 px-3 text-style-legal',
        cell: (meal) => `${meal.fatsG}g`,
      },
      {
        id: 'kcal',
        align: 'center',
        header: 'Calorias',
        sortable: true,
        sortValue: (meal) => meal.kcal,
        sortLabel: 'Calorias',
        headerClassName: 'w-32 px-3 text-center',
        className: 'w-32 text-center font-bold text-text-primary tabular-nums py-2 px-3 text-style-legal',
        cell: (meal) => (
          <>
            {meal.kcal} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
          </>
        ),
      },
    ],
    []
  );

  if (searchResults.length === 0) {
    return (
      <div className="flex-1 min-h-table-modal max-h-table-modal flex flex-col items-center justify-center p-8 text-center text-text-muted gap-2 border border-dashed border-border-divider rounded-control my-2 bg-surface-subtle">
        <div className="w-10 h-10 rounded-surface bg-surface border border-border-subtle flex items-center justify-center text-text-muted mb-1">
          <UtensilsCrossed size={20} />
        </div>
        <span className="font-semibold text-text-secondary">Nenhuma refeição pronta encontrada</span>
        <span className="text-style-caption max-w-sm">
          {query
            ? `Nenhuma refeição pronta corresponde a "${query}".`
            : 'Você ainda não cadastrou nenhum bloco de refeição pronta. Cadastre blocos na página "Refeições Prontas" para reutilizá-los aqui.'}
        </span>
      </div>
    );
  }

  return (
    <div className="my-2 flex-1 min-h-table-modal max-h-table-modal flex flex-col bg-surface overflow-hidden">
      <TooltipProvider delayDuration={200}>
        <DataTable
          data={searchResults}
          columns={columns}
          getRowId={(meal) => meal.id}
          caption="Lista de blocos de refeições prontas reutilizáveis"
          emptyMessage="Nenhuma refeição pronta encontrada."
          sort={sort}
          selection={{
            mode,
            selectedRowIds: selectedMealIds,
            onSelectionChange: (nextSet) => {
              if (mode === 'single') {
                const selectedId = Array.from(nextSet)[0];
                const found = searchResults.find((m) => m.id === selectedId) || null;
                if (found) {
                  onToggleMeal(found);
                } else {
                  const previous = searchResults.find((m) => selectedMealIds.has(m.id));
                  if (previous) onToggleMeal(previous);
                }
              } else {
                const changedMeals = searchResults.filter((m) => selectedMealIds.has(m.id) !== nextSet.has(m.id));
                if (onToggleAll && changedMeals.length === searchResults.length) {
                  onToggleAll();
                } else {
                  changedMeals.forEach((meal) => onToggleMeal(meal));
                }
              }
            },
            selectOnRowClick: true,
            selectAllAriaLabel: 'Selecionar todas as refeições visíveis',
            selectRowAriaLabel: (meal) => `Selecionar ${meal.name}`,
          }}
          stickyHeader
          maxHeight="table-modal"
          virtualization={{ overscan: 8 }}
          tableClassName="table-fixed w-max min-w-full"
          className="flex-1 min-h-0"
        />
      </TooltipProvider>
    </div>
  );
}
