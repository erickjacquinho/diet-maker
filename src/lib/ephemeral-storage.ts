const values = new Map<string, unknown>();
const rawValues = new Map<string, string>();
let testBridge: { remove?(key: string): void; canWrite?(): boolean } | undefined;

export function getEphemeralItem<T>(key: string, fallback: T): T {
  const raw = rawValues.get(key);
  if (raw !== undefined) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  const value = values.get(key);
  return value === undefined ? fallback : structuredClone(value) as T;
}

export function setEphemeralItem<T>(key: string, value: T): void {
  rawValues.delete(key);
  values.set(key, structuredClone(value));
}

export function setEphemeralRawItem(key: string, value: string): void {
  values.delete(key);
  rawValues.set(key, value);
}

export function removeEphemeralItem(key: string): void {
  values.delete(key);
  rawValues.delete(key);
  testBridge?.remove?.(key);
}

export function registerEphemeralStorageTestBridge(bridge: { remove?(key: string): void; canWrite?(): boolean } | undefined): void {
  testBridge = bridge;
}

export function canWriteEphemeralItem(): boolean {
  return testBridge?.canWrite?.() ?? true;
}

/** Test-only reset for compatibility adapters that intentionally have no durable backing store. */
export function clearEphemeralStorage(): void {
  values.clear();
  rawValues.clear();
}
