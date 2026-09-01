import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReadyMealsPage from '@/app/refeicoes-prontas/page';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn());
vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));

describe('ready meals page canonical boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty ready-meal state after relational loading', async () => {
    getBrowserLibraryApplication.mockResolvedValue({ listReadyMeals: vi.fn().mockResolvedValue([]) });
    render(<ReadyMealsPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando refeições prontas');
    await waitFor(() => expect(screen.getByText('Nenhuma refeição cadastrada')).toBeInTheDocument());
  });
});
