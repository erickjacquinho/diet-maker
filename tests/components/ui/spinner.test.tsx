import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from '@/components/ui/spinner';

describe('Spinner', () => {
  it('exposes an accessible loading status without domain coupling', () => {
    render(<Spinner />);

    expect(screen.getByRole('status', { name: 'Loading' })).toHaveClass('animate-spin');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('allows a host to provide a localized accessible label', () => {
    render(<Spinner aria-label="Carregando pacientes" />);

    expect(screen.getByRole('status', { name: 'Carregando pacientes' })).toBeInTheDocument();
  });
});
