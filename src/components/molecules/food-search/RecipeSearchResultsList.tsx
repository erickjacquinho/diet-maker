'use client';

import React, { useMemo } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { DataTable, type DataTableColumnDef, type DataTableProps } from '@/components/molecules/DataTable';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { textStyle } from '@/design-system';
import { type Recipe, calculateRecipeNutrients } from '@/lib/recipesStore';
import { cn } from '@/lib/utils';

export interface RecipeSearchResultsListProps {
  searchResults: Recipe[];
  selectedRecipeIds: Set<string>;
  query: string;
  categoryFilter?: string;
  onToggleRecipe: (recipe: Recipe) => void;
  onToggleAll?: () => void;
  sort?: DataTableProps<Recipe>['sort'];
  mode?: 'single' | 'multi';
}

export function RecipeSearchResultsList({
  searchResults,
  selectedRecipeIds,
  query,
  categoryFilter = 'Todas',
  onToggleRecipe,
  onToggleAll,
  sort,
  mode = 'multi',
}: RecipeSearchResultsListProps) {
  // Pre-calculate nutrients per portion for all recipes in searchResults
  const nutrientsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateRecipeNutrients>>();
    searchResults.forEach((r) => {
      map.set(r.id, calculateRecipeNutrients(r.ingredients, r.servings));
    });
    return map;
  }, [searchResults]);

  const columns: DataTableColumnDef<Recipe>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Receita Culinária',
        sortable: true,
        sortValue: (recipe) => recipe.name,
        sortLabel: 'Receita Culinária',
        headerClassName: 'w-80 px-3 text-left',
        className: 'w-80 h-table-row-food text-left py-1 px-3 font-bold text-style-body-small text-text-primary',
        cell: (recipe) => {
          const ingredientsPreview = recipe.ingredients.map((i) => i.name).join(', ');
          return (
            <div className="grid h-full min-w-0 content-center -mt-1.5">
              <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span
                      tabIndex={0}
                      className="min-w-0 truncate whitespace-nowrap text-style-body-small font-bold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {recipe.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-md whitespace-normal">
                    <p className="font-semibold text-style-caption">{recipe.name}</p>
                    <p className="text-style-legal text-text-muted mt-1">Ingredientes: {ingredientsPreview}</p>
                    {recipe.instructions && (
                      <p className="text-style-legal text-text-muted mt-1 italic">&quot;{recipe.instructions}&quot;</p>
                    )}
                  </TooltipContent>
                </Tooltip>
                <span className="flex items-center gap-0.5 text-style-chart-micro font-medium text-text-muted">
                  <Users size={11} aria-hidden="true" />
                  <span>{recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}</span>
                </span>
              </div>
              <span className={cn(textStyle('metadata'), '-mt-1 truncate whitespace-nowrap text-text-muted')}>
                {recipe.category} · {recipe.ingredients.length} {recipe.ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'category',
        align: 'center',
        header: 'Categoria',
        sortable: true,
        sortValue: (recipe) => recipe.category,
        sortLabel: 'Categoria',
        headerClassName: 'w-32 px-3 text-center',
        className: 'w-32 text-center py-2 px-3 text-style-legal',
        cell: (recipe) => (
          <Badge variant="outline" className="text-style-chart-micro font-bold bg-surface-subtle border-border-subtle text-text-secondary">
            {recipe.category}
          </Badge>
        ),
      },
      {
        id: 'protein',
        align: 'center',
        header: <span className="text-macro-protein">Prot / porção</span>,
        sortable: true,
        sortValue: (recipe) => nutrientsMap.get(recipe.id)?.portionProteinG ?? 0,
        sortLabel: 'Proteína por porção',
        headerClassName: 'w-32 px-3 text-center text-macro-protein',
        className: 'w-32 text-center font-bold text-macro-protein tabular-nums py-2 px-3 text-style-legal',
        cell: (recipe) => {
          const nutrients = nutrientsMap.get(recipe.id);
          return `${nutrients?.portionProteinG ?? 0}g`;
        },
      },
      {
        id: 'carbs',
        align: 'center',
        header: <span className="text-macro-carbohydrate">Carb / porção</span>,
        sortable: true,
        sortValue: (recipe) => nutrientsMap.get(recipe.id)?.portionCarbsG ?? 0,
        sortLabel: 'Carboidrato por porção',
        headerClassName: 'w-32 px-3 text-center text-macro-carbohydrate',
        className: 'w-32 text-center font-bold text-macro-carbohydrate tabular-nums py-2 px-3 text-style-legal',
        cell: (recipe) => {
          const nutrients = nutrientsMap.get(recipe.id);
          return `${nutrients?.portionCarbsG ?? 0}g`;
        },
      },
      {
        id: 'fats',
        align: 'center',
        header: <span className="text-macro-fat">Gord / porção</span>,
        sortable: true,
        sortValue: (recipe) => nutrientsMap.get(recipe.id)?.portionFatsG ?? 0,
        sortLabel: 'Gorduras por porção',
        headerClassName: 'w-32 px-3 text-center text-macro-fat',
        className: 'w-32 text-center font-bold text-macro-fat tabular-nums py-2 px-3 text-style-legal',
        cell: (recipe) => {
          const nutrients = nutrientsMap.get(recipe.id);
          return `${nutrients?.portionFatsG ?? 0}g`;
        },
      },
      {
        id: 'kcal',
        align: 'center',
        header: 'Kcal / porção',
        sortable: true,
        sortValue: (recipe) => nutrientsMap.get(recipe.id)?.portionKcal ?? 0,
        sortLabel: 'Calorias por porção',
        headerClassName: 'w-32 px-3 text-center',
        className: 'w-32 text-center font-bold text-text-primary tabular-nums py-2 px-3 text-style-legal',
        cell: (recipe) => {
          const nutrients = nutrientsMap.get(recipe.id);
          return (
            <>
              {nutrients?.portionKcal ?? 0} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
            </>
          );
        },
      },
    ],
    [nutrientsMap]
  );

  if (searchResults.length === 0) {
    return (
      <div className="flex-1 min-h-table-modal max-h-table-modal flex flex-col items-center justify-center p-8 text-center text-text-muted gap-2 border border-dashed border-border-divider rounded-control my-2 bg-surface-subtle">
        <div className="w-10 h-10 rounded-surface bg-surface border border-border-subtle flex items-center justify-center text-text-muted mb-1">
          <BookOpen size={20} />
        </div>
        <span className="font-semibold text-text-secondary">Nenhuma receita culinária encontrada</span>
        <span className="text-style-caption max-w-sm">
          {query || categoryFilter !== 'Todas'
            ? `Nenhuma receita corresponde aos filtros selecionados.`
            : 'Você ainda não cadastrou nenhuma receita culinária. Cadastre receitas na página "Receitas" para reutilizá-las aqui por porção.'}
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
          getRowId={(recipe) => recipe.id}
          caption="Lista de receitas culinárias calculadas por porção"
          emptyMessage="Nenhuma receita encontrada."
          sort={sort}
          selection={{
            mode,
            selectedRowIds: selectedRecipeIds,
            onSelectionChange: (nextSet) => {
              if (mode === 'single') {
                const selectedId = Array.from(nextSet)[0];
                const found = searchResults.find((r) => r.id === selectedId) || null;
                if (found) {
                  onToggleRecipe(found);
                } else {
                  const previous = searchResults.find((r) => selectedRecipeIds.has(r.id));
                  if (previous) onToggleRecipe(previous);
                }
              } else {
                const changedRecipes = searchResults.filter((r) => selectedRecipeIds.has(r.id) !== nextSet.has(r.id));
                if (onToggleAll && changedRecipes.length === searchResults.length) {
                  onToggleAll();
                } else {
                  changedRecipes.forEach((recipe) => onToggleRecipe(recipe));
                }
              }
            },
            selectOnRowClick: true,
            selectAllAriaLabel: 'Selecionar todas as receitas visíveis',
            selectRowAriaLabel: (recipe) => `Selecionar ${recipe.name}`,
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
