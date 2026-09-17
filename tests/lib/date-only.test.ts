import { describe, expect, it } from 'vitest';

import {
  formatAgeFromBirthDate,
  formatDateOnly,
  getAgeFromBirthDate,
  parseDateOnly,
  serializeDateOnly,
} from '@/lib/date-only';

describe('date-only helpers', () => {
  it('parses valid calendar dates without timezone conversion', () => {
    const date = parseDateOnly('2026-08-03');

    expect(date).toBeInstanceOf(Date);
    expect(date && date.getFullYear()).toBe(2026);
    expect(date && date.getMonth()).toBe(7);
    expect(date && date.getDate()).toBe(3);
    expect(serializeDateOnly(date)).toBe('2026-08-03');
  });

  it('rejects empty, malformed and impossible dates', () => {
    expect(parseDateOnly()).toBeUndefined();
    expect(parseDateOnly('')).toBeUndefined();
    expect(parseDateOnly('2026-8-3')).toBeUndefined();
    expect(parseDateOnly('2026-02-30')).toBeUndefined();
    expect(parseDateOnly('not-a-date')).toBeUndefined();
    expect(serializeDateOnly(undefined)).toBe('');
    expect(formatDateOnly('2026-02-30')).toBe('');
  });

  it('formats boundary dates in the pt-BR presentation format', () => {
    expect(formatDateOnly('1900-01-01')).toBe('01/01/1900');
    expect(formatDateOnly('2099-12-31')).toBe('31/12/2099');
  });

  it('calculates age from the birth date and rejects missing or future dates', () => {
    const today = parseDateOnly('2026-09-15')!;

    expect(getAgeFromBirthDate('2000-09-15', today)).toBe(26);
    expect(getAgeFromBirthDate('2000-09-16', today)).toBe(25);
    expect(getAgeFromBirthDate(undefined, today)).toBeNull();
    expect(getAgeFromBirthDate('2026-09-16', today)).toBeNull();
  });

  it('formats age as years and completed months', () => {
    const today = parseDateOnly('2026-09-15')!;

    expect(formatAgeFromBirthDate('1997-04-05', today)).toBe('29a 5m');
    expect(formatAgeFromBirthDate('2026-09-16', today)).toBe('');
  });
});
