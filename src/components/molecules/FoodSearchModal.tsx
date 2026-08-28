'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Utensils, X, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectField } from '@/components/atoms';
import { searchTacoFoods, getAllFoods, toggleFavoriteFood, type FoodItem } from '@/lib/tacoStore';
import type { DataTableSortState } from '@/components/molecules/DataTable';
import { MacroSummary } from './MacroSummary';
import { FoodSearchResultsList } from './food-search/FoodSearchResultsList';

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

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  mealTitle = 'Refeição',
  onAddFood,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');
  const [favoriteVersion, setFavoriteVersion] = useState(0);
  const [sortState, setSortState] = useState<DataTableSortState | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedFoodIds(new Set());
      setOnlyFavorites(false);
      setFoodTypeFilter('all');
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

  // A TACO inteira é lida uma vez por abertura. Digitar no campo só filtra o pool já carregado.
  const allFoods = useMemo(() => getAllFoods(), [isOpen, favoriteVersion]);
  const foodTypeOptions = useMemo(() => {
    const categories = Array.from(new Set(allFoods.map((food) => food.category || 'Geral')))
      .sort((first, second) => first.localeCompare(second, 'pt-BR'));

    return [
      { value: 'all', label: 'Todos os tipos' },
      ...categories.map((category) => ({ value: category, label: category })),
    ];
  }, [allFoods]);

  const searchResults = useMemo(() => {
    const searched = query.trim() ? searchTacoFoods(query, allFoods) : allFoods;
    const favoriteFiltered = onlyFavorites ? searched.filter((food) => food.isFavorite) : searched;

    return foodTypeFilter === 'all'
      ? favoriteFiltered
      : favoriteFiltered.filter((food) => (food.category || 'Geral') === foodTypeFilter);
  }, [allFoods, foodTypeFilter, onlyFavorites, query]);

  const selectedFoods = useMemo(
    () => allFoods.filter((food) => selectedFoodIds.has(food.id)),
    [allFoods, selectedFoodIds]
  );

  const handleToggleFood = (food: FoodItem) => {
    setSelectedFoodIds((current) => {
      const next = new Set(current);
      if (next.has(food.id)) next.delete(food.id);
      else next.add(food.id);
      return next;
    });
  };

  const handleToggleAll = () => {
    setSelectedFoodIds((current) => {
      const next = new Set(current);
      const allSelected = searchResults.length > 0 && searchResults.every((food) => next.has(food.id));
      searchResults.forEach((food) => (allSelected ? next.delete(food.id) : next.add(food.id)));
      return next;
    });
  };

  const handleToggleFavorite = (foodId: string) => {
    toggleFavoriteFood(foodId);
    setFavoriteVersion((version) => version + 1);
  };

  const handleAddSelectedFoods = () => {
    if (!selectedFoods.length) return;
    const payload = selectedFoods.map((food) => ({
      foodId: food.id,
      name: `${food.name}${food.preparo && food.preparo !== 'inNatura' ? ` (${food.preparo})` : ''}`,
      quantityGrams: 100,
      protein: food.proteinG,
      carbs: food.carbsG,
      fats: food.fatG ?? food.fatsG,
      kcal: food.kcal,
    }));
    onAddFood(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-dialog flex flex-col">
        <DialogHeader className="border-b border-border-subtle pb-3 shrink-0">
          <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
            <Utensils size={18} className="text-success" />
            <span>Adicionar Alimentos em &quot;{mealTitle}&quot;</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted">
            Selecione um ou mais alimentos da base TACO e adicione-os à refeição em uma única confirmação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 pt-3 shrink-0">
          <label htmlFor="food-search-input" className="sr-only">Buscar por nome do alimento</label>
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              id="food-search-input"
              type="search"
              placeholder="Buscar por nome do alimento..."
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
          <Button
            type="button"
            variant="quiet"
            size="standard"
            iconOnly
            role="switch"
            aria-checked={onlyFavorites}
            aria-label="Filtrar favoritos"
            title="Filtrar favoritos"
            onClick={() => setOnlyFavorites((current) => !current)}
            className={onlyFavorites
              ? 'group border-transparent bg-warning-pressed text-on-warning hover:border-transparent hover:bg-warning-pressed hover:text-on-warning'
              : 'group border border-border-control bg-surface text-text-secondary hover:border-transparent hover:bg-warning hover:text-on-warning'}
          >
            <Star size={16} aria-hidden="true" className={onlyFavorites ? 'fill-current text-on-warning' : 'text-text-muted group-hover:fill-current group-hover:text-on-warning'} />
          </Button>
        </div>

        <div className="flex items-end gap-2 pt-2 shrink-0">
          <SelectField
            id="food-type-filter"
            label="Tipo de alimento"
            value={foodTypeFilter}
            onValueChange={setFoodTypeFilter}
            placeholder="Todos os tipos"
            options={foodTypeOptions}
            layer="modal"
            className="w-64"
            triggerClassName="bg-surface"
          />
        </div>

        <FoodSearchResultsList
          searchResults={searchResults}
          selectedFoodIds={selectedFoodIds}
          query={query}
          onlyFavorites={onlyFavorites}
          onToggleFood={handleToggleFood}
          onToggleAll={handleToggleAll}
          onToggleFavorite={handleToggleFavorite}
          sort={{ state: sortState, onChange: setSortState }}
        />

        <div className="flex items-center justify-between gap-3 border-t border-border-divider pt-3 shrink-0">
          <div className="flex items-center gap-2 text-style-legal text-text-secondary" aria-live="polite">
            {selectedFoods.length > 0 ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="primary"
                      tabIndex={0}
                      className="cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {selectedFoods.length} {selectedFoods.length === 1 ? 'alimento selecionado' : 'alimentos selecionados'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-md whitespace-normal p-3">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-3 border-b border-border-divider pb-2">
                        <p className="text-style-caption font-semibold text-text-primary">Alimentos selecionados</p>
                        <p className="shrink-0 text-style-chart-micro font-medium text-text-muted">Macros por 100 g</p>
                      </div>
                      <ul className="space-y-1 pt-1">
                        {selectedFoods.map((food) => (
                          <li key={food.id} className="flex min-w-0 items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-1">
                              <span className="min-w-0 truncate text-style-legal font-semibold text-text-primary" title={food.name}>{food.name}</span>
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
              'Nenhum alimento selecionado'
            )}
            {selectedFoods.length > 0 && (
              <Button type="button" variant="quiet" size="compact" onClick={() => setSelectedFoodIds(new Set())} className="inline-flex items-center gap-1 text-primary hover:underline" aria-label="Limpar seleção">
                <X size={13} aria-hidden="true" /> Limpar seleção
              </Button>
            )}
          </div>
          <Button type="button" variant="primary" disabled={!selectedFoods.length} onClick={handleAddSelectedFoods}>
            <Plus size={14} aria-hidden="true" />
            <span className="sr-only">Adicionar à Refeição</span>
            <span>Adicionar ({selectedFoods.length})</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
