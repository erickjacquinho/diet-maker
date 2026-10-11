// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(process.cwd());

async function source(relativePath: string): Promise<string> {
  return readFile(resolve(projectRoot, relativePath), 'utf8');
}

describe('host persistence boundary', () => {
  it('keys browser workspace and diet drafts to local persistent storage', async () => {
    const [client, composition] = await Promise.all([
      source('src/lib/infrastructure/local-db/client.ts'),
      source('src/lib/application/browser-composition.ts'),
    ]);

    expect(client).toMatch(/mode === 'persistent' \? 'idb:\/\/' : 'memory:\/\//);
    expect(composition).toContain('const workspaceKey = onlineScope ? `${onlineScope.ownerId}:${onlineScope.saveId}` : account.id');
    expect(composition).toContain('idb://nutridiet-${encodeURIComponent(workspaceKey)}');
    expect(composition).toContain('new IndexedDbDietDraftStore({ databaseName: onlineScope');
    expect(composition).toContain('nutridiet-diet-drafts-v1-${encodeURIComponent(workspaceKey)}');
    expect(composition).toContain("'nutridiet-diet-drafts-v1'");
    expect(composition).toContain('new InMemoryDietDraftStore()');
    expect(composition).not.toMatch(/getActiveOrCreate/);
  });
});
