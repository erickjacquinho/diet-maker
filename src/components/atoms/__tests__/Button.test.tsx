import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, CreateButton, SecondaryActionButton } from '../Button';

describe('Component UI Seam: Button', () => {
  it('renders button children content correctly', () => {
    render(<Button>Salvar Paciente</Button>);
    expect(screen.getByRole('button', { name: /salvar paciente/i })).toBeInTheDocument();
  });

  it('handles click events properly', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique Aqui</Button>);

    const button = screen.getByRole('button', { name: /clique aqui/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className alongside default styles', () => {
    render(<Button className="custom-class">Teste</Button>);
    const button = screen.getByRole('button', { name: /teste/i });
    expect(button).toHaveClass('custom-class');
  });

  it('renders CreateButton with icon and handles click', () => {
    const handleClick = vi.fn();
    render(<CreateButton onClick={handleClick}>Nova Dieta</CreateButton>);
    const btn = screen.getByRole('button', { name: /nova dieta/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders SecondaryActionButton and handles click', () => {
    const handleClick = vi.fn();
    render(<SecondaryActionButton onClick={handleClick}>Escalar Dieta</SecondaryActionButton>);
    const btn = screen.getByRole('button', { name: /escalar dieta/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
