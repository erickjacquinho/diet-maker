// @vitest-environment node

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cloneFixture } from '../src/fixture';
import { PocError } from '../src/contracts';
import { closeDatabase, openDatabase, type DatabaseHandle } from '../src/db/client';
import { createDatabaseRepository, type DatabaseRepository } from '../src/db/repositories';
import { assertConfirmedFixtureEqual } from './support/fixture-assertions';

const handles: DatabaseHandle[] = [];
const tempDirectories: string[] = [];

afterEach(async () => {
  for (const handle of handles.splice(0)) {
    await closeDatabase(handle);
  }
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

async function openPersistentTestRepository(): Promise<{ handle: DatabaseHandle; repository: DatabaseRepository }> {
  const dataDir = mkdtempSync(join(tmpdir(), 'nutridiet-local-db-proof-'));
  tempDirectories.push(dataDir);
  const handle = await openDatabase({ mode: 'browser-persistent', dataDir });
  handles.push(handle);
  return { handle, repository: createDatabaseRepository(handle) };
}

describe('local database persistence seam', () => {
  it('keeps the confirmed fixture available after close and reopen', async () => {
    const first = await openPersistentTestRepository();
    const source = cloneFixture();

    await first.repository.seedFixture(source);
    const beforeClose = await first.repository.readConfirmed('account-alpha');
    await closeDatabase(first.handle);
    handles.splice(handles.indexOf(first.handle), 1);

    const reopenedHandle = await openDatabase({ mode: 'browser-persistent', dataDir: tempDirectories[0] });
    handles.push(reopenedHandle);
    const afterReopen = await createDatabaseRepository(reopenedHandle).readConfirmed('account-alpha');

    assertConfirmedFixtureEqual(afterReopen, beforeClose);
    expect(afterReopen.accounts.map((account) => account.id)).toEqual(['account-alpha']);
    expect(afterReopen.dietPlans.map((plan) => plan.id)).toEqual(['diet-ana-v1', 'diet-ana-v2', 'diet-bruno-v1']);
    expect(afterReopen.dietMealItems.find((item) => item.id === 'item-ana-v2-chicken')?.proteinG).toBe(37.2);
  });

  it('fails explicitly instead of claiming browser persistence without IndexedDB', async () => {
    const previousWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });

    try {
      await expect(openDatabase({ mode: 'browser-persistent', dataDir: 'memory://not-persistent' })).rejects.toMatchObject({
        code: 'PERSISTENCE_UNCONFIRMED',
      } satisfies Partial<PocError>);
    } finally {
      if (previousWindow) {
        Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
      } else {
        delete (globalThis as { window?: Window }).window;
      }
    }
  });
});
