import { describe, expect, it, vi } from 'vitest';
import { createActiveAccountContext } from '@/lib/application/account/get-active-account';
import { openLocalDatabase } from '@/lib/infrastructure/local-db/client';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';

describe('patient account offline boundary', () => {
  it('opens the prepared local account without remote calls', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const handle = await openLocalDatabase({ mode: 'test-memory', dataDir: `memory://offline-${Date.now()}` });
    try {
      const context = createActiveAccountContext(new LocalAccountContextRepository(handle));
      await expect(context.requireActive()).resolves.toMatchObject({ accountId: 'local-account' });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
      await handle.close();
    }
  });
});
