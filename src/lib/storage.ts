/**
 * Compatibility facade for old in-memory adapters.
 *
 * Domain persistence is owned by the active `.nutridiet` file session. This
 * module intentionally has no browser storage backing and is kept only so
 * legacy helpers can be retired without breaking imports in older consumers.
 */

import { canWriteEphemeralItem, getEphemeralItem, removeEphemeralItem, setEphemeralItem } from './ephemeral-storage';

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    return getEphemeralItem(key, fallback);
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    if (!canWriteEphemeralItem()) return false;
    setEphemeralItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key: string): void {
  removeEphemeralItem(key);
}
