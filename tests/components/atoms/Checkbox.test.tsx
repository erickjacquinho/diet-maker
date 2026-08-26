import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '@/components/atoms/Checkbox';

describe('Checkbox atom', () => {
  it('renders in unchecked state with aria-checked="false"', () => {
    render(<Checkbox aria-label="Opção A" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Opção A' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(checkbox).not.toHaveClass('bg-primary');
  });

  it('renders in checked state with aria-checked="true" and primary styling', () => {
    render(<Checkbox checked={true} aria-label="Opção B" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Opção B' });
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox).toHaveClass('bg-primary', 'text-on-primary');
  });

  it('renders in indeterminate state with aria-checked="mixed"', () => {
    render(<Checkbox checked="indeterminate" aria-label="Selecionar todos" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Selecionar todos' });
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect(checkbox).toHaveClass('bg-primary-soft', 'text-primary');
  });

  it('calls onCheckedChange when clicked', () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox checked={false} onCheckedChange={handleCheckedChange} aria-label="Item" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Item' });

    fireEvent.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('toggles from checked to unchecked on click', () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox checked={true} onCheckedChange={handleCheckedChange} aria-label="Item" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Item' });

    fireEvent.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(false);
  });

  it('handles keyboard navigation (Space / Enter)', () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox checked={false} onCheckedChange={handleCheckedChange} aria-label="Item Teclado" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Item Teclado' });

    fireEvent.keyDown(checkbox, { key: ' ' });
    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(checkbox, { key: 'Enter' });
    expect(handleCheckedChange).toHaveBeenCalledTimes(2);
  });

  it('does not trigger onCheckedChange when disabled', () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox disabled checked={false} onCheckedChange={handleCheckedChange} aria-label="Item Desabilitado" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Item Desabilitado' });

    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass('opacity-disabled', 'cursor-not-allowed');

    fireEvent.click(checkbox);
    expect(handleCheckedChange).not.toHaveBeenCalled();
  });
});
