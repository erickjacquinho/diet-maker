'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Utensils, UtensilsCrossed, BookOpen, X, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectField } from '@/components/atoms';
import { searchTacoFoods, getAllFoods, toggleFavoriteFood, type FoodItem } from '@/lib/tacoStore';
import { getReadyMealsFromStorage, type ReadyMeal } from '@/lib/readyMealsStore';
import { getRecipesFromStorage, calculateRecipeNutrients, type Recipe } from '@/lib/recipesStore';
import type { DataTableSortState } from '@/components/molecules/DataTable';
import { MacroSummary } from './MacroSummary';
import { FoodSearchCategorySelector, type FoodSearchCategory } from './food-search/FoodSearchCategorySelector';
import { FoodSearchResultsList } from './food-search/FoodSearchResultsList';
import { ReadyMealSearchResultsList } from './food-search/ReadyMealSearchResultsList';
import { RecipeSearchResultsList } from './food-search/RecipeSearchResultsList';

export type { FoodSearchCategory };

type FoodAddPayload = {
  foodId?: string;
  name: string;
  quantityGrams: number;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
};

export interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealTitle?: string;
  onAddFood: (foodItem: FoodAddPayload | FoodAddPayload[]) => void;
}

const RECIPE_CATEGORIES = [
  'Todas',
  'Café da Manhã',
  'Almoço & Jantar',
  'Lanches & Snacks',
  'Sobremesas Fit',
  'Bebidas & Shakes',
];

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  mealTitle = 'Refeição',
  onAddFood,
}) => {
  const [activeCategory, setActiveCategory] = useState<FoodSearchCategory>('foods');
  const [query, setQuery] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [selectedMealIds, setSelectedMealIds] = useState<Set<string>>(new Set());
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState('Todas');
  const [favoriteVersion, setFavoriteVersion] = useState(0);
  const [sortState, setSortState] = useState<DataTableSortState | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveCategory('foods');
      setQuery('');
      setSelectedFoodIds(new Set());
      setSelectedMealIds(new Set());
      setSelectedRecipeIds(new Set());
      setOnlyFavorites(false);
      setFoodTypeFilter('all');
      setRecipeCategoryFilter('Todas');
      setSortState(null);
    }
  }, [isOpen]);

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

  // Carregamento de dados das 3 fontes
  const allFoods = useMemo(() => getAllFoods(), [isOpen, favoriteVersion]);
  const allReadyMeals = useMemo(() => (isOpen ? getReadyMealsFromStorage() : []), [isOpen]);
  const allRecipes = useMemo(() => (isOpen ? getRecipesFromStorage() : []), [isOpen]);

  const foodTypeOptions = useMemo(() => {
    const categories = Array.from(new Set(allFoods.map((food) => food.category || 'Geral')))
      .sort((first, second) => first.localeCompare(second, 'pt-BR'));

    return [
      { value: 'all', label: 'Todos os tipos' },
      ...categories.map((category) => ({ value: category, label: category })),
    ];
  }, [allFoods]);

  const recipeCategoryOptions = useMemo(() => {
    return RECIPE_CATEGORIES.map((category) => ({ value: category, label: category }));
  }, []);

  // Filtros para cada categoria
  const foodSearchResults = useMemo(() => {
    const searched = query.trim() ? searchTacoFoods(query, allFoods) : allFoods;
    const favoriteFiltered = onlyFavorites ? searched.filter((food) => food.isFavorite) : searched;

    return foodTypeFilter === 'all'
      ? favoriteFiltered
      : favoriteFiltered.filter((food) => (food.category || 'Geral') === foodTypeFilter);
  }, [allFoods, foodTypeFilter, onlyFavorites, query]);

  const mealSearchResults = useMemo(() => {
    if (!query.trim()) return allReadyMeals;
    const normalized = query.toLowerCase().trim();
    return allReadyMeals.filter(
      (m) => m.name.toLowerCase().includes(normalized) || m.itemsPreview.toLowerCase().includes(normalized)
    );
  }, [allReadyMeals, query]);

  const recipeSearchResults = useMemo(() => {
    return allRecipes.filter((r) => {
      const matchesSearch =
        !query.trim() ||
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(query.toLowerCase()));

      const matchesCat = recipeCategoryFilter === 'Todas' || r.category === recipeCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [allRecipes, query, recipeCategoryFilter]);

  // Itens selecionados por categoria
  const selectedFoods = useMemo(
    () => allFoods.filter((food) => selectedFoodIds.has(food.id)),
    [allFoods, selectedFoodIds]
  );

  const selectedMeals = useMemo(
    () => allReadyMeals.filter((meal) => selectedMealIds.has(meal.id)),
    [allReadyMeals, selectedMealIds]
  );

  const selectedRecipes = useMemo(
    () => allRecipes.filter((recipe) => selectedRecipeIds.has(recipe.id)),
    [allRecipes, selectedRecipeIds]
  );

  const totalSelectedCount = selectedFoods.length + selectedMeals.length + selectedRecipes.length;

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

  // Handlers para Refeições
  const handleToggleMeal = (meal: ReadyMeal) => {
    setSelectedMealIds((current) => {
      const next = new Set(current);
      if (next.has(meal.id)) next.delete(meal.id);
      else next.add(meal.id);
      return next;
    });
  };

  const handleToggleAllMeals = () => {
    setSelectedMealIds((current) => {
      const next = new Set(current);
      const allSelected = mealSearchResults.length > 0 && mealSearchResults.every((meal) => next.has(meal.id));
      mealSearchResults.forEach((meal) => (allSelected ? next.delete(meal.id) : next.add(meal.id)));
      return next;
    });
  };

  // Handlers para Receitas
  const handleToggleRecipe = (recipe: Recipe) => {
    setSelectedRecipeIds((current) => {
      const next = new Set(current);
      if (next.has(recipe.id)) next.delete(recipe.id);
      else next.add(recipe.id);
      return next;
    });
  };

  const handleToggleAllRecipes = () => {
    setSelectedRecipeIds((current) => {
      const next = new Set(current);
      const allSelected = recipeSearchResults.length > 0 && recipeSearchResults.every((recipe) => next.has(recipe.id));
      recipeSearchResults.forEach((recipe) => (allSelected ? next.delete(recipe.id) : next.add(recipe.id)));
      return next;
    });
  };

  const handleClearAllSelections = () => {
    setSelectedFoodIds(new Set());
    setSelectedMealIds(new Set());
    setSelectedRecipeIds(new Set());
  };

  const handleAddSelectedItems = () => {
    if (totalSelectedCount === 0) return;

    const payload: FoodAddPayload[] = [];

    // Adiciona alimentos
    selectedFoods.forEach((food) => {
      payload.push({
        foodId: food.id,
        name: `${food.name}${food.preparo && food.preparo !== 'inNatura' ? ` (${food.preparo})` : ''}`,
        quantityGrams: 100,
        protein: food.proteinG,
        carbs: food.carbsG,
        fats: food.fatG ?? food.fatsG,
        kcal: food.kcal,
      });
    });

    // Adiciona blocos de refeições prontas
    selectedMeals.forEach((meal) => {
      payload.push({
        foodId: meal.id,
        name: meal.name,
        quantityGrams: 100,
        protein: meal.proteinG,
        carbs: meal.carbsG,
        fats: meal.fatsG,
        kcal: meal.kcal,
      });
    });

    // Adiciona receitas culinárias (porção)
    selectedRecipes.forEach((recipe) => {
      const nutrients = calculateRecipeNutrients(recipe.ingredients, recipe.servings);
      payload.push({
        foodId: recipe.id,
        name: `${recipe.name} (1 porção)`,
        quantityGrams: 100,
        protein: nutrients.portionProteinG,
        carbs: nutrients.portionCarbsG,
        fats: nutrients.portionFatsG,
        kcal: nutrients.portionKcal,
      });
    });

    onAddFood(payload);
    onClose();
  };

  const searchPlaceholder = useMemo(() => {
    switch (activeCategory) {
      case 'foods':
        return 'Buscar por nome do alimento...';
      case 'meals':
        return 'Buscar refeição pronta por nome ou ingrediente...';
      case 'recipes':
        return 'Buscar receita culinária por nome ou ingrediente...';
      default:
        return 'Buscar...';
    }
  }, [activeCategory]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] max-h-[85vh] min-h-[620px] flex flex-col">
        <DialogHeader className="border-b border-border-subtle pb-3 shrink-0">
          <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
            <Utensils size={18} className="text-success" />
            <span>Adicionar à Refeição &quot;{mealTitle}&quot;</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted">
            Selecione alimentos da tabela TACO, blocos de refeições prontas ou receitas culinárias para incluir na refeição.
          </DialogDescription>
        </DialogHeader>

        {/* Linha 1: Tabs / Button Group de Mudança de Tabela (Shadcn ToggleGroup) */}
        <div className="pt-3 shrink-0">
          <FoodSearchCategorySelector
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={{
              foods: allFoods.length,
              meals: allReadyMeals.length,
              recipes: allRecipes.length,
            }}
          />
        </div>

        {/* Linha 2: Barra de Busca + Dropdown de Tipos ao lado da Search Bar + Botão de Favoritos */}
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

          {activeCategory === 'recipes' && (
            <div className="w-56 shrink-0">
              <SelectField
                id="recipe-category-filter"
                value={recipeCategoryFilter}
                onValueChange={setRecipeCategoryFilter}
                placeholder="Todas as categorias"
                options={recipeCategoryOptions}
                layer="modal"
                triggerClassName="bg-surface"
                aria-label="Categoria da receita"
              />
            </div>
          )}

          {/* Botão de favoritos sempre visível */}
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
        </div>

        {/* Conteúdo da Tabela por Categoria Ativa (Preenchendo flex-1 com tamanho fixo estável) */}
        <div className="flex-1 min-h-0 flex flex-col pt-1">
          {activeCategory === 'foods' && (
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
          )}

          {activeCategory === 'meals' && (
            <ReadyMealSearchResultsList
              searchResults={mealSearchResults}
              selectedMealIds={selectedMealIds}
              query={query}
              onToggleMeal={handleToggleMeal}
              onToggleAll={handleToggleAllMeals}
              sort={{ state: sortState, onChange: setSortState }}
            />
          )}

          {activeCategory === 'recipes' && (
            <RecipeSearchResultsList
              searchResults={recipeSearchResults}
              selectedRecipeIds={selectedRecipeIds}
              query={query}
              categoryFilter={recipeCategoryFilter}
              onToggleRecipe={handleToggleRecipe}
              onToggleAll={handleToggleAllRecipes}
              sort={{ state: sortState, onChange: setSortState }}
            />
          )}
        </div>

        {/* Rodapé / Sumário de Seleção e Ação */}
        <div className="flex items-center justify-between gap-3 border-t border-border-divider pt-3 shrink-0">
          <div className="flex items-center gap-2 text-style-legal text-text-secondary" aria-live="polite">
            {totalSelectedCount > 0 ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="primary"
                      tabIndex={0}
                      className="cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {totalSelectedCount} {totalSelectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-md whitespace-normal p-3">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-3 border-b border-border-divider pb-2">
                        <p className="text-style-caption font-semibold text-text-primary">Itens selecionados</p>
                        <p className="shrink-0 text-style-chart-micro font-medium text-text-muted">Macros calculados</p>
                      </div>
                      <ul className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
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

                        {selectedMeals.map((meal) => (
                          <li key={`meal-${meal.id}`} className="flex min-w-0 items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-1">
                              <Badge variant="outline" className="text-style-chart-micro px-1 py-0 font-medium">Refeição</Badge>
                              <span className="min-w-0 truncate text-style-legal font-semibold text-text-primary" title={meal.name}>
                                {meal.name}
                              </span>
                            </div>
                            <MacroSummary
                              protein={meal.proteinG}
                              carbs={meal.carbsG}
                              fats={meal.fatsG}
                              kcal={meal.kcal}
                              data-testid={`selected-meal-macros-${meal.id}`}
                              className="shrink-0 text-style-chart-micro"
                            />
                          </li>
                        ))}

                        {selectedRecipes.map((recipe) => {
                          const nut = calculateRecipeNutrients(recipe.ingredients, recipe.servings);
                          return (
                            <li key={`recipe-${recipe.id}`} className="flex min-w-0 items-center justify-between gap-2">
                              <div className="flex min-w-0 flex-1 items-center gap-1">
                                <Badge variant="outline" className="text-style-chart-micro px-1 py-0 font-medium">Receita</Badge>
                                <span className="min-w-0 truncate text-style-legal font-semibold text-text-primary" title={recipe.name}>
                                  {recipe.name}
                                </span>
                              </div>
                              <MacroSummary
                                protein={nut.portionProteinG}
                                carbs={nut.portionCarbsG}
                                fats={nut.portionFatsG}
                                kcal={nut.portionKcal}
                                data-testid={`selected-recipe-macros-${recipe.id}`}
                                className="shrink-0 text-style-chart-micro"
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              'Nenhum item selecionado'
            )}
            {totalSelectedCount > 0 && (
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
            disabled={totalSelectedCount === 0}
            onClick={handleAddSelectedItems}
          >
            <Plus size={14} aria-hidden="true" />
            <span className="sr-only">Adicionar à Refeição</span>
            <span>Adicionar ({totalSelectedCount})</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
