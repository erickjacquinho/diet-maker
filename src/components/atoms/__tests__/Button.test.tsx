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

  it.each(['primary', 'secondary', 'quiet', 'destructive', 'destructive-outline'] as const)('renders the normative variant %s', (variant) => {
    render(<Button variant={variant}>Ação</Button>);
    const button = screen.getByRole('button', { name: /ação/i });
    expect(button).toBeInTheDocument();
  });

  it.each(['compact', 'standard'] as const)('renders the normative size %s', (size) => {
    render(<Button size={size}>Ação</Button>);
    const button = screen.getByRole('button', { name: /ação/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a spinner in loading state without losing the label', () => {
    const { container } = render(<Button loading>Salvar</Button>);
    const button = screen.getByRole('button', { name: /salvar/i });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
    expect(button.textContent).toContain('Salvar');
  });

  it('preserves width geometry while loading', () => {
    render(<Button loading size="standard">Salvar</Button>);
    const button = screen.getByRole('button', { name: /salvar/i });
    expect(button).toHaveClass('h-control-standard');
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
