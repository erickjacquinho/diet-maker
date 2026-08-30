import React, { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';

function SearchShortcutHarness({ enabled = true }: { enabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut({ inputRef, enabled });

  return <input ref={inputRef} aria-label="Busca" defaultValue="texto" />;
}

describe('useSearchShortcut', () => {
  it('focuses and selects the search input with Ctrl+F', () => {
    render(<SearchShortcutHarness />);

    const input = screen.getByRole('textbox', { name: 'Busca' }) as HTMLInputElement;
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });

    expect(document.activeElement).toBe(input);
    expect(input).toHaveValue('texto');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(5);
  });

  it('also supports Cmd+F and does nothing when disabled', () => {
    const { rerender } = render(<SearchShortcutHarness />);
    const input = screen.getByRole('textbox', { name: 'Busca' }) as HTMLInputElement;

    fireEvent.keyDown(window, { key: 'f', metaKey: true });
    expect(document.activeElement).toBe(input);

    input.blur();
    rerender(<SearchShortcutHarness enabled={false} />);
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });

    expect(document.activeElement).not.toBe(input);
  });
});
