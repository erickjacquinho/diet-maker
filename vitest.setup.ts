import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { clearEphemeralStorage, registerEphemeralStorageTestBridge, removeEphemeralItem, setEphemeralRawItem } from './src/lib/ephemeral-storage';

if (typeof Storage !== 'undefined') {
  const prototype = Storage.prototype as Storage & { __nutridietEphemeralBridge?: boolean };
  if (!prototype.__nutridietEphemeralBridge) {
    const nativeClear = prototype.clear;
    const nativeRemoveItem = prototype.removeItem;
    const nativeSetItem = prototype.setItem;
    prototype.clear = function clear() {
      clearEphemeralStorage();
      return nativeClear.call(this);
    };
    prototype.removeItem = function removeItem(key: string) {
      removeEphemeralItem(key);
      return nativeRemoveItem.call(this, key);
    };
    prototype.setItem = function setItem(key: string, value: string) {
      setEphemeralRawItem(key, value);
      return nativeSetItem.call(this, key, value);
    };
    prototype.__nutridietEphemeralBridge = true;
    registerEphemeralStorageTestBridge({
      remove: (key) => nativeRemoveItem.call(window.localStorage, key),
      canWrite: () => !Boolean((Storage.prototype.setItem as unknown as { mock?: unknown }).mock),
    });
  }
}

// Clear localStorage before each test run
beforeEach(() => {
  clearEphemeralStorage();
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});
