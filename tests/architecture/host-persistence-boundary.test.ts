// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(process.cwd());

async function source(relativePath: string): Promise<string> {
  return readFile(resolve(projectRoot, relativePath), 'utf8');
}

describe('host persistence boundary', () => {
  it('keeps the production runtime composition independent from host storage', async () => {
    const [client, composition, accountContext, draftStore] = await Promise.all([
      source('src/lib/infrastructure/local-db/client.ts'),
      source('src/lib/application/browser-composition.ts'),
      source('src/lib/infrastructure/local-db/account-context.ts'),
      source('src/lib/infrastructure/diet-drafts/in-memory-diet-draft-store.ts'),
    ]);
    const productionRuntime = `${client}\n${composition}\n${accountContext}\n${draftStore}`;

    expect(productionRuntime).not.toMatch(/idb:\/\//);
    expect(productionRuntime).not.toMatch(/IndexedDB|indexedDB|localStorage|sessionStorage|document\.cookie/);
    expect(productionRuntime).not.toMatch(/IndexedDbDietDraftStore/);
    expect(productionRuntime).not.toMatch(/getActiveOrCreate/);
  });
});
