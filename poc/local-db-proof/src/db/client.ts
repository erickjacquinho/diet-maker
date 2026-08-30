import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { PocError, type OpenDatabaseResult, type PocMode } from '../contracts';
import { applyMigrations } from './migrations';
import { schema, type Schema } from './schema';
import type { LockLease, SingleTabLock } from '../locking/single-tab-lock';

const DEFAULT_BROWSER_DATA_DIR = 'idb://nutridiet-local-db-proof-v1';

export type PocDatabase = ReturnType<typeof drizzle<Schema>>;

export interface DatabaseHandle extends OpenDatabaseResult {
  readonly client: PGlite;
  readonly db: PocDatabase;
  close(): Promise<void>;
}

export interface OpenDatabaseOptions {
  mode?: PocMode;
  dataDir?: string;
  client?: PGlite;
  lock?: Pick<SingleTabLock, 'acquire'>;
}

function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined';
}

function assertPersistentBrowserStorage(dataDir: string): void {
  if (!isBrowserRuntime()) {
    return;
  }

  if (typeof indexedDB === 'undefined') {
    throw new PocError(
      'PERSISTENCE_UNCONFIRMED',
      'open-database',
      'IndexedDB não está disponível; a persistência real não pode ser comprovada.',
    );
  }

  if (!dataDir.startsWith('idb://')) {
    throw new PocError(
      'PERSISTENCE_UNCONFIRMED',
      'open-database',
      'A PoC exige o filesystem IndexedDB para declarar persistência no navegador.',
      { dataDir },
    );
  }
}

export async function openDatabase(options: OpenDatabaseOptions = {}): Promise<DatabaseHandle> {
  const mode = options.mode ?? (isBrowserRuntime() ? 'browser-persistent' : 'test-memory');
  const dataDir = options.dataDir ?? (mode === 'browser-persistent' ? DEFAULT_BROWSER_DATA_DIR : 'memory://poc-test');

  if (mode === 'browser-persistent') {
    assertPersistentBrowserStorage(dataDir);
  }

  let client: PGlite;
  let lease: LockLease | undefined;
  try {
    if (options.lock) {
      lease = await options.lock.acquire();
    }
    client = options.client ?? new PGlite(dataDir);
    await client.waitReady;
    const schemaVersion = await applyMigrations(client);
    const db = drizzle(client, { schema });

    return {
      mode,
      schemaVersion,
      persistent: mode === 'browser-persistent',
      client,
      db,
      close: async () => {
        await lease?.release();
        if (!client.closed) {
          await client.close();
        }
      },
    };
  } catch (cause) {
    if (cause instanceof PocError) {
      await lease?.release();
      throw cause;
    }

    await lease?.release();

    throw new PocError(
      'INITIALIZATION_FAILED',
      'open-database',
      'A base relacional local não pôde ser inicializada.',
      { mode, dataDir },
      { cause },
    );
  }
}

export async function closeDatabase(handle: DatabaseHandle): Promise<void> {
  if (!handle.client.closed) {
    await handle.close();
  }
}
