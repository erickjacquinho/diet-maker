import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';
import { EditIconButton, DeleteIconButton, IconButton } from '@/components/atoms';

describe('Button family: loading, destructive recipe and accessible name', () => {
  it('renders a spinner in loading state without losing the label and sets aria-busy', () => {
    const { container } = render(<Button loading>Salvar</Button>);
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
    expect(button.textContent).toContain('Salvar');
  });

  it('keeps the size geometry of the button while loading', () => {
    render(<Button loading size="standard">Salvar</Button>);
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toHaveClass('h-control-standard');
  });

  it('renders DeleteIconButton from the destructive recipe without local styling', () => {
    render(<DeleteIconButton />);
    const btn = screen.getByRole('button', { name: 'Excluir' });
    expect(btn).not.toHaveClass('bg-surface-subtle');
  });

  it('supports the secondary recipe for an edit icon button', () => {
    render(<EditIconButton variant="secondary" />);
    const btn = screen.getByRole('button', { name: 'Editar' });
    expect(btn).toHaveClass('border-border-control', 'bg-surface', 'text-text-primary');
  });

  it('supports the destructive outline recipe with a red hover state', () => {
    render(<DeleteIconButton variant="destructive-outline" />);
    const btn = screen.getByRole('button', { name: 'Excluir' });
    expect(btn).toHaveClass('border-error-border', 'bg-surface', 'text-error', 'hover:bg-error', 'hover:text-white');
  });

  it('rejects an icon-only button without an explicit accessible name', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<IconButton>X</IconButton>)).toThrow();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('does not fall back to a generic accessible name', () => {
    render(<EditIconButton />);
    expect(screen.queryByRole('button', { name: /botão de ação/i })).toBeNull();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });
});
