import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { MealCardContainer } from '@/components/organisms/MealCardContainer';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

const renderMealCard = (overrides: Partial<React.ComponentProps<typeof MealCardContainer>> = {}) =>
  render(
    <MealCardContainer
      title="Café da manhã"
      time="08:00"
      kcal={420}
      proteinG={24}
      carbsG={48}
      fatsG={14}
      items={[]}
      {...overrides}
    />,
  );

describe('MealCardContainer meal header fields', () => {
  it('keeps the meal name and time editable directly via inputs without an edit button', async () => {
    renderMealCard();

    const titleInput = screen.getByRole('textbox', { name: 'Nome da refeição' });
    const timeInput = screen.getByRole('textbox', { name: 'Horário da refeição' });
    const timePickerButton = screen.getByRole('button', { name: 'Selecionar horário' });

    expect(titleInput).toHaveValue('Café da manhã');
    expect(titleInput).toHaveClass('w-meal-title');
    expect(timeInput).toHaveValue('08:00');
    expect(timePickerButton).toBeInTheDocument();

    fireEvent.click(timePickerButton);
    expect(await screen.findByRole('button', { name: 'Hora 08' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Minuto 05' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar nome e horário/i })).not.toBeInTheDocument();
  });

  it('places all meal actions in the header', () => {
    const { container } = renderMealCard();
    const actionGroup = screen.getByRole('group', { name: 'Ações da refeição' });
    const transferGroup = screen.getByRole('group', { name: 'Transferir alimentos da refeição' });

    expect(actionGroup).toHaveClass('shrink-0');
    expect(actionGroup.parentElement).toHaveClass('border-b');
    expect(transferGroup).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeDisabled();
    const pasteButton = screen.getByRole('button', { name: 'Colar' });

    expect(pasteButton).toBeDisabled();
    expect(pasteButton).toHaveClass('border-border-control');
    expect(screen.getByRole('button', { name: 'Duplicar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Escalar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir refeição' })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    expect(container.querySelector('[class~="pt-3"][class~="border-t"]')).not.toBeInTheDocument();
  });

  it('enables paste with the secondary variant when a meal is copied', () => {
    const onPasteMeal = vi.fn();
    renderMealCard({ canPasteMeal: true, onPasteMeal });

    const pasteButton = screen.getByRole('button', { name: 'Colar' });

    expect(pasteButton).toBeEnabled();
    expect(pasteButton).toHaveClass('border-border-control');

    fireEvent.click(pasteButton);
    expect(onPasteMeal).toHaveBeenCalledTimes(1);
  });

  it('commits typed custom names and times on blur or enter', async () => {
    const onTitleChange = vi.fn();
    const onTimeChange = vi.fn();
    renderMealCard({ onTitleChange, onTimeChange });

    const titleInput = screen.getByRole('textbox', { name: 'Nome da refeição' });
    const timeInput = screen.getByRole('textbox', { name: 'Horário da refeição' });

    // Type meal title
    fireEvent.change(titleInput, { target: { value: '  Café reforçado  ' } });
    fireEvent.blur(titleInput);

    // Type meal time directly
    fireEvent.change(timeInput, { target: { value: '09:30' } });
    fireEvent.blur(timeInput);

    expect(onTitleChange).toHaveBeenCalledWith('Café reforçado');
    await waitFor(() => expect(onTimeChange).toHaveBeenCalledWith('09:30'));
  });

  it('formats shorthand time numbers like 830 or 1400 on commit', async () => {
    const onTimeChange = vi.fn();
    renderMealCard({ onTimeChange });

    const timeInput = screen.getByRole('textbox', { name: 'Horário da refeição' });

    fireEvent.change(timeInput, { target: { value: '830' } });
    fireEvent.keyDown(timeInput, { key: 'Enter' });

    await waitFor(() => expect(onTimeChange).toHaveBeenCalledWith('08:30'));
  });

  it('strictly forces valid HH:MM range clamping (e.g. 2599 -> 23:59, 8 -> 08:00)', async () => {
    const onTimeChange = vi.fn();
    renderMealCard({ onTimeChange });

    const timeInput = screen.getByRole('textbox', { name: 'Horário da refeição' });

    // Single digit hour
    fireEvent.change(timeInput, { target: { value: '7' } });
    fireEvent.blur(timeInput);
    await waitFor(() => expect(onTimeChange).toHaveBeenCalledWith('07:00'));

    // Clamping invalid hour/minute
    fireEvent.change(timeInput, { target: { value: '2599' } });
    fireEvent.blur(timeInput);
    await waitFor(() => expect(onTimeChange).toHaveBeenCalledWith('23:59'));
  });

  it('allows selecting hour and minute separately via the time picker popover', async () => {
    const onTimeChange = vi.fn();
    renderMealCard({ onTimeChange });

    const timePickerButton = screen.getByRole('button', { name: 'Selecionar horário' });
    fireEvent.click(timePickerButton);

    const hourButton = await screen.findByRole('button', { name: 'Hora 10' });
    fireEvent.click(hourButton);

    expect(onTimeChange).toHaveBeenCalledWith('10:00');

    const minuteButton = await screen.findByRole('button', { name: 'Minuto 45' });
    fireEvent.click(minuteButton);

    expect(onTimeChange).toHaveBeenCalledWith('10:45');
  });

  it('restores the current value with Escape without committing it', () => {
    const onTitleChange = vi.fn();
    const onTimeChange = vi.fn();
    renderMealCard({ onTitleChange, onTimeChange });

    const titleInput = screen.getByRole('textbox', { name: 'Nome da refeição' });
    const timeInput = screen.getByRole('textbox', { name: 'Horário da refeição' });

    fireEvent.change(titleInput, { target: { value: 'Outro nome' } });
    fireEvent.keyDown(titleInput, { key: 'Escape' });

    fireEvent.change(timeInput, { target: { value: '23:59' } });
    fireEvent.keyDown(timeInput, { key: 'Escape' });

    expect(titleInput).toHaveValue('Café da manhã');
    expect(timeInput).toHaveValue('08:00');
    expect(onTitleChange).not.toHaveBeenCalled();
    expect(onTimeChange).not.toHaveBeenCalled();
  });
});
