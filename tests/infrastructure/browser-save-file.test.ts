import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserSaveFilePort, inspectAssociatedSaveFile } from '@/lib/infrastructure/file-system-access/browser-save-file';
import type { SaveFileAssociationIdentity } from '@/lib/persistence/save-file';

const owners = [
  '0f2a6172-e8ab-4a56-b4fc-cc554e77d1c1',
  'a81c6651-b45d-4b52-9dcc-a4168ea10bc5',
];
const saves = [
  '1fe5bc65-c780-44b4-9979-7f5d5bb33f63',
  '507fcd50-23b5-4bb8-833a-75b42e97f7ef',
];

function handle(name: string, content = '') {
  return {
    kind: 'file' as const,
    name,
    getFile: async () => ({ text: async () => content }),
    queryPermission: vi.fn(async (_options?: { mode?: 'read' | 'readwrite' }) => 'granted' as 'granted' | 'denied' | 'prompt'),
    requestPermission: vi.fn(async (_options?: { mode?: 'read' | 'readwrite' }) => 'granted' as 'granted' | 'denied' | 'prompt'),
    createWritable: vi.fn(async () => ({ write: vi.fn(async (_content: string): Promise<void> => undefined), close: vi.fn(async (): Promise<void> => undefined) })),
    isSameEntry: vi.fn(async (_other: unknown) => false),
  };
}

function identity(ownerId: string, saveId: string): SaveFileAssociationIdentity {
  return { ownerId, saveId };
}

describe('BrowserSaveFilePort associations', () => {
  it('recognizes the expected protected header without granting clinical access', async () => {
    const proof = 'v1:test-key:' + 'A'.repeat(43);
    const header = { appId: 'nutridiet-local-pro', formatVersion: 2, saveId: saves[0], algorithm: 'AES-256-GCM', bindingProof: proof, iv: 'A'.repeat(16), ciphertext: 'A'.repeat(24) };
    const port = new BrowserSaveFilePort();
    const association = { ...identity(owners[0], saves[0]), localAccountId: 'clinical-account', bindingProof: proof, file: wrap(handle('same-name.nutridiet', JSON.stringify(header))) };
    await expect(inspectAssociatedSaveFile(port, association)).resolves.toBe('located');
    await expect(inspectAssociatedSaveFile(port, { ...association, saveId: saves[1] })).resolves.toBe('incompatible');
    await expect(inspectAssociatedSaveFile(port, { ...association, bindingProof: 'v1:other:' + 'A'.repeat(43) })).resolves.toBe('incompatible');
    await expect(inspectAssociatedSaveFile(port, { ...association, file: wrap(handle('same-name.nutridiet', '{}')) })).resolves.toBe('incompatible');
    const inaccessible = handle('same-name.nutridiet');
    inaccessible.queryPermission.mockResolvedValue('prompt');
    await expect(inspectAssociatedSaveFile(port, { ...association, file: wrap(inaccessible) })).resolves.toBe('permission-required');
    const missing = handle('same-name.nutridiet');
    missing.getFile = async () => { throw new DOMException('Missing', 'NotFoundError'); };
    await expect(inspectAssociatedSaveFile(port, { ...association, file: wrap(missing) })).resolves.toBe('reference-lost');
  });
  beforeEach(() => vi.stubGlobal('indexedDB', createInMemoryIndexedDb()));

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker;
    delete (window as unknown as { showOpenFilePicker?: unknown }).showOpenFilePicker;
    localStorage.clear();
  });

  it('persists distinct handles by owner/save and clears only the selected association', async () => {
    const firstHandle = handle('first.nutridiet', 'first clinical content');
    const secondHandle = handle('second.nutridiet', 'second clinical content');
    const port = new BrowserSaveFilePort();

    await port.persistFileAssociation(identity(owners[0], saves[0]), wrap(firstHandle), {
      localAccountId: 'clinical-account-1',
      idempotencyKey: 'f69ec751-e4f9-4813-ad59-f2fe7528ea4e',
      bindingProof: 'v1:test-key:' + 'A'.repeat(43),
      key: 'must not persist',
      ciphertext: 'clinical payload must not persist',
    } as never);
    await port.persistFileAssociation(identity(owners[1], saves[1]), wrap(secondHandle), {
      localAccountId: 'clinical-account-2',
    });

    const first = await port.restoreFileAssociation(identity(owners[0], saves[0]));
    const second = await port.restoreFileAssociation(identity(owners[1], saves[1]));
    expect(first).toMatchObject({
      ownerId: owners[0],
      saveId: saves[0],
      localAccountId: 'clinical-account-1',
      idempotencyKey: 'f69ec751-e4f9-4813-ad59-f2fe7528ea4e',
      bindingProof: 'v1:test-key:' + 'A'.repeat(43),
      file: { name: 'first.nutridiet' },
    });
    expect(first).not.toHaveProperty('key');
    expect(first).not.toHaveProperty('ciphertext');
    expect(second?.file.name).toBe('second.nutridiet');
    expect(await port.restoreFileAssociation(identity(owners[0], saves[1]))).toBeNull();
    expect(await port.read(first!.file)).toBe('first clinical content');
    expect(await port.read(second!.file)).toBe('second clinical content');

    await port.clearFileAssociation(identity(owners[0], saves[0]));
    expect(await port.restoreFileAssociation(identity(owners[0], saves[0]))).toBeNull();
    expect((await port.restoreFileAssociation(identity(owners[1], saves[1])))?.file.name).toBe('second.nutridiet');
  });

  it('compares handles by their browser identity, not by filename', async () => {
    const firstHandle = handle('same-name.nutridiet');
    const otherHandle = handle('different-name.nutridiet');
    const sameNameDifferentEntry = handle('same-name.nutridiet');
    const port = new BrowserSaveFilePort();
    (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<unknown> }).showSaveFilePicker = vi
      .fn()
      .mockResolvedValueOnce(firstHandle)
      .mockResolvedValueOnce(otherHandle)
      .mockResolvedValueOnce(sameNameDifferentEntry);

    const first = await port.chooseNew();
    const other = await port.chooseNew();
    const duplicateName = await port.chooseNew();
    firstHandle.isSameEntry = vi.fn(async (candidate: unknown) => candidate === otherHandle);

    expect(await port.isSameEntry(first!, other!)).toBe(true);
    expect(await port.isSameEntry(first!, duplicateName!)).toBe(false);
  });

  it('keeps registration retry identifiers and source reference without storing key material', async () => {
    const target = wrap(handle('protected-copy.nutridiet'));
    const source = wrap(handle('legacy-original.nutridiet'));
    const port = new BrowserSaveFilePort();
    await port.persistPendingRegistration({
      ownerId: owners[0],
      localAccountId: 'legacy-account-id',
      idempotencyKey: 'df60cf5c-6bde-472a-a7d5-b3b5626aa610',
      file: target,
      sourceFile: source,
      key: 'never stored',
    } as never);

    const restored = await port.restorePendingRegistration(owners[0], 'legacy-account-id');
    expect(restored).toMatchObject({
      ownerId: owners[0],
      localAccountId: 'legacy-account-id',
      idempotencyKey: 'df60cf5c-6bde-472a-a7d5-b3b5626aa610',
      file: { name: 'protected-copy.nutridiet' },
      sourceFile: { name: 'legacy-original.nutridiet' },
    });
    expect(restored).not.toHaveProperty('key');
    expect(await port.listPendingRegistrations(owners[0])).toHaveLength(1);
    await port.clearPendingRegistration(owners[0], 'legacy-account-id');
    expect(await port.restorePendingRegistration(owners[0], 'legacy-account-id')).toBeNull();
  });

  it('requests write permission only when explicitly asked for a selected handle', async () => {
    const selected = handle('explicit.nutridiet');
    (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<unknown> }).showSaveFilePicker = vi.fn().mockResolvedValue(selected);
    const port = new BrowserSaveFilePort();
    const file = await port.chooseNew();

    expect(selected.requestPermission).not.toHaveBeenCalled();
    selected.queryPermission.mockResolvedValueOnce('prompt');
    await expect(port.queryPermission(file!, 'read')).resolves.toBe('prompt');
    await expect(port.requestWritePermission(file!)).resolves.toBe('granted');
    expect(selected.requestPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
  });

  it('closes after a successful write and aborts rather than committing a failed write', async () => {
    const selected = handle('write.nutridiet');
    (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<unknown> }).showSaveFilePicker = vi.fn().mockResolvedValue(selected);
    const port = new BrowserSaveFilePort();
    const file = await port.chooseNew();
    const writeOrder: string[] = [];
    const writable = {
      write: vi.fn(async () => { writeOrder.push('write'); }),
      close: vi.fn(async () => { writeOrder.push('close'); }),
      abort: vi.fn(async () => { writeOrder.push('abort'); }),
    };
    selected.createWritable.mockResolvedValue(writable as never);

    await port.write(file!, 'encrypted envelope');
    expect(writeOrder).toEqual(['write', 'close']);

    writeOrder.length = 0;
    writable.write.mockRejectedValueOnce(new Error('disk full'));
    await expect(port.write(file!, 'partial envelope')).rejects.toThrow('disk full');
    expect(writeOrder).toEqual(['abort']);

    writeOrder.length = 0;
    writable.write.mockImplementationOnce(async () => { writeOrder.push('write'); });
    writable.close.mockImplementationOnce(async () => { writeOrder.push('close'); throw new Error('close failed'); });
    await expect(port.write(file!, 'uncertain envelope')).rejects.toThrow('close failed');
    expect(writeOrder).toEqual(['write', 'close', 'abort']);
  });
});

function wrap(fileHandle: ReturnType<typeof handle>) {
  return { name: fileHandle.name, handle: fileHandle } as never;
}

function createInMemoryIndexedDb(): IDBFactory {
  const databases = new Map<string, { version: number; stores: Map<string, Map<IDBValidKey, unknown>> }>();
  return {
    open(name: string, version = 1) {
      const request: Record<string, unknown> = { result: undefined, error: null };
      queueMicrotask(() => {
        let database = databases.get(name);
        const isNew = !database;
        if (!database) {
          database = { version: 0, stores: new Map() };
          databases.set(name, database);
        }
        const opened = database;
        const db = {
          objectStoreNames: { contains: (store: string) => opened.stores.has(store) },
          createObjectStore: (store: string) => opened.stores.set(store, new Map()),
          transaction: (store: string) => {
            const transaction: Record<string, unknown> = {
              error: null,
              objectStore: () => {
                const records = opened.stores.get(store)!;
                const execute = <T>(action: () => T) => runRequest(requestFor<unknown>(undefined), action, () => {
                  (transaction.oncomplete as (() => void) | undefined)?.();
                });
                return {
                  put: (value: unknown, key: IDBValidKey) => execute(() => { records.set(key, value); return undefined; }),
                  get: (key: IDBValidKey) => execute(() => records.get(key)),
                  getAll: () => execute(() => [...records.values()]),
                  delete: (key: IDBValidKey) => execute(() => { records.delete(key); return undefined; }),
                };
              },
            };
            return transaction;
          },
          close: () => undefined,
        };
        request.result = db;
        if (isNew || opened.version < version) {
          opened.version = version;
          (request.onupgradeneeded as (() => void) | undefined)?.();
        }
        (request.onsuccess as (() => void) | undefined)?.();
      });
      return request as unknown as IDBOpenDBRequest;
    },
  } as unknown as IDBFactory;
}

function requestFor<T>(initial: T): IDBRequest<T> {
  return { result: initial } as IDBRequest<T>;
}

function runRequest<T>(request: IDBRequest<T>, action: () => T, onComplete: () => void): IDBRequest<T> {
  queueMicrotask(() => {
    (request as { result: T }).result = action();
    request.onsuccess?.(new Event('success') as never);
    queueMicrotask(onComplete);
  });
  return request;
}
