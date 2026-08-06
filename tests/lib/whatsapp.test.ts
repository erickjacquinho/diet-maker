import { describe, expect, it } from 'vitest';
import { formatWhatsappContact, getWhatsappUrl } from '@/lib/whatsapp';

describe('WhatsApp contact formatting', () => {
  it('formats a Brazilian mobile number as the user types', () => {
    expect(formatWhatsappContact('11999999999')).toBe('(11) 99999-9999');
  });

  it('formats a Brazilian landline with four digits in the subscriber prefix', () => {
    expect(formatWhatsappContact('1133334444')).toBe('(11) 3333-4444');
  });

  it('removes the country code from the visible formatted value', () => {
    expect(formatWhatsappContact('+55 (11) 99999-9999')).toBe('(11) 99999-9999');
  });

  it('returns a wa.me URL with country code for a local number', () => {
    expect(getWhatsappUrl('(11) 99999-9999')).toBe('https://wa.me/5511999999999');
  });

  it('does not duplicate an existing country code', () => {
    expect(getWhatsappUrl('+55 11 99999-9999')).toBe('https://wa.me/5511999999999');
  });

  it('rejects empty and incomplete contacts', () => {
    expect(getWhatsappUrl('')).toBeNull();
    expect(getWhatsappUrl('(11) 9999-999')).toBeNull();
  });
});
