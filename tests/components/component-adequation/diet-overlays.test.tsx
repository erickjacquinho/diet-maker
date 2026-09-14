import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImportPreviousDietModal } from '@/components/organisms/diets/ImportPreviousDietModal';
import { ReadOnlyDietModal } from '@/components/organisms/diets/ReadOnlyDietModal';
import type { PreviousDietSummary } from '@/lib/legacy-diet-copy';
import { historicalDietFixture } from '../../fixtures/diets';

const diet: PreviousDietSummary = {
  id: 'previous-1',
  name: 'Plano anterior sintético',
  date: '15/01/2026',
  mode: 'simple',
  modeLabel: 'Simples',
  targetKcal: 2000,
  proteinG: 150,
  carbsG: 220,
  fatsG: 60,
  mealsCount: 3,
};

describe('component adequation: diet overlays', () => {
  it('keeps import selection/search/expansion and leaves the overlay open after async rejection', async () => {
    const onClose = vi.fn();
    const onPullMacrosOnly = vi.fn().mockRejectedValue(new Error('synthetic failure'));
    render(
      <ImportPreviousDietModal
        isOpen
        onClose={onClose}
        diets={[diet]}
        onPullMacrosOnly={onPullMacrosOnly}
        onPullAllMeals={vi.fn()}
      />,
    );

    const search = screen.getByRole('searchbox', { name: 'Buscar por nome ou data da dieta' });
    search.focus();
    expect(search).toHaveFocus();
    fireEvent.change(search, { target: { value: 'anterior' } });
    const row = screen.getByText(diet.name).closest('tr');
    expect(row).toBeInTheDocument();
    fireEvent.click(row as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: /Puxar apenas os macros/ }));

    await waitFor(() => expect(onPullMacrosOnly).toHaveBeenCalledWith(diet));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Importar Dieta Anterior')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Puxar apenas os macros/ })).toBeEnabled();

    fireEvent.keyDown(document, { key: 'Escape' });
  });

  it('reads the DietPlan snapshot without inputs, recalculation or persistence controls', () => {
    const onClose = vi.fn();
    render(
      <ReadOnlyDietModal
        isOpen
        onClose={onClose}
        diet={historicalDietFixture}
        patientName="Paciente Sintético"
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Prescrição histórica');
    expect(dialog).toHaveTextContent('Arroz, tipo 1, cozido');
    expect(dialog).toHaveTextContent('128 kcal');
    expect(dialog).toHaveTextContent('Prescrição congelada para consulta');
    expect(dialog.querySelectorAll('input, textarea, select')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /editar|excluir/i })).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Fechar Visualização' }));
    expect(onClose).toHaveBeenCalled();
  });
});
