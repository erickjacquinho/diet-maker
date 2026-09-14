import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { applyMigrations } from './migrations';
import { schema, type LocalDbSchema } from './schema';

export type LocalDatabase = ReturnType<typeof drizzle<LocalDbSchema>>;
export type LocalDatabaseMode = 'memory' | 'test-memory';

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

function createMemoryDataDir(): string {
  return `memory://nutridiet-session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined';
}

function assertMemoryDataDir(dataDir: string): void {
  if (!dataDir.startsWith('memory://')) {
    throw new Error('O runtime de uma sessão exige um filesystem PGlite memory://.');
  }
}

export async function openLocalDatabase(options: OpenLocalDatabaseOptions = {}): Promise<LocalDatabaseHandle> {
  const mode = options.mode ?? (isBrowserRuntime() ? 'memory' : 'test-memory');
  const dataDir = options.dataDir ?? (mode === 'memory' ? createMemoryDataDir() : 'memory://nutridiet-test');
  assertMemoryDataDir(dataDir);

  let client: PGlite | undefined = options.client;
  try {
    client = client ?? new PGlite(dataDir);
    await client.waitReady;
    const openedClient = client;
    const schemaVersion = await applyMigrations(openedClient);
    const db = drizzle(openedClient, { schema });
    return {
      db,
      client: openedClient,
      mode,
      schemaVersion,
      close: async () => {
        if (!openedClient.closed) await openedClient.close();
      },
    };
  } catch (cause) {
    if (client && !client.closed) await client.close();
    throw new Error('A base relacional local não pôde ser inicializada.', { cause: cause as Error });
  }
}

export async function closeLocalDatabase(handle: LocalDatabaseHandle | null | undefined): Promise<void> {
  if (handle) await handle.close();
}
