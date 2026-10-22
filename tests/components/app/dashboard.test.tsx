import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DashboardPage from '@/app/dashboard/page';

describe('DashboardPage', () => {
  it('opens Settings Saves without duplicating file management on the home page', () => {
    const openSaves = vi.fn();
    window.addEventListener('nutridiet:open-saves', openSaves);
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Início' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir configurações de saves' }));
    expect(openSaves).toHaveBeenCalledOnce();
    window.removeEventListener('nutridiet:open-saves', openSaves);
  });
});
