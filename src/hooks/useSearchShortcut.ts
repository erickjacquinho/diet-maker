import { useEffect } from 'react';
import type { RefObject } from 'react';

export interface UseSearchShortcutOptions {
  inputRef: RefObject<HTMLInputElement | null>;
  enabled?: boolean;
}

/**
 * Focuses and selects a search input when Ctrl+F or Cmd+F is pressed.
 */
export function useSearchShortcut({ inputRef, enabled = true }: UseSearchShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleSearchShortcut = (event: KeyboardEvent) => {
      const isFKey = event.key.toLowerCase() === 'f' || event.code === 'KeyF';
      if (!(event.ctrlKey || event.metaKey) || !isFKey) return;

      event.preventDefault();
      event.stopPropagation();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    window.addEventListener('keydown', handleSearchShortcut, true);
    return () => window.removeEventListener('keydown', handleSearchShortcut, true);
  }, [enabled, inputRef]);
}
