import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditIconButton, DeleteIconButton, IconButton } from '../IconButton';

describe('Component UI Seam: IconButton, EditIconButton & DeleteIconButton', () => {
  it('renders IconButton with custom icon and aria-label', () => {
    render(<IconButton title="Ação Personalizada" icon={<span>Icon</span>} />);
    const btn = screen.getByRole('button', { name: /ação personalizada/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders EditIconButton with default title "Editar"', () => {
    const handleClick = vi.fn();
    render(<EditIconButton onClick={handleClick} />);
    const btn = screen.getByRole('button', { name: /editar/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders DeleteIconButton with default title "Excluir"', () => {
    const handleClick = vi.fn();
    render(<DeleteIconButton onClick={handleClick} />);
    const btn = screen.getByRole('button', { name: /excluir/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
