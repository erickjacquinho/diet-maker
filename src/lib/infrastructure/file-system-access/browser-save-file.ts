import type {
  SaveFileAssociation,
  SaveFileAssociationIdentity,
  PendingSaveRegistration,
  SaveFile,
  SaveFilePermission,
  SaveFilePermissionMode,
  SaveFilePort,
  SaveFileRetryMetadata,
} from '@/lib/persistence/save-file';
import { parseBindingProof, parseProtectedSaveEnvelope } from '@/lib/domain/protected-save';

export async function inspectAssociatedSaveFile(port: SaveFilePort, association: SaveFileAssociation): Promise<'located' | 'permission-required' | 'reference-lost' | 'incompatible'> {
  try {
    const permission = await port.queryPermission?.(association.file, 'readwrite');
    if (permission && permission !== 'granted') return 'permission-required';
    const envelope = parseProtectedSaveEnvelope(JSON.parse(await port.read(association.file)));
    return envelope.saveId === association.saveId && envelope.bindingProof === association.bindingProof
      ? 'located' : 'incompatible';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') return 'permission-required';
    if (error instanceof DOMException && error.name === 'NotFoundError') return 'reference-lost';
    return 'incompatible';
  }
}

interface WritableFile {
  write(content: string): Promise<void>;
  close(): Promise<void>;
  abort?(): Promise<void>;
}

interface BrowserFileHandle {
  readonly name: string;
  getFile(): Promise<{ text(): Promise<string> }>;
  queryPermission?(options?: { mode?: SaveFilePermissionMode }): Promise<SaveFilePermission>;
  requestPermission(options?: { mode?: 'read' | 'readwrite' }): Promise<SaveFilePermission>;
  createWritable(): Promise<WritableFile>;
  isSameEntry?(other: BrowserFileHandle): Promise<boolean>;
}

interface BrowserFile extends SaveFile {
  readonly handle: BrowserFileHandle;
}

interface BrowserFilePickerWindow {
  showOpenFilePicker(options?: unknown): Promise<BrowserFileHandle[]>;
  showSaveFilePicker(options?: unknown): Promise<BrowserFileHandle>;
}

interface StoredBrowserFile {
  readonly name: string;
  readonly handle: BrowserFileHandle;
}

interface StoredSaveFileAssociation {
  readonly kind: 'save';
  readonly ownerId: string;
  readonly saveId: string;
  readonly localAccountId: string;
  readonly idempotencyKey?: string;
  readonly bindingProof?: string;
  readonly name: string;
  readonly handle: BrowserFileHandle;
}

interface StoredPendingRegistration {
  readonly kind: 'pending';
  readonly ownerId: string;
  readonly localAccountId: string;
  readonly idempotencyKey: string;
  readonly name: string;
  readonly handle: BrowserFileHandle;
  readonly sourceName?: string;
  readonly sourceHandle?: BrowserFileHandle;
}

const fileType = {
  description: 'NutriDiet profile',
  accept: { 'application/json': ['.nutridiet'] },
};

const ACTIVE_FILE_DATABASE = 'nutridiet-profile-session-v1';
const ACTIVE_FILE_STORE = 'active-file';
const SAVE_FILE_ASSOCIATIONS_STORE = 'save-file-associations';
const ACTIVE_FILE_KEY = 'current';
const ACTIVE_FILE_METADATA_KEY = 'nutridiet.active-profile-file';
const DATABASE_VERSION = 2;
const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function pickerWindow(): BrowserFilePickerWindow {
  if (typeof window === 'undefined') throw new Error('O seletor de arquivos só está disponível no navegador.');
  return window as unknown as BrowserFilePickerWindow;
}

function isCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function asFile(handle: BrowserFileHandle): BrowserFile {
  return { name: handle.name, handle };
}

function asBrowserFile(file: SaveFile): BrowserFile {
  const candidate = file as Partial<BrowserFile>;
  if (!candidate.handle || typeof candidate.handle.getFile !== 'function') {
    throw new Error('O arquivo selecionado não possui uma referência persistível.');
  }
  return candidate as BrowserFile;
}

function associationKey(identity: SaveFileAssociationIdentity): string {
  if (!uuidPattern.test(identity.ownerId) || !uuidPattern.test(identity.saveId)) {
    throw new TypeError('A identidade do save é inválida.');
  }
  return `v1:${identity.ownerId}:${identity.saveId}`;
}

function pendingRegistrationKey(ownerId: string, localAccountId: string): string {
  if (!uuidPattern.test(ownerId) || typeof localAccountId !== 'string' || localAccountId.trim().length === 0) {
    throw new TypeError('A identidade do registro pendente é inválida.');
  }
  return `pending:v1:${ownerId}:${localAccountId}`;
}

function validateRetryMetadata(retry: SaveFileRetryMetadata): void {
  if (typeof retry.localAccountId !== 'string' || retry.localAccountId.trim().length === 0) {
    throw new TypeError('A Conta clínica local é inválida.');
  }
  if (retry.idempotencyKey !== undefined && !uuidPattern.test(retry.idempotencyKey)) {
    throw new TypeError('A identidade de repetição é inválida.');
  }
  if (retry.bindingProof !== undefined && !parseBindingProof(retry.bindingProof)) {
    throw new TypeError('A prova do vínculo é inválida.');
  }
}

function isPendingRegistration(
  value: unknown,
  ownerId: string,
  localAccountId?: string,
): value is StoredPendingRegistration {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<StoredPendingRegistration>;
  return record.kind === 'pending'
    && record.ownerId === ownerId
    && (localAccountId === undefined || record.localAccountId === localAccountId)
    && typeof record.localAccountId === 'string'
    && uuidPattern.test(record.idempotencyKey ?? '')
    && typeof record.name === 'string'
    && typeof record.handle?.getFile === 'function'
    && (record.sourceHandle === undefined || typeof record.sourceHandle.getFile === 'function');
}

function toPendingRegistration(record: StoredPendingRegistration): PendingSaveRegistration {
  return {
    ownerId: record.ownerId,
    localAccountId: record.localAccountId,
    idempotencyKey: record.idempotencyKey,
    file: asFile(record.handle),
    ...(record.sourceHandle ? { sourceFile: asFile(record.sourceHandle) } : {}),
  };
}

function openActiveFileDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(ACTIVE_FILE_DATABASE, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(ACTIVE_FILE_STORE)) {
        request.result.createObjectStore(ACTIVE_FILE_STORE);
      }
      if (!request.result.objectStoreNames.contains(SAVE_FILE_ASSOCIATIONS_STORE)) {
        request.result.createObjectStore(SAVE_FILE_ASSOCIATIONS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function updateActiveFileMetadata(name: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_FILE_METADATA_KEY, JSON.stringify({ version: 1, name }));
    }
  } catch {
    // localStorage is only a metadata hint; the handle remains canonical.
  }
}

function removeActiveFileMetadata(): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(ACTIVE_FILE_METADATA_KEY);
  } catch {
    // Ignore storage restrictions; the IndexedDB association is independent.
  }
}

async function persistBrowserFile(file: BrowserFile): Promise<void> {
  const database = await openActiveFileDatabase();
  if (!database) return;

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(ACTIVE_FILE_STORE, 'readwrite');
      transaction.objectStore(ACTIVE_FILE_STORE).put(
        { name: file.name, handle: file.handle } satisfies StoredBrowserFile,
        ACTIVE_FILE_KEY,
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível persistir o arquivo ativo.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível persistir o arquivo ativo.'));
    });
    updateActiveFileMetadata(file.name);
  } finally {
    database.close();
  }
}

async function restoreBrowserFile(): Promise<BrowserFile | null> {
  const database = await openActiveFileDatabase();
  if (!database) return null;

  try {
    const stored = await new Promise<StoredBrowserFile | undefined>((resolve, reject) => {
      const transaction = database.transaction(ACTIVE_FILE_STORE, 'readonly');
      const request = transaction.objectStore(ACTIVE_FILE_STORE).get(ACTIVE_FILE_KEY);
      request.onsuccess = () => resolve(request.result as StoredBrowserFile | undefined);
      request.onerror = () => reject(request.error ?? new Error('Não foi possível recuperar o arquivo ativo.'));
    });
    if (!stored?.handle || typeof stored.handle.getFile !== 'function') return null;
    return asFile(stored.handle);
  } catch {
    return null;
  } finally {
    database.close();
  }
}

async function clearPersistedBrowserFile(): Promise<void> {
  const database = await openActiveFileDatabase();
  if (!database) {
    removeActiveFileMetadata();
    return;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(ACTIVE_FILE_STORE, 'readwrite');
      transaction.objectStore(ACTIVE_FILE_STORE).delete(ACTIVE_FILE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível limpar o arquivo ativo.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível limpar o arquivo ativo.'));
    });
  } finally {
    database.close();
    removeActiveFileMetadata();
  }
}

export class BrowserSaveFilePort implements SaveFilePort {
  async chooseExisting(): Promise<SaveFile | null> {
    try {
      const handles = await pickerWindow().showOpenFilePicker({
        multiple: false,
        types: [fileType],
        excludeAcceptAllOption: false,
      });
      return handles[0] ? asFile(handles[0]) : null;
    } catch (error) {
      if (isCancelled(error)) return null;
      throw error;
    }
  }

  async chooseNew(): Promise<SaveFile | null> {
    try {
      const handle = await pickerWindow().showSaveFilePicker({
        suggestedName: 'nutridiet-profile.nutridiet',
        types: [fileType],
        excludeAcceptAllOption: false,
      });
      return asFile(handle);
    } catch (error) {
      if (isCancelled(error)) return null;
      throw error;
    }
  }

  async read(file: SaveFile): Promise<string> {
    const browserFile = file as BrowserFile;
    return (await browserFile.handle.getFile()).text();
  }

  async requestWritePermission(file: SaveFile): Promise<SaveFilePermission> {
    const browserFile = file as BrowserFile;
    return browserFile.handle.requestPermission({ mode: 'readwrite' });
  }

  async write(file: SaveFile, content: string): Promise<void> {
    const browserFile = asBrowserFile(file);
    const writable = await browserFile.handle.createWritable();
    try {
      await writable.write(content);
      await writable.close();
    } catch (error) {
      try {
        await writable.abort?.();
      } catch {
        // Preserve the original write/close failure.
      }
      throw error;
    }
  }

  async persistFileAssociation(
    identity: SaveFileAssociationIdentity,
    file: SaveFile,
    retry: SaveFileRetryMetadata,
  ): Promise<void> {
    const key = associationKey(identity);
    validateRetryMetadata(retry);
    const browserFile = asBrowserFile(file);
    const database = await openActiveFileDatabase();
    if (!database) throw new Error('O navegador não disponibilizou o armazenamento local de referências.');

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(SAVE_FILE_ASSOCIATIONS_STORE, 'readwrite');
        transaction.objectStore(SAVE_FILE_ASSOCIATIONS_STORE).put({
          kind: 'save',
          ownerId: identity.ownerId,
          saveId: identity.saveId,
          localAccountId: retry.localAccountId,
          ...(retry.idempotencyKey ? { idempotencyKey: retry.idempotencyKey } : {}),
          ...(retry.bindingProof ? { bindingProof: retry.bindingProof } : {}),
          name: browserFile.name,
          handle: browserFile.handle,
        } satisfies StoredSaveFileAssociation, key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível persistir a referência do save.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível persistir a referência do save.'));
      });
    } finally {
      database.close();
    }
  }

  async restoreFileAssociation(identity: SaveFileAssociationIdentity): Promise<SaveFileAssociation | null> {
    const key = associationKey(identity);
    const database = await openActiveFileDatabase();
    if (!database) return null;

    try {
      const stored = await new Promise<StoredSaveFileAssociation | undefined>((resolve, reject) => {
        const transaction = database.transaction(SAVE_FILE_ASSOCIATIONS_STORE, 'readonly');
        const request = transaction.objectStore(SAVE_FILE_ASSOCIATIONS_STORE).get(key);
        request.onsuccess = () => resolve(request.result as StoredSaveFileAssociation | undefined);
        request.onerror = () => reject(request.error ?? new Error('Não foi possível recuperar a referência do save.'));
      });
      if (
        !stored
        || stored.kind !== 'save'
        || stored.ownerId !== identity.ownerId
        || stored.saveId !== identity.saveId
        || typeof stored.localAccountId !== 'string'
        || typeof stored.name !== 'string'
        || !stored.handle
        || typeof stored.handle.getFile !== 'function'
      ) return null;
      const retry = {
        localAccountId: stored.localAccountId,
        ...(stored.idempotencyKey ? { idempotencyKey: stored.idempotencyKey } : {}),
        ...(stored.bindingProof ? { bindingProof: stored.bindingProof } : {}),
      };
      try {
        validateRetryMetadata(retry);
      } catch {
        return null;
      }
      return { ...identity, ...retry, file: asFile(stored.handle) };
    } finally {
      database.close();
    }
  }

  async persistPendingRegistration(attempt: PendingSaveRegistration): Promise<void> {
    const key = pendingRegistrationKey(attempt.ownerId, attempt.localAccountId);
    validateRetryMetadata(attempt);
    if (!attempt.idempotencyKey || !uuidPattern.test(attempt.idempotencyKey)) {
      throw new TypeError('A identidade de repetição é inválida.');
    }
    const file = asBrowserFile(attempt.file);
    const source = attempt.sourceFile ? asBrowserFile(attempt.sourceFile) : undefined;
    const database = await openActiveFileDatabase();
    if (!database) throw new Error('O navegador não disponibilizou o armazenamento local de tentativas.');
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(SAVE_FILE_ASSOCIATIONS_STORE, 'readwrite');
        transaction.objectStore(SAVE_FILE_ASSOCIATIONS_STORE).put({
          kind: 'pending',
          ownerId: attempt.ownerId,
          localAccountId: attempt.localAccountId,
          idempotencyKey: attempt.idempotencyKey,
          name: file.name,
          handle: file.handle,
          ...(source ? { sourceName: source.name, sourceHandle: source.handle } : {}),
        } satisfies StoredPendingRegistration, key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível persistir a tentativa do save.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível persistir a tentativa do save.'));
      });
    } finally {
      database.close();
    }
  }

  async restorePendingRegistration(ownerId: string, localAccountId: string): Promise<PendingSaveRegistration | null> {
    const key = pendingRegistrationKey(ownerId, localAccountId);
    const database = await openActiveFileDatabase();
    if (!database) return null;
    try {
      const stored = await new Promise<StoredPendingRegistration | undefined>((resolve, reject) => {
        const transaction = database.transaction(SAVE_FILE_ASSOCIATIONS_STORE, 'readonly');
        const request = transaction.objectStore(SAVE_FILE_ASSOCIATIONS_STORE).get(key);
        request.onsuccess = () => resolve(request.result as StoredPendingRegistration | undefined);
        request.onerror = () => reject(request.error ?? new Error('Não foi possível recuperar a tentativa do save.'));
      });
      return stored && isPendingRegistration(stored, ownerId, localAccountId)
        ? toPendingRegistration(stored)
        : null;
    } finally {
      database.close();
    }
  }

  async listPendingRegistrations(ownerId: string): Promise<PendingSaveRegistration[]> {
    if (!uuidPattern.test(ownerId)) throw new TypeError('A identidade da conta é inválida.');
    const database = await openActiveFileDatabase();
    if (!database) return [];
    try {
      const records = await new Promise<unknown[]>((resolve, reject) => {
        const transaction = database.transaction(SAVE_FILE_ASSOCIATIONS_STORE, 'readonly');
        const request = transaction.objectStore(SAVE_FILE_ASSOCIATIONS_STORE).getAll();
        request.onsuccess = () => resolve(request.result as unknown[]);
        request.onerror = () => reject(request.error ?? new Error('Não foi possível listar tentativas de save.'));
      });
      return records
        .filter((record): record is StoredPendingRegistration => isPendingRegistration(record, ownerId))
        .map(toPendingRegistration);
    } finally {
      database.close();
    }
  }

  async clearPendingRegistration(ownerId: string, localAccountId: string): Promise<void> {
    const key = pendingRegistrationKey(ownerId, localAccountId);
    const database = await openActiveFileDatabase();
    if (!database) return;
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(SAVE_FILE_ASSOCIATIONS_STORE, 'readwrite');
        transaction.objectStore(SAVE_FILE_ASSOCIATIONS_STORE).delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível remover a tentativa do save.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível remover a tentativa do save.'));
      });
    } finally {
      database.close();
    }
  }

  async clearFileAssociation(identity: SaveFileAssociationIdentity): Promise<void> {
    const key = associationKey(identity);
    const database = await openActiveFileDatabase();
    if (!database) return;
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(SAVE_FILE_ASSOCIATIONS_STORE, 'readwrite');
        transaction.objectStore(SAVE_FILE_ASSOCIATIONS_STORE).delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível remover a referência do save.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível remover a referência do save.'));
      });
    } finally {
      database.close();
    }
  }

  async isSameEntry(first: SaveFile, second: SaveFile): Promise<boolean> {
    const firstHandle = asBrowserFile(first).handle;
    const secondHandle = asBrowserFile(second).handle;
    if (firstHandle === secondHandle) return true;
    if (!firstHandle.isSameEntry) return false;
    return firstHandle.isSameEntry(secondHandle);
  }

  async persistActiveFile(file: SaveFile): Promise<void> {
    try {
      await persistBrowserFile(file as BrowserFile);
    } catch {
      // File saving must remain usable if browser storage is unavailable.
    }
  }

  async restoreActiveFile(): Promise<SaveFile | null> {
    return restoreBrowserFile();
  }

  async clearActiveFile(): Promise<void> {
    try {
      await clearPersistedBrowserFile();
    } catch {
      // Clearing an optional association must not break the current session.
    }
  }

  async queryPermission(file: SaveFile, mode: SaveFilePermissionMode = 'readwrite'): Promise<SaveFilePermission> {
    const browserFile = file as BrowserFile;
    if (!browserFile.handle.queryPermission) return 'prompt';
    return browserFile.handle.queryPermission({ mode });
  }
}

export function createBrowserSaveFilePort(): SaveFilePort {
  return new BrowserSaveFilePort();
}
