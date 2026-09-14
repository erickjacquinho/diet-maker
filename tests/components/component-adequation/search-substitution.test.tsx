import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FoodSearchModal } from '@/components/organisms/foods/FoodSearchModal';
import { SubstituteFoodModal, type MealFoodToSubstitute } from '@/components/organisms/foods/SubstituteFoodModal';
import { ReadyMealSearchResultsList } from '@/components/molecules/food-search/ReadyMealSearchResultsList';
import { RecipeSearchResultsList } from '@/components/molecules/food-search/RecipeSearchResultsList';
import type { ReadyMeal } from '@/lib/readyMealsStore';
import type { Recipe } from '@/lib/recipesStore';

const readyMeal: ReadyMeal = {
  id: 'ready-1',
  name: 'Café da manhã com um nome suficientemente longo para testar overflow',
  suggestedTime: '08:00',
  kcal: 450,
  proteinG: 30,
  carbsG: 45,
  fatsG: 15,
  itemsCount: 3,
  itemsPreview: 'Ovo, aveia e banana',
};

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Panqueca de banana com aveia',
  category: 'Café da Manhã',
  servings: 2,
  instructions: 'Misturar e grelhar',
  createdAt: '2026-08-30',
  ingredients: [
    {
      foodId: 'food-1',
      name: 'Banana prata',
      amountGrams: 100,
      proteinG: 1.3,
      carbsG: 26,
      fatsG: 0.1,
      kcal: 98,
    },
  ],
};

const foodToSubstitute: MealFoodToSubstitute = {
  mealId: 'meal-1',
  mealName: 'Almoço',
  itemId: 'item-1',
  foodName: 'Arroz integral',
  quantityGrams: 150,
  protein: 3.8,
  carbs: 42.2,
  fats: 0.3,
  kcal: 192,
};

describe('component adequation: search and substitution', () => {
  it('keeps ready-meal and recipe results inside canonical tables with stable selection seams', () => {
    const onToggleMeal = vi.fn();
    const onToggleRecipe = vi.fn();
    const { rerender } = render(
      <ReadyMealSearchResultsList
        searchResults={[readyMeal]}
        selectedMealIds={new Set()}
        query=""
        onToggleMeal={onToggleMeal}
      />,
    );

    const readyTable = screen.getByRole('table', {
      name: 'Lista de blocos de refeições prontas reutilizáveis',
    });
    expect(within(readyTable).getByRole('columnheader', { name: 'Refeição Pronta' })).toBeInTheDocument();
    expect(within(readyTable).getByText(readyMeal.name)).toBeInTheDocument();
    expect(within(readyTable).getByRole('row', { name: /Café da manhã/ })).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(within(readyTable).getByRole('row', { name: /Café da manhã/ }), { key: 'Enter' });
    expect(onToggleMeal).toHaveBeenCalledWith(readyMeal);

    rerender(
      <RecipeSearchResultsList
        searchResults={[recipe]}
        selectedRecipeIds={new Set()}
        query=""
        onToggleRecipe={onToggleRecipe}
      />,
    );

    const recipeTable = screen.getByRole('table', {
      name: 'Lista de receitas culinárias calculadas por porção',
    });
    expect(within(recipeTable).getByRole('columnheader', { name: 'Receita Culinária' })).toBeInTheDocument();
    expect(within(recipeTable).getByText('2 porções')).toBeInTheDocument();
    fireEvent.click(within(recipeTable).getByRole('row', { name: /Panqueca/ }));
    expect(onToggleRecipe).toHaveBeenCalledWith(recipe);
  });

  it('keeps empty states in the canonical table and retains long-text context', () => {
    const { rerender } = render(
      <ReadyMealSearchResultsList
        searchResults={[]}
        selectedMealIds={new Set()}
        query="sem resultado"
        onToggleMeal={vi.fn()}
      />,
    );
    expect(screen.getByRole('table', { name: 'Lista de blocos de refeições prontas reutilizáveis' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Nenhuma refeição pronta encontrada/);

    rerender(
      <RecipeSearchResultsList
        searchResults={[]}
        selectedRecipeIds={new Set()}
        query="sem resultado"
        onToggleRecipe={vi.fn()}
      />,
    );
    expect(screen.getByRole('table', { name: 'Lista de receitas culinárias calculadas por porção' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Nenhuma receita culinária encontrada/);
  });

  it('preserves the food-search selection payload and substitution quantity', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();
    render(<FoodSearchModal isOpen onClose={onClose} onAddFood={onAddFood} />);

    const foodSearch = screen.getByPlaceholderText(/Buscar por nome do alimento/i);
    fireEvent.change(foodSearch, { target: { value: 'Arroz, integral, cozido' } });
    const foodTable = screen.getByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    const foodRow = within(foodTable).getAllByRole('row')[1];
    fireEvent.keyDown(foodRow, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar \(1\)/i }));

    expect(onAddFood).toHaveBeenCalledWith([
      expect.objectContaining({ quantityGrams: 100, snapshot: expect.any(Object) }),
    ]);
    expect(onClose).toHaveBeenCalledTimes(1);

    const onSubstitute = vi.fn();
    const substituteClose = vi.fn();
    render(
      <SubstituteFoodModal
        isOpen
        onClose={substituteClose}
        foodToSubstitute={foodToSubstitute}
        onSubstituteFood={onSubstitute}
      />,
    );
    const substituteSearch = screen.getByPlaceholderText(/Buscar alimento substituto/i);
    fireEvent.change(substituteSearch, { target: { value: 'Batata, doce, cozida' } });
    const substituteTable = screen.getByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    fireEvent.click(within(substituteTable).getAllByRole('row')[1]);
    const submit = screen.getByRole('button', { name: /Substituir por/i });
    expect(submit).toHaveTextContent('150g');
    fireEvent.click(submit);
    expect(onSubstitute).toHaveBeenCalledWith(
      'meal-1',
      'item-1',
      expect.objectContaining({ name: expect.stringMatching(/Batata/i) }),
    );
    expect(substituteClose).toHaveBeenCalledTimes(1);
  });
});
