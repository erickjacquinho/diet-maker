import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { FoodSearchModal } from '../FoodSearchModal';
import * as tacoStore from '@/lib/tacoStore';
import * as tacoAdapter from '@/lib/application/diets/taco-food-adapter';
import type { NutritionSnapshot } from '@/lib/domain/diets/diet-model';

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
      {
        id: 'custom-1',
        name: 'Alimento customizado',
        category: 'Customizados',
        proteinG: 10,
        carbsG: 10,
        fatG: 10,
        fatsG: 10,
        fiberG: 1,
        source: 'CUSTOM',
        kcal: 170,
        preparo: 'inNatura',
        isFavorite: false,
      },
    ]);

    vi.spyOn(tacoAdapter, 'createTacoSnapshot').mockReturnValue({
      sourceType: 'SYSTEM_TACO',
      sourceId: 'taco-1',
      prescribedQuantity: '100',
    } as unknown as NutritionSnapshot);
  });

  function renderModal() {
    return render(
      <FoodSearchModal
        isOpen={true}
        onClose={mockClose}
        mealTitle="Almoço"
        onAddFood={mockAddFood}
      />
    );
  }

  it('renders only the TACO source and keeps favorites visible', () => {
    renderModal();

    expect(screen.getByText(/Adicionar à Refeição "Almoço"/i)).toBeInTheDocument();
    expect(screen.getByText('Arroz branco cozido')).toBeInTheDocument();
    expect(screen.queryByText('Alimento customizado')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByText(/Refeições Prontas|Receitas/i)).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /filtrar favoritos/i })).toBeInTheDocument();
  });

  it('filters the TACO table by food type', () => {
    renderModal();

    fireEvent.click(screen.getByRole('combobox', { name: 'Tipo de alimento' }));
    fireEvent.click(screen.getByRole('option', { name: 'Cereais' }));

    expect(screen.getByText('Arroz branco cozido')).toBeInTheDocument();
    expect(screen.queryByText('Alimento customizado')).not.toBeInTheDocument();
  });

  it('adds selected TACO food with a complete frozen snapshot', () => {
    renderModal();

    fireEvent.click(screen.getByText('Arroz branco cozido'));
    fireEvent.click(screen.getByRole('button', { name: /adicionar \(1\)/i }));

    expect(mockAddFood).toHaveBeenCalledTimes(1);
    expect(mockAddFood.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        foodId: 'taco-1',
        name: 'Arroz branco cozido (cozido)',
        snapshot: expect.objectContaining({
          sourceType: 'SYSTEM_TACO',
          sourceId: 'taco-1',
          prescribedQuantity: '100',
        }),
      }),
    ]);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
