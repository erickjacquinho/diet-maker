import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { applyMigrations } from './migrations';
import { schema, type LocalDbSchema } from './schema';

export type LocalDatabase = ReturnType<typeof drizzle<LocalDbSchema>>;
export type LocalDatabaseMode = 'browser-persistent' | 'test-memory';

export interface LocalDatabaseHandle {
  readonly db: LocalDatabase;
  readonly client: PGlite;
  readonly mode: LocalDatabaseMode;
  readonly schemaVersion: string;
  close(): Promise<void>;
}

export interface OpenLocalDatabaseOptions {
  mode?: LocalDatabaseMode;
  dataDir?: string;
  client?: PGlite;
}

const DEFAULT_BROWSER_DATA_DIR = 'idb://nutridiet-local-db-v1';

function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined';
}

function assertBrowserPersistence(dataDir: string): void {
  if (!isBrowserRuntime()) return;
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB não está disponível; a persistência local não pode ser comprovada.');
  }
  if (!dataDir.startsWith('idb://')) {
    throw new Error('A persistência no navegador exige o filesystem IndexedDB.');
  }
}

export async function openLocalDatabase(options: OpenLocalDatabaseOptions = {}): Promise<LocalDatabaseHandle> {
  const mode = options.mode ?? (isBrowserRuntime() ? 'browser-persistent' : 'test-memory');
  const dataDir = options.dataDir ?? (mode === 'browser-persistent' ? DEFAULT_BROWSER_DATA_DIR : 'memory://nutridiet-test');
  if (mode === 'browser-persistent') assertBrowserPersistence(dataDir);

  const client = options.client ?? new PGlite(dataDir);
  try {
    await client.waitReady;
    const schemaVersion = await applyMigrations(client);
    const db = drizzle(client, { schema });
    return {
      db,
      client,
      mode,
      schemaVersion,
      close: async () => {
        if (!client.closed) await client.close();
      },
    };
  } catch (cause) {
    if (!client.closed) await client.close();
    throw new Error('A base relacional local não pôde ser inicializada.', { cause: cause as Error });
  }
}

export async function closeLocalDatabase(handle: LocalDatabaseHandle | null | undefined): Promise<void> {
  if (handle) await handle.close();
}
