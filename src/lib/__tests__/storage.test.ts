import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStorageItem, setStorageItem, removeStorageItem } from '../storage';

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns fallback value when item does not exist', () => {
    const result = getStorageItem('non_existent_key', { test: true });
    expect(result).toEqual({ test: true });
  });

  it('saves and retrieves items correctly', () => {
    const sampleData = { name: 'João', age: 30, items: [1, 2, 3] };
    const success = setStorageItem('sample_key', sampleData);
    expect(success).toBe(true);

    const retrieved = getStorageItem('sample_key', null);
    expect(retrieved).toEqual(sampleData);
  });

  it('handles corrupted JSON gracefully by returning fallback', () => {
    localStorage.setItem('corrupted_key', '{invalid_json');
    const result = getStorageItem('corrupted_key', 'fallback_val');
    expect(result).toBe('fallback_val');
  });

  it('removes item correctly', () => {
    setStorageItem('key_to_delete', 'value');
    expect(getStorageItem('key_to_delete', null)).toBe('value');

    removeStorageItem('key_to_delete');
    expect(getStorageItem('key_to_delete', null)).toBeNull();
  });

  it('handles setItem exceptions gracefully', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    const success = setStorageItem('fail_key', 'data');
    expect(success).toBe(false);
  });
});
