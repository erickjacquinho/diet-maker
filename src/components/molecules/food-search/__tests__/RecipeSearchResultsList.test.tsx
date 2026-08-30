import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecipeSearchResultsList } from '../RecipeSearchResultsList';
import type { Recipe } from '@/lib/recipesStore';

const mockRecipes: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Panqueca de Banana',
    category: 'Café da Manhã',
    servings: 2,
    instructions: 'Misturar e grelhar',
    createdAt: '2026-08-01',
    ingredients: [
      {
        foodId: 'taco-1',
        name: 'Ovo de galinha cozido',
        amountGrams: 100,
        proteinG: 13,
        carbsG: 1.6,
        fatsG: 8.9,
        kcal: 146,
      },
      {
        foodId: 'taco-2',
        name: 'Banana prata',
        amountGrams: 100,
        proteinG: 1.3,
        carbsG: 26,
        fatsG: 0.1,
        kcal: 98,
      },
    ],
  },
];

describe('RecipeSearchResultsList', () => {
  it('renders table columns and calculates portion macros correctly', () => {
    render(
      <RecipeSearchResultsList
        searchResults={mockRecipes}
        selectedRecipeIds={new Set()}
        query=""
        onToggleRecipe={vi.fn()}
      />
    );

    expect(screen.getByText('Panqueca de Banana')).toBeInTheDocument();
    expect(screen.getByText('Café da Manhã')).toBeInTheDocument();
    expect(screen.getByText('2 porções')).toBeInTheDocument();

    // Total: Prot = (13 + 1.3) = 14.3g -> /2 = 7.2g
    // Total: Carb = (1.6 + 26) = 27.6g -> /2 = 13.8g
    // Total: Fat = (8.9 + 0.1) = 9.0g -> /2 = 4.5g
    expect(screen.getByText('7.2g')).toBeInTheDocument();
    expect(screen.getByText('13.8g')).toBeInTheDocument();
    expect(screen.getByText('4.5g')).toBeInTheDocument();
  });

  it('renders empty state when no recipes found', () => {
    render(
      <RecipeSearchResultsList
        searchResults={[]}
        selectedRecipeIds={new Set()}
        query="NaoExiste"
        onToggleRecipe={vi.fn()}
      />
    );

    expect(screen.getByText('Nenhuma receita culinária encontrada')).toBeInTheDocument();
  });

  it('calls onToggleRecipe when row is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <RecipeSearchResultsList
        searchResults={mockRecipes}
        selectedRecipeIds={new Set()}
        query=""
        onToggleRecipe={handleToggle}
      />
    );

    const recipeRow = screen.getByText('Panqueca de Banana');
    fireEvent.click(recipeRow);

    expect(handleToggle).toHaveBeenCalledWith(mockRecipes[0]);
  });
});
