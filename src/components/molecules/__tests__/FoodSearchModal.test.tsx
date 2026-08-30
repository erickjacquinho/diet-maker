import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { FoodSearchModal } from '../FoodSearchModal';
import * as tacoStore from '@/lib/tacoStore';
import * as readyMealsStore from '@/lib/readyMealsStore';
import * as recipesStore from '@/lib/recipesStore';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

describe('FoodSearchModal', () => {
  const mockAddFood = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(tacoStore, 'getAllFoods').mockReturnValue([
      {
        id: 'taco-1',
        name: 'Arroz branco cozido',
        category: 'Cereais',
        proteinG: 2.5,
        carbsG: 28.1,
        fatG: 0.2,
        fatsG: 0.2,
        fiberG: 1.6,
        source: 'TACO',
        kcal: 128,
        preparo: 'cozido',
        isFavorite: false,
      },
    ]);

    vi.spyOn(readyMealsStore, 'getReadyMealsFromStorage').mockReturnValue([
      {
        id: 'meal-1',
        name: 'Almoço Completo',
        suggestedTime: '12:00',
        kcal: 500,
        proteinG: 35,
        carbsG: 50,
        fatsG: 10,
        itemsCount: 3,
        itemsPreview: 'Arroz, Feijão, Frango',
      },
    ]);

    vi.spyOn(recipesStore, 'getRecipesFromStorage').mockReturnValue([
      {
        id: 'rec-1',
        name: 'Omelete de Forno',
        category: 'Café da Manhã',
        servings: 1,
        instructions: 'Assar por 20 min',
        createdAt: '2026-08-01',
        ingredients: [
          {
            foodId: 'taco-2',
            name: 'Ovo',
            amountGrams: 100,
            proteinG: 13,
            carbsG: 1.6,
            fatsG: 8.9,
            kcal: 146,
          },
        ],
      },
    ]);
  });

  it('renders modal with shadcn button group and always-visible favorites button', () => {
    render(
      <FoodSearchModal
        isOpen={true}
        onClose={mockClose}
        mealTitle="Café da Manhã"
        onAddFood={mockAddFood}
      />
    );

    expect(screen.getByText(/Adicionar à Refeição "Café da Manhã"/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /alimentos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /refeições prontas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /receitas/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /filtrar favoritos/i })).toBeInTheDocument();
  });

  it('switches categories via button group while keeping favorites button always visible', () => {
    render(
      <FoodSearchModal
        isOpen={true}
        onClose={mockClose}
        mealTitle="Almoço"
        onAddFood={mockAddFood}
      />
    );

    // Initial: Alimentos
    expect(screen.getByPlaceholderText('Buscar por nome do alimento...')).toBeInTheDocument();
    expect(screen.getByText('Arroz branco cozido')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /filtrar favoritos/i })).toBeInTheDocument();

    // Switch to Refeições Prontas via Button Group
    fireEvent.click(screen.getByRole('tab', { name: /refeições prontas/i }));
    expect(screen.getByPlaceholderText('Buscar refeição pronta por nome ou ingrediente...')).toBeInTheDocument();
    expect(screen.getByText('Almoço Completo')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /filtrar favoritos/i })).toBeInTheDocument();

    // Switch to Receitas via Button Group
    fireEvent.click(screen.getByRole('tab', { name: /receitas/i }));
    expect(screen.getByPlaceholderText('Buscar receita culinária por nome ou ingrediente...')).toBeInTheDocument();
    expect(screen.getByText('Omelete de Forno')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /filtrar favoritos/i })).toBeInTheDocument();
  });

  it('allows selecting items across categories and adds them with onAddFood', () => {
    render(
      <FoodSearchModal
        isOpen={true}
        onClose={mockClose}
        mealTitle="Almoço"
        onAddFood={mockAddFood}
      />
    );

    // Select Food
    const foodRow = screen.getByText('Arroz branco cozido');
    fireEvent.click(foodRow);

    // Switch to Ready Meal via Button Group
    fireEvent.click(screen.getByRole('tab', { name: /refeições prontas/i }));
    const mealRow = screen.getByText('Almoço Completo');
    fireEvent.click(mealRow);

    // Switch to Recipe via Button Group
    fireEvent.click(screen.getByRole('tab', { name: /receitas/i }));
    const recipeRow = screen.getByText('Omelete de Forno');
    fireEvent.click(recipeRow);

    // Verify counter in footer shows 3 items selected
    expect(screen.getByText('3 itens selecionados')).toBeInTheDocument();

    // Click Add
    const addButton = screen.getByRole('button', { name: /adicionar \(3\)/i });
    fireEvent.click(addButton);

    expect(mockAddFood).toHaveBeenCalledTimes(1);
    const addedItems = mockAddFood.mock.calls[0][0];
    expect(addedItems).toHaveLength(3);
    expect(addedItems[0].name).toContain('Arroz branco cozido');
    expect(addedItems[1].name).toBe('Almoço Completo');
    expect(addedItems[2].name).toBe('Omelete de Forno (1 porção)');
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
