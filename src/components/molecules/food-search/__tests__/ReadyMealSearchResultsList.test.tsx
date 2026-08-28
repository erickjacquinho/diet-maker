import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReadyMealSearchResultsList } from '../ReadyMealSearchResultsList';
import type { ReadyMeal } from '@/lib/readyMealsStore';

const mockReadyMeals: ReadyMeal[] = [
  {
    id: 'meal-1',
    name: 'Café da Manhã Completo',
    suggestedTime: '08:00',
    kcal: 450,
    proteinG: 30,
    carbsG: 45,
    fatsG: 15,
    itemsCount: 3,
    itemsPreview: 'Ovo (100g), Aveia (40g), Banana (100g)',
  },
  {
    id: 'meal-2',
    name: 'Almoço Fit',
    suggestedTime: '12:30',
    kcal: 600,
    proteinG: 50,
    carbsG: 60,
    fatsG: 12,
    itemsCount: 4,
    itemsPreview: 'Frango (150g), Arroz (150g), Feijão (100g), Salada',
  },
];

describe('ReadyMealSearchResultsList', () => {
  it('renders table columns and meal data correctly', () => {
    render(
      <ReadyMealSearchResultsList
        searchResults={mockReadyMeals}
        selectedMealIds={new Set()}
        query=""
        onToggleMeal={vi.fn()}
      />
    );

    expect(screen.getByText('Café da Manhã Completo')).toBeInTheDocument();
    expect(screen.getByText('Almoço Fit')).toBeInTheDocument();
    expect(screen.getByText('3 itens')).toBeInTheDocument();
    expect(screen.getByText('30g')).toBeInTheDocument();
    expect(screen.getByText('45g')).toBeInTheDocument();
    expect(screen.getByText('15g')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  it('renders empty state when no ready meals found', () => {
    render(
      <ReadyMealSearchResultsList
        searchResults={[]}
        selectedMealIds={new Set()}
        query="NaoExiste"
        onToggleMeal={vi.fn()}
      />
    );

    expect(screen.getByText('Nenhuma refeição pronta encontrada')).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma refeição pronta corresponde a "NaoExiste"/i)).toBeInTheDocument();
  });

  it('calls onToggleMeal when a row is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <ReadyMealSearchResultsList
        searchResults={mockReadyMeals}
        selectedMealIds={new Set()}
        query=""
        onToggleMeal={handleToggle}
      />
    );

    const mealRow = screen.getByText('Café da Manhã Completo');
    fireEvent.click(mealRow);

    expect(handleToggle).toHaveBeenCalledWith(mockReadyMeals[0]);
  });
});
