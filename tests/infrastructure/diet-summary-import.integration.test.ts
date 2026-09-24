// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { PGliteBackupRepository } from '@/lib/infrastructure/local-db/backup-repository';
import { dietVariationHistorySummaries } from '@/lib/infrastructure/local-db/schema';
import { createBackupEnvelope } from '../fixtures/backup';
import { createBackupTestDatabase } from '../helpers/backup';
import type { LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

describe('diet history summary import', () => {
  it.each(['4', '5', '6'] as const)('rebuilds summaries after schema %s is restored', async (schemaVersion) => {
    handle = await createBackupTestDatabase(`diet-summary-import-${schemaVersion}`);
    const source = { ...createBackupEnvelope(), schemaVersion };

    await new PGliteBackupRepository(handle).replaceAccountSnapshot('local-account', source);

    const summaries = await handle.db.select().from(dietVariationHistorySummaries);
    expect(summaries).toEqual(expect.arrayContaining([
      {
        dietVariationId: 'variation-active',
        prescribedProtein: '2.5',
        prescribedCarbs: '28.1',
        prescribedFat: '0.2',
        prescribedEnergyKcal: '128',
      },
      {
        dietVariationId: 'variation-history',
        prescribedProtein: '0',
        prescribedCarbs: '0',
        prescribedFat: '0',
        prescribedEnergyKcal: '0',
      },
    ]));
  });
});
