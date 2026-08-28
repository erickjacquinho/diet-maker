'use client';

import React, { useState, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button, Badge } from '@/components/atoms';
import { Search, ArrowLeftRight, X, Star } from 'lucide-react';
import { searchTacoFoods, getAllFoods, toggleFavoriteFood, FoodItem } from '@/lib/tacoStore';
import type { DataTableSortState } from '@/components/molecules/DataTable';
import { FoodSearchResultsList } from './food-search/FoodSearchResultsList';
import { cn } from '@/lib/utils';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';

export interface MealFoodToSubstitute {
  mealId: string;
  mealName: string;
  itemId: string;
  foodName: string;
  quantityGrams: number;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
}

export interface SubstituteFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodToSubstitute: MealFoodToSubstitute | null;
  onSubstituteFood: (mealId: string, itemId: string, selectedFood: FoodItem) => void;
}

export const SubstituteFoodModal: React.FC<SubstituteFoodModalProps> = ({
  isOpen,
  onClose,
  foodToSubstitute,
  onSubstituteFood,
}) => {
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortState, setSortState] = useState<DataTableSortState | null>(null);

  const allFoods = useMemo(() => getAllFoods(), [refreshKey]);

  const searchResults = useMemo(() => {
    let list: FoodItem[];
    if (!deferredQuery.trim()) {
      list = onlyFavorites ? allFoods.filter((f) => f.isFavorite) : allFoods;
    } else {
      const results = searchTacoFoods(deferredQuery, allFoods);
      list = onlyFavorites ? results.filter((f) => f.isFavorite) : results;
    }

    return list;
  }, [deferredQuery, allFoods, onlyFavorites]);

  const handleToggleFavorite = useCallback((foodId: string) => {
    toggleFavoriteFood(foodId);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSelectFood = useCallback((food: FoodItem) => {
    setSelectedFood((prev) => (prev?.id === food.id ? null : food));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedFood(null);
    setQuery('');
    setSortState(null);
    onClose();
  }, [onClose]);

  const handleConfirmSubstitute = useCallback(() => {
    if (!foodToSubstitute || !selectedFood) return;
    onSubstituteFood(foodToSubstitute.mealId, foodToSubstitute.itemId, selectedFood);
    handleClose();
  }, [foodToSubstitute, selectedFood, onSubstituteFood, handleClose]);

  const selectedFoodIds = useMemo(() => {
    return selectedFood ? new Set([selectedFood.id]) : new Set<string>();
  }, [selectedFood]);

  const quantityGrams = foodToSubstitute?.quantityGrams || 100;

  useSearchShortcut({ inputRef: searchInputRef, enabled: isOpen });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl max-h-dialog flex flex-col p-6 gap-4">
        <DialogHeader className="border-b border-border-subtle pb-3 shrink-0">
          <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-primary" />
            <span>Substituir Alimento em &quot;{foodToSubstitute?.mealName || 'Refeição'}&quot;</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted">
            Selecione o novo alimento da tabela TACO para substituir &quot;{foodToSubstitute?.foodName}&quot;. A quantidade de{' '}
            <strong className="text-text-primary font-bold">{quantityGrams}g</strong> será preservada e os macros serão recalculados proporcionalmente.
          </DialogDescription>
        </DialogHeader>

        {/* Current Food Context Card */}
        {foodToSubstitute && (
          <div className="bg-surface-subtle border border-border-subtle rounded-control p-3 flex items-center justify-between gap-3 shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-style-chart-micro font-bold tracking-overline text-text-muted">
                Alimento Atual a ser Substituído
              </span>
              <span className="font-bold text-style-body text-text-primary truncate">
                {foodToSubstitute.foodName}
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-style-legal text-text-muted flex-wrap">
                <span>P: <strong className="text-macro-protein">{foodToSubstitute.protein}g</strong></span>
                <span>·</span>
                <span>C: <strong className="text-macro-carbohydrate">{foodToSubstitute.carbs}g</strong></span>
                <span>·</span>
                <span>G: <strong className="text-macro-fat">{foodToSubstitute.fats}g</strong></span>
                <span>·</span>
                <span><strong className="text-text-primary">{foodToSubstitute.kcal} kcal</strong></span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1">
              <Badge variant="primary" className="font-mono text-style-chart-micro">
                {quantityGrams}g preservados
              </Badge>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar alimento substituto na base TACO (ex: Batata doce, Frango, Aveia)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-keyshortcuts="Control+f Meta+f"
              className="pl-9 pr-24 text-style-field-value h-9"
              autoFocus
            />
            <Search size={14} className="absolute left-3 top-2.5 text-text-muted pointer-events-none" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  iconOnly
                  onClick={() => setQuery('')}
                  className="size-8 p-1 text-text-muted hover:text-text-primary"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </Button>
              )}
              <Badge variant="neutral" aria-hidden="true" className="pointer-events-none text-style-chart-micro font-mono">
                Ctrl + F
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="quiet"
            size="compact"
            iconOnly
            role="switch"
            aria-checked={onlyFavorites}
            aria-label={onlyFavorites ? 'Exibindo apenas favoritos' : 'Filtrar apenas favoritos'}
            title={onlyFavorites ? 'Exibindo apenas favoritos (clique para mostrar todos)' : 'Filtrar apenas favoritos'}
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={cn(
              'group size-9 rounded-control border transition-colors duration-fast shrink-0',
              onlyFavorites
                ? 'bg-warning border-warning text-on-warning hover:brightness-95'
                : 'border-input bg-surface text-warning hover:bg-warning hover:border-warning hover:text-on-warning'
            )}
          >
            <Star
              size={16}
              aria-hidden="true"
              className={cn(
                'transition-colors duration-fast',
                onlyFavorites
                  ? 'fill-on-warning text-on-warning'
                  : 'text-warning fill-warning group-hover:text-on-warning group-hover:fill-on-warning'
              )}
            />
          </Button>
        </div>

        {/* Food Search Results Table */}
        <div className="flex-1 min-h-0 flex flex-col">
          <FoodSearchResultsList
            searchResults={searchResults}
            selectedFoodIds={selectedFoodIds}
            query={query}
            onlyFavorites={onlyFavorites}
            onToggleFood={handleSelectFood}
            onToggleFavorite={handleToggleFavorite}
            sort={{ state: sortState, onChange: setSortState }}
            mode="single"
          />
        </div>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t border-border-divider flex flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-style-caption font-semibold text-text-muted">
            {selectedFood ? (
              <span className="text-primary flex items-center gap-1.5 font-bold">
                <span className="size-2 rounded-round bg-primary inline-block" />
                Alimento substituto selecionado
              </span>
            ) : (
              'Selecione um alimento para substituir'
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmSubstitute}
              disabled={!selectedFood}
              className="gap-1.5"
            >
              <ArrowLeftRight size={16} />
              <span>
                {selectedFood
                  ? `Substituir por ${selectedFood.name} (${quantityGrams}g)`
                  : 'Substituir Alimento'}
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
