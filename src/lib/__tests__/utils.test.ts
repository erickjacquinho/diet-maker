import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('Utility Seam: cn()', () => {
  it('combines simple class names', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('handles conditional class names properly', () => {
    const isTrue = true;
    const isFalse = false;
    const result = cn('base', isTrue && 'active', isFalse && 'disabled', null, undefined);
    expect(result).toBe('base active');
  });

  it('resolves conflicting Tailwind CSS classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });
});
