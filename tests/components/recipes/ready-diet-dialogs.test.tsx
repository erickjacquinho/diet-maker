import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MealBasicsEditor } from '@/components/molecules/MealBasicsEditor';
import { CreateReadyMealsFromDietModal } from '@/components/organisms/CreateReadyMealsFromDietModal';
import { SaveReadyDietModal } from '@/components/organisms/SaveReadyDietModal';
import type { DietMeal } from '@/lib/legacy-diet-types';

const meals = [{ id: 'meal', mealId: 'meal', variationId: 'daily', name: 'Café', time: '08:00' }];
const item = { id: 'rice', name: 'Arroz', quantityGrams: 100, protein: 2, carbs: 28, fats: 1, kcal: 129 };
const meal: DietMeal = { id: 'meal', name: 'Café', time: '08:00', items: [item], variations: [
  { id: 'alternative', items: [{ ...item, id: 'beans', name: 'Feijão' }] },
  { id: 'empty', items: [] },
] };

describe('ready diet dialog contracts', () => {
  it('edits one meal without changing other records or their identities', () => {
    const onChange = vi.fn();
    render(<MealBasicsEditor entries={[...meals, { ...meals[0], id: 'other', name: 'Jantar' }]} idPrefix="test" onChange={onChange} />);
    fireEvent.change(screen.getAllByLabelText('Nome da refeição')[0], { target: { value: 'Desjejum' } });
    expect(onChange).toHaveBeenCalledWith([{ ...meals[0], name: 'Desjejum' }, { ...meals[0], id: 'other', name: 'Jantar' }]);
  });

  it('selects nonempty variations with the shared checkbox and submits their original items', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(<CreateReadyMealsFromDietModal open meal={meal} onConfirm={onConfirm} onOpenChange={onOpenChange} />);
    expect(screen.getByRole('checkbox', { name: 'Variação 1' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Variação 3' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Variação 2' }));
    expect(screen.getByRole('checkbox', { name: 'Variação 2' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'meal::variation-1', items: meal.items }),
      expect.objectContaining({ id: 'alternative', items: meal.variations![0].items }),
    ]);
  });

  it('preserves the diet form after a save error and allows retry', async () => {
    const onConfirm = vi.fn().mockRejectedValueOnce(new Error('Gravação falhou')).mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(<SaveReadyDietModal open initialName="Original" meals={meals} onConfirm={onConfirm} onOpenChange={onOpenChange} />);
    fireEvent.change(screen.getByLabelText('Nome da dieta pronta'), { target: { value: 'Renomeada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Gravação falhou');
    expect(screen.getByLabelText('Nome da dieta pronta')).toHaveValue('Renomeada');
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenLastCalledWith({ name: 'Renomeada', meals });
  });

  it('disables diet and meal fields while a save is in flight', () => {
    render(<SaveReadyDietModal open isSaving initialName="Dieta" meals={meals} onConfirm={vi.fn()} onOpenChange={vi.fn()} />);
    expect(screen.getByLabelText('Nome da dieta pronta')).toBeDisabled();
    expect(screen.getByLabelText('Nome da refeição')).toBeDisabled();
    expect(screen.getByLabelText('Horário')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });
});
