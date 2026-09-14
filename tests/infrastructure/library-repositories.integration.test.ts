// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { createLibraryTestDatabase } from '../helpers/library-test-db';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { createActiveAccountContext } from '@/lib/application/account/get-active-account';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { customFoodInput } from '../fixtures/library-fixtures';

let handle: Awaited<ReturnType<typeof createLibraryTestDatabase>> | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

describe('library repository contracts', () => {
  it('scopes food CRUD to the active account and supports archive/delete policy', async () => {
    handle = await createLibraryTestDatabase('repository-contract');
    const accountContext = createActiveAccountContext(new LocalAccountContextRepository(handle));
    const account = await accountContext.requireActive();
    const repository = new PGliteFoodCatalogRepository(handle);
    const created = await repository.create(account.accountId, customFoodInput);
    expect(created.accountId).toBe(account.accountId);
    expect(created.version).toBe(1);
    await expect(repository.getById('other-account', created.id)).resolves.toBeNull();
    const updated = await repository.update(account.accountId, created.id, created.version, { ...customFoodInput, name: 'Iogurte atualizado' });
    expect(updated.version).toBe(2);
    await expect(repository.update(account.accountId, created.id, created.version, customFoodInput)).rejects.toMatchObject({ code: 'LIBRARY_VERSION_CONFLICT' });
    const archived = await repository.archive(account.accountId, created.id, updated.version);
    expect(archived.status).toBe('ARCHIVED');
    expect(await repository.list(account.accountId, { includeArchived: false })).toEqual([]);
    await expect(repository.deleteIfUnreferenced(account.accountId, created.id, archived.version)).resolves.toBe(true);
  });
});
