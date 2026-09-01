// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { createLibraryTestDatabase } from '../helpers/library-test-db';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { customFoodInput } from '../fixtures/library-fixtures';

let handle: Awaited<ReturnType<typeof createLibraryTestDatabase>> | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

describe('custom food repository', () => {
  it('lists active records by default, exposes archived records explicitly and blocks dependencies', async () => {
    handle = await createLibraryTestDatabase('custom-food-repository');
    await new LocalAccountContextRepository(handle).getActiveOrCreate();
    const repository = new PGliteFoodCatalogRepository(handle, { idFactory: () => 'custom-food-a' });
    const created = await repository.create('local-account', customFoodInput);
    expect(await repository.list('local-account')).toHaveLength(1);
    const archived = await repository.archive('local-account', created.id, created.version);
    expect(await repository.list('local-account')).toEqual([]);
    expect(await repository.list('local-account', { includeArchived: true })).toMatchObject([{ status: 'ARCHIVED', id: created.id }]);
    await expect(repository.deleteIfUnreferenced('local-account', created.id, archived.version)).resolves.toBe(true);
  });
});
