import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImportPreviousDietModal } from '@/components/organisms/diets/ImportPreviousDietModal';

const diet = {
  id: 'diet-source', name: 'Plano fonte', date: '30/08/2026', mode: 'simple' as const,
  modeLabel: 'Simples', targetKcal: 1800, proteinG: 120, carbsG: 180, fatsG: 50, mealsCount: 3,
};

describe('organism ImportPreviousDietModal', () => {
  it('keeps both import actions disabled until one source is selected', () => {
    render(<ImportPreviousDietModal isOpen onClose={vi.fn()} diets={[diet]} onPullMacrosOnly={vi.fn()} onPullAllMeals={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Puxar apenas os macros/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Puxar todas as refeições/i })).toBeDisabled();
  });

  it('waits for persistence before closing and locks repeated submissions', async () => {
    let resolve: (() => void) | undefined;
    const persist = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const onClose = vi.fn();
    render(<ImportPreviousDietModal isOpen onClose={onClose} diets={[diet]} onPullMacrosOnly={persist} onPullAllMeals={vi.fn()} />);
    fireEvent.click(screen.getByText('Plano fonte').closest('tr')!);
    const action = screen.getByRole('button', { name: /Puxar apenas os macros/i });
    fireEvent.click(action);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(action).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
    resolve?.();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
