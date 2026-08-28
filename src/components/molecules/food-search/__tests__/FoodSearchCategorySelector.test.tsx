import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FoodSearchCategorySelector } from '../FoodSearchCategorySelector';

describe('FoodSearchCategorySelector', () => {
  it('renders all three categories with labels and counts', () => {
    const handleChange = vi.fn();
    render(
      <FoodSearchCategorySelector
        activeCategory="foods"
        onCategoryChange={handleChange}
        counts={{ foods: 50, meals: 5, recipes: 12 }}
      />
    );

    expect(screen.getByText('Alimentos')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    expect(screen.getByText('Refeições Prontas')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('indicates the active category tab', () => {
    render(
      <FoodSearchCategorySelector
        activeCategory="meals"
        onCategoryChange={vi.fn()}
      />
    );

    const mealsTab = screen.getByRole('tab', { name: /refeições prontas/i });
    expect(mealsTab).toHaveAttribute('data-state', 'active');
    expect(mealsTab).toHaveAttribute('aria-selected', 'true');

    const foodsTab = screen.getByRole('tab', { name: /alimentos/i });
    expect(foodsTab).toHaveAttribute('data-state', 'inactive');
    expect(foodsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onCategoryChange when a different category is clicked', () => {
    const handleChange = vi.fn();
    render(
      <FoodSearchCategorySelector
        activeCategory="foods"
        onCategoryChange={handleChange}
      />
    );

    const recipesTab = screen.getByRole('tab', { name: /receitas/i });
    fireEvent.click(recipesTab);

    expect(handleChange).toHaveBeenCalledWith('recipes');
  });
});
