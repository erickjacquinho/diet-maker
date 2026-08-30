import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditIconButton, DeleteIconButton, SubstituteIconButton, DuplicateIconButton, IconButton } from '../IconButton';

describe('Component UI Seam: IconButton, EditIconButton, DeleteIconButton & SubstituteIconButton', () => {
  it('renders IconButton with custom icon and aria-label', () => {
    render(<IconButton title="Ação Personalizada" icon={<span>Icon</span>} />);
    const btn = screen.getByRole('button', { name: /ação personalizada/i });
    expect(btn).toBeInTheDocument();
  });

  it('requires an explicit accessible name without generic fallback', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<IconButton icon={<span>Icon</span>} />)).toThrow();
    } finally {
      errorSpy.mockRestore();
    }
    expect(screen.queryByRole('button', { name: /botão de ação/i })).toBeNull();
  });

  it('renders EditIconButton with default title "Editar"', () => {
    const handleClick = vi.fn();
    render(<EditIconButton onClick={handleClick} />);
    const btn = screen.getByRole('button', { name: /editar/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders DeleteIconButton with destructive-outline styling (subtle red border, red hover with white icon)', () => {
    render(<DeleteIconButton />);
    const btn = screen.getByRole('button', { name: /excluir/i });
    expect(btn.className).toContain('border-error-border');
    expect(btn.className).toContain('text-error');
    expect(btn.className).toContain('hover:bg-error');
    expect(btn.className).toContain('hover:text-white');
  });

  it('renders SubstituteIconButton muted by default and visible on hover', () => {
    const handleClick = vi.fn();
    render(<SubstituteIconButton onClick={handleClick} />);
    const btn = screen.getByRole('button', { name: /substituir alimento/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('border-border-subtle');
    expect(btn.className).toContain('text-text-muted');
    expect(btn.className).toContain('hover:border-button-secondary-border-hover');
    expect(btn.className).toContain('hover:bg-button-secondary-hover');
    expect(btn.className).toContain('hover:text-text-primary');

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders DuplicateIconButton as a muted outlined action', () => {
    render(<DuplicateIconButton />);
    const btn = screen.getByRole('button', { name: /duplicar alimento/i });

    expect(btn.className).toContain('border-border-subtle');
    expect(btn.className).toContain('text-text-muted');
    expect(btn.className).toContain('hover:bg-button-secondary-hover');
  });
});
