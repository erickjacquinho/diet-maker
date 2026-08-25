'use client';

import React from 'react';
import { Plus, Utensils } from 'lucide-react';
import { Button, Surface } from '@/components/atoms';
import { MealCardContainer, MealCardContainerProps } from '../MealCardContainer';

export interface DietMealsSectionProps {
  mealsData: MealCardContainerProps[];
  onAddMeal?: () => void;
}

export function DietMealsSection({ mealsData = [], onAddMeal }: DietMealsSectionProps) {
  return (
    <section aria-labelledby="meals-heading" className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <h2 id="meals-heading" className="text-style-subsection-title font-bold tracking-tight text-text-primary">
            Refeições
          </h2>
          <p className="text-style-legal text-text-muted">Organize as refeições e alimentos prescritos para o paciente.</p>
        </div>
        <Button onClick={onAddMeal} variant="secondary" size="compact" className="flex items-center gap-1.5 self-auto">
          <Plus size={14} aria-hidden="true" />
          <span>Nova Refeição</span>
        </Button>
      </div>

      {mealsData.length === 0 ? (
        <Surface variant="subtle" className="p-8 text-center flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-surface bg-success-soft text-success flex items-center justify-center mx-auto">
            <Utensils size={24} aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-style-body font-bold text-text-primary">Nenhuma Refeição Cadastrada</h3>
            <p className="text-style-legal text-text-muted max-w-md mx-auto">
              Use “Nova Refeição” para começar a prescrição e adicionar alimentos diretamente da base TACO.
            </p>
          </div>
        </Surface>
      ) : (
        <div className="flex flex-col gap-6">
          {mealsData.map((meal, index) => (
            <MealCardContainer key={meal.id || index} {...meal} />
          ))}
        </div>
      )}
    </section>
  );
}

