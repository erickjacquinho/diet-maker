import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';

export async function createLibraryTestDatabase(label = 'library-test'): Promise<LocalDatabaseHandle> {
  return openLocalDatabase({
    mode: 'test-memory',
    dataDir: 'memory://' + label + '-' + Date.now() + '-' + Math.random().toString(36).slice(2),
  });
}
