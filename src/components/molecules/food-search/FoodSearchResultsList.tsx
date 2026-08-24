'use client';

import React from 'react';
import { Badge, Button } from '@/components/atoms';
import { MacroSummary } from '@/components/molecules/MacroSummary';
import { Check } from 'lucide-react';
import { FoodItem } from '@/lib/tacoStore';
import { cn } from '@/lib/utils';

export function FoodSearchResultsList({
  searchResults,
  selectedFood,
  query,
  onSelectFood,
}: {
  searchResults: FoodItem[];
  selectedFood: FoodItem | null;
  query: string;
  onSelectFood: (food: FoodItem) => void;
}) {
  return (
    <div className="my-3 flex min-h-[220px] max-h-[300px] flex-1 flex-col gap-1.5 overflow-y-auto rounded-control border border-border-subtle bg-surface-subtle p-2">
      {searchResults.length === 0 ? (
        <div className="p-8 text-center text-style-legal text-text-muted">
          Nenhum alimento encontrado para "{query}". Tente buscar por termos genéricos como "Frango", "Arroz" ou "Batata".
        </div>
      ) : (
        searchResults.map((food) => {
          const isSelected = selectedFood?.id === food.id;
          return (
            <Button
              key={food.id}
              type="button"
              variant="secondary"
              onClick={() => onSelectFood(food)}
              className={cn(
                'w-full text-left p-3 rounded-control border transition-colors duration-fast flex items-center justify-between h-auto justify-start font-normal',
                isSelected
                  ? 'bg-surface border-success ring-2 ring-success'
                  : 'bg-surface border-border-subtle hover:border-border-hover'
              )}
            >
              <div className="flex flex-col gap-1 flex-1">
                <div className="text-style-legal font-bold text-text-primary flex items-center gap-2">
                  <span>{food.name}</span>
                  <Badge variant="default" className="text-style-chart-micro font-semibold">
                    {food.category}
                  </Badge>
                </div>
                <MacroSummary
                  protein={food.proteinG}
                  carbs={food.carbsG}
                  fats={food.fatsG}
                  kcal={food.kcal}
                  kcalSuffix="kcal (por 100g)"
                  className="text-style-legal text-text-muted"
                />
              </div>

              {isSelected && (
                <div className="size-6 rounded-round bg-success text-on-primary flex items-center justify-center shrink-0">
                  <Check size={14} />
                </div>
              )}
            </Button>
          );
        })
      )}
    </div>
  );
}

