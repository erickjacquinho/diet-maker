import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FoodSearchCategorySelector } from '@/components/molecules/food-search/FoodSearchCategorySelector';
import { CreateReadyMealModal } from '@/components/organisms/CreateReadyMealModal';

describe('reusable library accessibility contract', () => {
  it('provides named keyboard controls for source selection', () => {
    render(
      <FoodSearchCategorySelector
        activeCategory="foods"
        onCategoryChange={vi.fn()}
        counts={{ foods: 598, meals: 0, recipes: 0 }}
      />,
    );

    const group = screen.getByRole('group', { name: 'Seletor de fonte de itens para a refeição' });
    const foods = screen.getByRole('button', { name: /Alimentos/ });
    expect(group).toBeInTheDocument();
    foods.focus();
    expect(foods).toHaveFocus();
    expect(foods).toHaveAttribute('data-state', 'on');
  });

  it('keeps validation feedback in an assertive, actionable region', () => {
    render(<CreateReadyMealModal open onOpenChange={vi.fn()} onSave={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Nome da Refeição'), { target: { value: 'Bloco sem itens' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Refeição/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('Adicione pelo menos um alimento');
  });
});
