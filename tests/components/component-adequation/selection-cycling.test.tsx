import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CarbCyclingVariationPanel } from '@/components/organisms/diet/CarbCyclingVariationPanel';
import { DietModeSwitcher, type DietModeSwitcherProps } from '@/components/organisms/diet/DietModeSwitcher';
import {
  FoodSearchCategorySelector,
  type FoodSearchCategory,
} from '@/components/molecules/food-search/FoodSearchCategorySelector';
import type { CarbCyclingVariation } from '@/lib/legacy-diet-types';

const variations: CarbCyclingVariation[] = [
  {
    id: 'high',
    name: 'Dia alto',
    type: 'high',
    assignedDays: ['seg', 'qua'],
    targetKcal: 2200,
    targetProtein: 160,
    targetCarbs: 260,
    targetFats: 55,
    meals: [],
  },
  {
    id: 'low',
    name: 'Dia baixo',
    type: 'low',
    assignedDays: ['ter', 'qui'],
    targetKcal: 1800,
    targetProtein: 160,
    targetCarbs: 130,
    targetFats: 65,
    meals: [],
  },
];

const modeProps = (
  overrides: Partial<DietModeSwitcherProps> = {},
): DietModeSwitcherProps => ({
  mode: 'simple',
  onModeChange: vi.fn(),
  variations,
  activeVariationId: 'high',
  onSelectVariation: vi.fn(),
  ...overrides,
});

describe('component adequation: selection and cycling', () => {
  it('uses one controlled selection without exposing category tabs or an empty selection', () => {
    const onCategoryChange = vi.fn<(category: FoodSearchCategory) => void>();
    render(
      <FoodSearchCategorySelector
        activeCategory="meals"
        onCategoryChange={onCategoryChange}
        counts={{ foods: 10, meals: 2, recipes: 4 }}
      />,
    );

    const group = screen.getByRole('group', {
      name: 'Seletor de fonte de itens para a refeição',
    });
    const options = within(group).getAllByRole('button');
    expect(options).toHaveLength(3);
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(options.filter((option) => option.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    expect(within(group).getByRole('button', { name: /Refeições Prontas/ })).toHaveAttribute(
      'data-state',
      'on',
    );

    fireEvent.click(within(group).getByRole('button', { name: /Refeições Prontas/ }));
    expect(onCategoryChange).toHaveBeenLastCalledWith('meals');
    fireEvent.click(within(group).getByRole('button', { name: /Receitas/ }));
    expect(onCategoryChange).toHaveBeenLastCalledWith('recipes');
  });

  it('keeps diet mode selection and cycle actions separate and keyboard-operable', () => {
    const onModeChange = vi.fn();
    const onSelectVariation = vi.fn();
    const onCopyMeals = vi.fn();
    const onReorder = vi.fn();

    const { rerender } = render(
      <DietModeSwitcher
        {...modeProps({ onModeChange, onSelectVariation })}
      />,
    );

    const modeGroup = screen.getByRole('group', { name: 'Modelo de dieta' });
    const simpleMode = within(modeGroup).getByRole('button', { name: /Dieta Simples/ });
    const cyclingMode = within(modeGroup).getByRole('button', { name: /Ciclo de Carboidratos/ });
    expect(simpleMode).toHaveAttribute('aria-pressed', 'true');
    expect(cyclingMode).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText('Variações do Ciclo')).not.toBeInTheDocument();

    fireEvent.click(cyclingMode);
    expect(onModeChange).toHaveBeenCalledWith('carb_cycling');

    rerender(
      <DietModeSwitcher
        {...modeProps({
          mode: 'carb_cycling',
          onModeChange,
          onSelectVariation,
          onCopyMealsBetweenVariations: onCopyMeals,
          onReorderVariations: onReorder,
        })}
      />,
    );

    const panel = screen.getByTestId('carb-cycling-variation-panel');
    const variationOptions = within(panel).getAllByRole('button', { name: /^Dia/ });
    expect(variationOptions).toHaveLength(2);
    expect(variationOptions[0]).toHaveAttribute('aria-pressed', 'true');
    expect(variationOptions[1]).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Copiar Refeições/ })).toBeInTheDocument();

    fireEvent.keyDown(variationOptions[1], { key: 'Enter' });
    expect(onSelectVariation).toHaveBeenCalledWith('low');
    fireEvent.keyDown(variationOptions[0], { key: 'ArrowDown', altKey: true });
    expect(onReorder).toHaveBeenCalledWith([variations[1], variations[0]]);
    fireEvent.click(screen.getByRole('button', { name: /Copiar Refeições/ }));
    expect(onCopyMeals).toHaveBeenCalledTimes(1);
  });
});
