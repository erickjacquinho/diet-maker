import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HoldToDeleteButton } from '../Button';

describe('Component UI Seam: HoldToDeleteButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default label, trash icon and accessible attributes', () => {
    render(<HoldToDeleteButton>Excluir Paciente</HoldToDeleteButton>);

    const button = screen.getByRole('button', { name: /pressione e segure por 1,5 segundos/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Excluir Paciente');
    expect(button).toHaveClass('bg-error');

    const progressBar = screen.getByTestId('hold-progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('does not fire onConfirm on a simple instant click', () => {
    const handleConfirm = vi.fn();
    render(<HoldToDeleteButton onConfirm={handleConfirm}>Excluir</HoldToDeleteButton>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('starts hold on pointerdown and animates progress bar', () => {
    const handleConfirm = vi.fn();
    render(<HoldToDeleteButton onConfirm={handleConfirm}>Excluir</HoldToDeleteButton>);

    const button = screen.getByRole('button');
    const progressBar = screen.getByTestId('hold-progress-bar');

    fireEvent.pointerDown(button, { button: 0 });

    expect(progressBar).toHaveStyle({ width: '100%' });
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('cancels hold and does not fire onConfirm when pointerup occurs early (< 1.5s)', () => {
    const handleConfirm = vi.fn();
    render(<HoldToDeleteButton onConfirm={handleConfirm}>Excluir</HoldToDeleteButton>);

    const button = screen.getByRole('button');
    const progressBar = screen.getByTestId('hold-progress-bar');

    fireEvent.pointerDown(button, { button: 0 });
    expect(progressBar).toHaveStyle({ width: '100%' });

    // Avança 800ms (menos de 1500ms)
    act(() => {
      vi.advanceTimersByTime(800);
    });

    fireEvent.pointerUp(button);

    expect(progressBar).toHaveStyle({ width: '0%' });
    expect(handleConfirm).not.toHaveBeenCalled();

    // Avança o restante do tempo para garantir que o timer foi cancelado
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('cancels hold when pointer leaves button', () => {
    const handleConfirm = vi.fn();
    render(<HoldToDeleteButton onConfirm={handleConfirm}>Excluir</HoldToDeleteButton>);

    const button = screen.getByRole('button');
    const progressBar = screen.getByTestId('hold-progress-bar');

    fireEvent.pointerDown(button, { button: 0 });
    expect(progressBar).toHaveStyle({ width: '100%' });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    fireEvent.pointerLeave(button);
    expect(progressBar).toHaveStyle({ width: '0%' });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('fires onConfirm when held for full default duration of 1500ms', () => {
    const handleConfirm = vi.fn();
    render(<HoldToDeleteButton onConfirm={handleConfirm}>Excluir Prescrição</HoldToDeleteButton>);

    const button = screen.getByRole('button');

    fireEvent.pointerDown(button, { button: 0 });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('supports custom delayMs', () => {
    const handleConfirm = vi.fn();
    render(
      <HoldToDeleteButton onConfirm={handleConfirm} delayMs={2000}>
        Excluir
      </HoldToDeleteButton>
    );

    const button = screen.getByRole('button', { name: /pressione e segure por 2 segundos/i });

    fireEvent.pointerDown(button, { button: 0 });

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(handleConfirm).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard hold using Space key', () => {
    const handleConfirm = vi.fn();
    render(<HoldToDeleteButton onConfirm={handleConfirm}>Excluir</HoldToDeleteButton>);

    const button = screen.getByRole('button');
    const progressBar = screen.getByTestId('hold-progress-bar');

    fireEvent.keyDown(button, { key: ' ' });
    expect(progressBar).toHaveStyle({ width: '100%' });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('supports touch interaction (touchstart / touchend)', () => {
    const handleConfirm = vi.fn();
    render(<HoldToDeleteButton onConfirm={handleConfirm}>Excluir</HoldToDeleteButton>);

    const button = screen.getByRole('button');
    const progressBar = screen.getByTestId('hold-progress-bar');

    fireEvent.touchStart(button);
    expect(progressBar).toHaveStyle({ width: '100%' });

    act(() => {
      vi.advanceTimersByTime(700);
    });

    fireEvent.touchEnd(button);
    expect(progressBar).toHaveStyle({ width: '0%' });
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('does not trigger hold when disabled', () => {
    const handleConfirm = vi.fn();
    render(
      <HoldToDeleteButton onConfirm={handleConfirm} disabled>
        Excluir
      </HoldToDeleteButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.pointerDown(button, { button: 0 });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('displays holdingLabel while holding if provided', () => {
    render(
      <HoldToDeleteButton holdingLabel="Segure firme...">
        Excluir
      </HoldToDeleteButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Excluir');

    fireEvent.pointerDown(button, { button: 0 });
    expect(button).toHaveTextContent('Segure firme...');

    fireEvent.pointerUp(button);
    expect(button).toHaveTextContent('Excluir');
  });

  it('supports destructive-outline variant and compact size', () => {
    render(
      <HoldToDeleteButton variant="destructive-outline" size="compact">
        Excluir
      </HoldToDeleteButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-error');
    expect(button).toHaveClass('h-control-compact');
  });
});
