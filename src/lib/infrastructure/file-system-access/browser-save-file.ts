import type {
  SaveFile,
  SaveFilePermission,
  SaveFilePermissionMode,
  SaveFilePort,
} from '@/lib/persistence/save-file';

interface WritableFile {
  write(content: string): Promise<void>;
  close(): Promise<void>;
}

interface BrowserFileHandle {
  readonly name: string;
  getFile(): Promise<{ text(): Promise<string> }>;
  queryPermission?(options?: { mode?: SaveFilePermissionMode }): Promise<SaveFilePermission>;
  requestPermission(options?: { mode?: 'read' | 'readwrite' }): Promise<SaveFilePermission>;
  createWritable(): Promise<WritableFile>;
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

const fileType = {
  description: 'NutriDiet profile',
  accept: { 'application/json': ['.nutridiet'] },
};

const ACTIVE_FILE_DATABASE = 'nutridiet-profile-session-v1';
const ACTIVE_FILE_STORE = 'active-file';
const ACTIVE_FILE_KEY = 'current';
const ACTIVE_FILE_METADATA_KEY = 'nutridiet.active-profile-file';

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

function openActiveFileDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(ACTIVE_FILE_DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(ACTIVE_FILE_STORE)) {
        request.result.createObjectStore(ACTIVE_FILE_STORE);
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
    const browserFile = file as BrowserFile;
    const writable = await browserFile.handle.createWritable();
    try {
      await writable.write(content);
    } finally {
      await writable.close();
    }
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
