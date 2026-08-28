'use client';

import React from 'react';
import { Utensils, UtensilsCrossed, BookOpen } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FoodSearchCategory = 'foods' | 'meals' | 'recipes';

export interface FoodSearchCategorySelectorProps {
  activeCategory: FoodSearchCategory;
  onCategoryChange: (category: FoodSearchCategory) => void;
  counts?: {
    foods?: number;
    meals?: number;
    recipes?: number;
  };
  className?: string;
}

export const FoodSearchCategorySelector: React.FC<FoodSearchCategorySelectorProps> = ({
  activeCategory,
  onCategoryChange,
  counts,
  className,
}) => {
  return (
    <div
      role="group"
      aria-label="Seletor de fonte de itens para a refeição"
      className={cn('flex items-center', className)}
    >
      <ToggleGroup
        type="single"
        role="tablist"
        value={activeCategory}
        onValueChange={(value) => {
          if (value) onCategoryChange(value as FoodSearchCategory);
        }}
        aria-label="Categorias de busca"
        className="w-full justify-start bg-surface-subtle border-border-subtle p-1"
      >
        <ToggleGroupItem
          value="foods"
          role="tab"
          data-state={activeCategory === 'foods' ? 'active' : 'inactive'}
          aria-selected={activeCategory === 'foods'}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-style-legal font-medium transition-all duration-standard',
            activeCategory === 'foods'
              ? 'bg-surface text-text-primary shadow-subtle border-border-subtle font-bold'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Utensils size={15} aria-hidden="true" className={activeCategory === 'foods' ? 'text-success' : 'text-text-muted'} />
          <span>Alimentos</span>
          {typeof counts?.foods === 'number' && (
            <Badge
              variant="neutral"
              className={cn(
                'ml-1 px-1.5 py-0 text-style-chart-micro font-semibold pointer-events-none',
                activeCategory === 'foods'
                  ? 'bg-success-soft text-text-primary border-border-divider'
                  : 'bg-surface text-text-muted border-border-subtle'
              )}
            >
              {counts.foods}
            </Badge>
          )}
        </ToggleGroupItem>

        <ToggleGroupItem
          value="meals"
          role="tab"
          data-state={activeCategory === 'meals' ? 'active' : 'inactive'}
          aria-selected={activeCategory === 'meals'}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-style-legal font-medium transition-all duration-standard',
            activeCategory === 'meals'
              ? 'bg-surface text-text-primary shadow-subtle border-border-subtle font-bold'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <UtensilsCrossed size={15} aria-hidden="true" className={activeCategory === 'meals' ? 'text-primary' : 'text-text-muted'} />
          <span>Refeições Prontas</span>
          {typeof counts?.meals === 'number' && (
            <Badge
              variant="neutral"
              className={cn(
                'ml-1 px-1.5 py-0 text-style-chart-micro font-semibold pointer-events-none',
                activeCategory === 'meals'
                  ? 'bg-primary-soft text-text-primary border-border-divider'
                  : 'bg-surface text-text-muted border-border-subtle'
              )}
            >
              {counts.meals}
            </Badge>
          )}
        </ToggleGroupItem>

        <ToggleGroupItem
          value="recipes"
          role="tab"
          data-state={activeCategory === 'recipes' ? 'active' : 'inactive'}
          aria-selected={activeCategory === 'recipes'}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-style-legal font-medium transition-all duration-standard',
            activeCategory === 'recipes'
              ? 'bg-surface text-text-primary shadow-subtle border-border-subtle font-bold'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <BookOpen size={15} aria-hidden="true" className={activeCategory === 'recipes' ? 'text-macro-carbohydrate' : 'text-text-muted'} />
          <span>Receitas</span>
          {typeof counts?.recipes === 'number' && (
            <Badge
              variant="neutral"
              className={cn(
                'ml-1 px-1.5 py-0 text-style-chart-micro font-semibold pointer-events-none',
                activeCategory === 'recipes'
                  ? 'bg-warning-soft text-text-primary border-border-divider'
                  : 'bg-surface text-text-muted border-border-subtle'
              )}
            >
              {counts.recipes}
            </Badge>
          )}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
