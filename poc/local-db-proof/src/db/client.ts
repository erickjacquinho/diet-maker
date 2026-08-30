import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { PocError, type OpenDatabaseResult, type PocMode } from '../contracts';
import { applyMigrations } from './migrations';
import { schema, type Schema } from './schema';
import { SingleTabLock, type LockLease } from '../locking/single-tab-lock';

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

  let client: PGlite | undefined;
  let lease: LockLease | undefined;
  try {
    const lock = options.lock ?? (mode === 'browser-persistent' && isBrowserRuntime() ? new SingleTabLock() : undefined);
    if (lock) {
      lease = await lock.acquire();
    }
    client = options.client ?? new PGlite(dataDir);
    await client.waitReady;
    const schemaVersion = await applyMigrations(client);
    const db = drizzle(client, { schema });
    const openedClient = client;

    return {
      mode,
      schemaVersion,
      persistent: mode === 'browser-persistent',
      client,
      db,
      close: async () => {
        if (!openedClient.closed) {
          await openedClient.close();
        }
        await lease?.release();
      },
    };
  } catch (cause) {
    try {
      if (client && !client.closed) {
        await client.close();
      }
    } catch (cleanupCause) {
      throw new PocError(
        'INITIALIZATION_FAILED',
        'open-database',
        'A inicialização falhou e o motor não pôde ser fechado. Feche esta aba antes de tentar novamente.',
        { mode, dataDir },
        { cause: new AggregateError([cause, cleanupCause]) },
      );
    }
    await lease?.release();
    if (cause instanceof PocError) {
      throw cause;
    }

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
  await handle.close();
}
