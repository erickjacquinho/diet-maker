'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Utensils, X, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectField } from '@/components/atoms';
import type { DataTableSortState } from '@/components/molecules/DataTable';
import { MacroSummary } from '@/components/molecules/MacroSummary';
import { FoodSearchResultsList } from '@/components/molecules/food-search/FoodSearchResultsList';
import { FoodSearchCategorySelector, type FoodSearchCategory } from '@/components/molecules/food-search/FoodSearchCategorySelector';
import { RecipeSearchResultsList } from '@/components/molecules/food-search/RecipeSearchResultsList';
import { ReadyMealSearchResultsList } from '@/components/molecules/food-search/ReadyMealSearchResultsList';
import { createTacoSnapshot } from '@/lib/application/diets/taco-food-adapter';
import type { NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { createLibraryFoodSnapshot, getFavoritesFromStorage, listTacoFoodItems, searchTacoFoods, toggleFavoriteFood, toFoodItem, toReadyMeal, toRecipe, type FoodItem, type ReadyMeal, type Recipe } from '@/lib/library-ui-adapter';

type FoodAddPayload = {
  foodId?: string;
  name: string;
  quantityGrams: number;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
  snapshot?: NutritionSnapshot;
};

export interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealTitle?: string;
  onAddFood: (foodItem: FoodAddPayload | FoodAddPayload[]) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  enableLibrarySources?: boolean;
  onAddRecipe?: (recipeId: string) => void | Promise<void>;
  onAddReadyMeal?: (readyMealId: string) => void | Promise<void>;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  mealTitle = 'Refeição',
  onAddFood,
  returnFocusRef,
  enableLibrarySources = false,
  onAddRecipe,
  onAddReadyMeal,
}) => {
  const showLibrarySources = enableLibrarySources && Boolean(onAddRecipe || onAddReadyMeal);
  const [query, setQuery] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');
  const [favoriteVersion, setFavoriteVersion] = useState(0);
  const [sortState, setSortState] = useState<DataTableSortState | null>(null);
  const [activeCategory, setActiveCategory] = useState<FoodSearchCategory>('foods');
  const [libraryFoods, setLibraryFoods] = useState<FoodItem[]>([]);
  const [libraryRecipes, setLibraryRecipes] = useState<Recipe[]>([]);
  const [libraryReadyMeals, setLibraryReadyMeals] = useState<ReadyMeal[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [selectedReadyMealIds, setSelectedReadyMealIds] = useState<Set<string>>(new Set());
  const [isSubmittingLibraryItem, setIsSubmittingLibraryItem] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedFoodIds(new Set());
      setOnlyFavorites(false);
      setFoodTypeFilter('all');
      setSortState(null);
      setActiveCategory('foods');
      setSelectedRecipeIds(new Set());
      setSelectedReadyMealIds(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !enableLibrarySources) return;
    let cancelled = false;
    setIsLibraryLoading(true);
    void getBrowserLibraryApplication().then(async (application) => {
      const [customFoods, recipes, readyMeals] = await Promise.all([
        application.listCustomFoods(),
        application.listRecipes(),
        application.listReadyMeals(),
      ]);
      if (cancelled) return;
      setLibraryFoods([...listTacoFoodItems(), ...customFoods.map(toFoodItem)]);
      setLibraryRecipes(recipes.map(toRecipe));
      setLibraryReadyMeals(readyMeals.map(toReadyMeal));
      setLibraryError(null);
    }).catch((error: unknown) => {
      if (!cancelled) setLibraryError(error instanceof Error ? error.message : 'A biblioteca não pôde ser carregada.');
    }).finally(() => {
      if (!cancelled) setIsLibraryLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [enableLibrarySources, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isOpen]);

  // O modo legado aceita exclusivamente registros da tabela TACO; o editor pode habilitar a biblioteca explicitamente.
  const allFoods = useMemo<FoodItem[]>(() => {
    if (enableLibrarySources) {
      const favoriteIds = new Set(getFavoritesFromStorage());
      return libraryFoods.map((food) => ({ ...food, isFavorite: favoriteIds.has(food.id) }));
    }
    return listTacoFoodItems();
  }, [enableLibrarySources, isOpen, libraryFoods, favoriteVersion]);

  const foodTypeOptions = useMemo(() => {
    const categories = Array.from(new Set(allFoods.map((food) => food.category || 'Geral')))
      .sort((first, second) => first.localeCompare(second, 'pt-BR'));

    return [
      { value: 'all', label: 'Todos os tipos' },
      ...categories.map((category) => ({ value: category, label: category })),
    ];
  }, [allFoods]);

  const foodSearchResults = useMemo(() => {
    const searched = query.trim()
      ? searchTacoFoods(query, allFoods)
      : allFoods;
    const favoriteFiltered = onlyFavorites ? searched.filter((food) => food.isFavorite) : searched;

    return foodTypeFilter === 'all'
      ? favoriteFiltered
      : favoriteFiltered.filter((food) => (food.category || 'Geral') === foodTypeFilter);
  }, [allFoods, enableLibrarySources, foodTypeFilter, onlyFavorites, query]);

  const recipeSearchResults = useMemo(
    () => libraryRecipes.filter((recipe) => !query.trim() || [recipe.name, recipe.category, recipe.ingredients.map((ingredient) => ingredient.name).join(' ')].join(' ').toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))),
    [libraryRecipes, query],
  );

  const readyMealSearchResults = useMemo(
    () => libraryReadyMeals.filter((meal) => !query.trim() || [meal.name, meal.itemsPreview].join(' ').toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))),
    [libraryReadyMeals, query],
  );

  const selectedFoods = useMemo(
    () => allFoods.filter((food) => selectedFoodIds.has(food.id)),
    [allFoods, selectedFoodIds]
  );

  const totalSelectedCount = selectedFoods.length;

  // Handlers para Alimentos
  const handleToggleFood = (food: FoodItem) => {
    setSelectedFoodIds((current) => {
      const next = new Set(current);
      if (next.has(food.id)) next.delete(food.id);
      else next.add(food.id);
      return next;
    });
  };

  const handleToggleAllFoods = () => {
    setSelectedFoodIds((current) => {
      const next = new Set(current);
      const allSelected = foodSearchResults.length > 0 && foodSearchResults.every((food) => next.has(food.id));
      foodSearchResults.forEach((food) => (allSelected ? next.delete(food.id) : next.add(food.id)));
      return next;
    });
  };

  const handleToggleFavorite = (foodId: string) => {
    toggleFavoriteFood(foodId);
    setFavoriteVersion((version) => version + 1);
  };

  const handleClearAllSelections = () => {
    setSelectedFoodIds(new Set());
  };

  const handleAddSelectedItems = () => {
    if (totalSelectedCount === 0) return;

    const payload: FoodAddPayload[] = [];

    selectedFoods.forEach((food) => {
      payload.push({
        foodId: food.id,
        name: `${food.name}${food.preparo && food.preparo !== 'inNatura' ? ` (${food.preparo})` : ''}`,
        quantityGrams: 100,
        protein: food.proteinG,
        carbs: food.carbsG,
        fats: food.fatG ?? food.fatsG,
        kcal: food.kcal,
        snapshot: enableLibrarySources ? createLibraryFoodSnapshot(food) : createTacoSnapshot(food.id, '100'),
      });
    });

    onAddFood(payload);
    onClose();
  };

  const handleAddSelectedLibraryItem = async () => {
    const selectedRecipeId = Array.from(selectedRecipeIds)[0];
    const selectedReadyMealId = Array.from(selectedReadyMealIds)[0];
    if (activeCategory === 'recipes' && selectedRecipeId && onAddRecipe) {
      setIsSubmittingLibraryItem(true);
      try {
        await onAddRecipe(selectedRecipeId);
        onClose();
      } catch (error: unknown) {
        setLibraryError(error instanceof Error ? error.message : 'A receita não pôde ser inserida no rascunho.');
      } finally {
        setIsSubmittingLibraryItem(false);
      }
    }
    if (activeCategory === 'meals' && selectedReadyMealId && onAddReadyMeal) {
      setIsSubmittingLibraryItem(true);
      try {
        await onAddReadyMeal(selectedReadyMealId);
        onClose();
      } catch (error: unknown) {
        setLibraryError(error instanceof Error ? error.message : 'A refeição pronta não pôde ser inserida no rascunho.');
      } finally {
        setIsSubmittingLibraryItem(false);
      }
    }
  };

  const selectedLibraryCount = activeCategory === 'foods'
    ? totalSelectedCount
    : activeCategory === 'recipes'
      ? selectedRecipeIds.size
      : selectedReadyMealIds.size;
  const selectionLabel = activeCategory === 'foods'
    ? totalSelectedCount === 1 ? 'alimento selecionado' : 'alimentos selecionados'
    : activeCategory === 'recipes' ? 'receita selecionada' : 'refeição pronta selecionada';

  const searchPlaceholder = 'Buscar por nome do alimento...';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-5xl h-[85vh] max-h-[85vh] min-h-[620px] flex flex-col"
        onCloseAutoFocus={(event) => {
          if (!returnFocusRef?.current) return;
          event.preventDefault();
          returnFocusRef.current.focus();
        }}
      >
        <DialogHeader className="border-b border-border-subtle pb-3 shrink-0">
          <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
            <Utensils size={18} className="text-success" />
            <span>Adicionar à Refeição &quot;{mealTitle}&quot;</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted">
            Selecione alimentos da tabela TACO. O snapshot nutricional completo será congelado nesta prescrição.
          </DialogDescription>
        </DialogHeader>

        {showLibrarySources && (
          <FoodSearchCategorySelector
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              setActiveCategory(category);
              setQuery('');
              setSortState(null);
            }}
            counts={{ foods: libraryFoods.length, recipes: libraryRecipes.length, meals: libraryReadyMeals.length }}
          />
        )}

        {/* Busca TACO + filtro de categoria e favoritos */}
        <div className="flex items-center gap-2 pt-2 shrink-0">
          <label htmlFor="food-search-input" className="sr-only">
            {searchPlaceholder}
          </label>
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              id="food-search-input"
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9 pr-20 text-style-field-value"
              autoFocus
            />
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Badge
              variant="neutral"
              title="Atalho Ctrl+F"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 border-border-divider bg-surface-subtle px-2 py-0.5 text-style-chart-micro text-text-muted"
            >
              Ctrl+F
            </Badge>
          </div>

          {activeCategory === 'foods' && (
            <div className="w-56 shrink-0">
              <SelectField
                id="food-type-filter"
                value={foodTypeFilter}
                onValueChange={setFoodTypeFilter}
                placeholder="Todos os tipos"
                options={foodTypeOptions}
                layer="modal"
                triggerClassName="bg-surface"
                aria-label="Tipo de alimento"
              />
            </div>
          )}

          {/* Botão de favoritos sempre visível */}
          {activeCategory === 'foods' && (
            <Button
              type="button"
              variant="quiet"
              size="standard"
              iconOnly
              role="switch"
              aria-checked={onlyFavorites}
              aria-label="Filtrar favoritos"
              title={onlyFavorites ? 'Exibir todos os itens' : 'Filtrar favoritos'}
              onClick={() => setOnlyFavorites((current) => !current)}
              className={onlyFavorites
                ? 'group border-transparent bg-warning-pressed text-on-warning hover:border-transparent hover:bg-warning-pressed hover:text-on-warning'
                : 'group border border-border-control bg-surface text-text-secondary hover:border-transparent hover:bg-warning hover:text-on-warning'}
              >
                <Star size={16} aria-hidden="true" className={onlyFavorites ? 'fill-current text-on-warning' : 'text-text-muted group-hover:fill-current group-hover:text-on-warning'} />
              </Button>
          )}
        </div>

        {/* Conteúdo da tabela TACO (preenchendo flex-1 com tamanho fixo estável) */}
        <div className="flex-1 min-h-0 flex flex-col pt-1">
          {isLibraryLoading && enableLibrarySources ? (
            <div role="status" className="flex-1 min-h-table-modal items-center justify-center text-text-muted">Carregando itens da biblioteca…</div>
          ) : libraryError && enableLibrarySources ? (
            <div role="alert" className="flex-1 min-h-table-modal items-center justify-center text-error">{libraryError}</div>
          ) : activeCategory === 'foods' ? (
            <FoodSearchResultsList
              searchResults={foodSearchResults}
              selectedFoodIds={selectedFoodIds}
              query={query}
              onlyFavorites={onlyFavorites}
              onToggleFood={handleToggleFood}
              onToggleAll={handleToggleAllFoods}
              onToggleFavorite={handleToggleFavorite}
              sort={{ state: sortState, onChange: setSortState }}
            />
          ) : activeCategory === 'recipes' ? (
            <RecipeSearchResultsList
              searchResults={recipeSearchResults}
              selectedRecipeIds={selectedRecipeIds}
              query={query}
              mode="single"
              onToggleRecipe={(recipe) => setSelectedRecipeIds((current) => current.has(recipe.id) ? new Set() : new Set([recipe.id]))}
              sort={{ state: sortState, onChange: setSortState }}
            />
          ) : (
            <ReadyMealSearchResultsList
              searchResults={readyMealSearchResults}
              selectedMealIds={selectedReadyMealIds}
              query={query}
              mode="single"
              onToggleMeal={(meal) => setSelectedReadyMealIds((current) => current.has(meal.id) ? new Set() : new Set([meal.id]))}
              sort={{ state: sortState, onChange: setSortState }}
            />
          )}
        </div>

        {/* Rodapé / Sumário de Seleção e Ação */}
        <div className="flex items-center justify-between gap-3 border-t border-border-divider pt-3 shrink-0">
          <div className="flex items-center gap-2 text-style-legal text-text-secondary" aria-live="polite">
            {selectedLibraryCount > 0 ? activeCategory === 'foods' ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="primary"
                      tabIndex={0}
                      className="cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {selectedLibraryCount}{' '}
                      {selectionLabel}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-md whitespace-normal p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3 border-b border-border-divider pb-2">
                        <p className="text-style-caption font-semibold text-text-primary">
                          Alimentos selecionados
                        </p>
                        <p className="shrink-0 text-style-chart-micro font-medium text-text-muted">
                          Macros por 100 g
                        </p>
                      </div>
                      <ul className="flex flex-col gap-1.5 pt-1 max-h-48 overflow-y-auto">
                        {selectedFoods.map((food) => (
                          <li key={`food-${food.id}`} className="flex min-w-0 items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-1">
                              <span className="min-w-0 truncate text-style-legal font-semibold text-text-primary" title={food.name}>
                                {food.name}
                              </span>
                              {food.isFavorite && (
                                <>
                                  <Star size={12} aria-hidden="true" className="shrink-0 fill-warning text-warning" />
                                  <span className="sr-only">Favorito</span>
                                </>
                              )}
                            </div>
                            <MacroSummary
                              protein={food.proteinG}
                              carbs={food.carbsG}
                              fats={food.fatG ?? food.fatsG}
                              kcal={food.kcal}
                              data-testid={`selected-food-macros-${food.id}`}
                              className="shrink-0 text-style-chart-micro"
                            />
                          </li>
                        ))}

                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Badge variant="primary" tabIndex={0}>{selectedLibraryCount} {selectionLabel}</Badge>
            ) : (
              activeCategory === 'foods' ? 'Nenhum alimento selecionado' : 'Nenhum item selecionado'
            )}
            {selectedLibraryCount > 0 && activeCategory === 'foods' && (
              <Button
                type="button"
                variant="quiet"
                size="compact"
                onClick={handleClearAllSelections}
                className="inline-flex items-center gap-1 text-primary hover:underline"
                aria-label="Limpar seleção"
              >
                <X size={13} aria-hidden="true" /> Limpar seleção
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="primary"
            disabled={selectedLibraryCount === 0 || isSubmittingLibraryItem}
            aria-label={activeCategory === 'foods' ? undefined : 'Inserir na Dieta'}
            onClick={activeCategory === 'foods' ? handleAddSelectedItems : handleAddSelectedLibraryItem}
          >
            <Plus size={14} aria-hidden="true" />
            <span className="sr-only">Adicionar item à Refeição</span>
            <span>{activeCategory === 'foods'
              ? totalSelectedCount > 0 ? 'Adicionar (' + totalSelectedCount + ')' : 'Adicionar à Refeição'
              : 'Inserir na Dieta'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
