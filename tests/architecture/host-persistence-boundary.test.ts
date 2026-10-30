// @vitest-environment node

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(process.cwd());

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

describe('host persistence boundary', () => {
  it('keeps the browser workspace, save files and IndexedDB drafts out of the runtime', async () => {
    const files = await sourceFiles(join(projectRoot, 'src'));
    const offenders: string[] = [];
    for (const file of files) {
      const text = await readFile(file, 'utf8');
      if (/infrastructure\/local-db|file-system-access|@electric-sql\/pglite|showOpenFilePicker|showSaveFilePicker|indexedDB/.test(text)) {
        offenders.push(file.slice(projectRoot.length + 1).replace(/\\/g, '/'));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('builds the browser runtime only over the account API', async () => {
    const composition = await readFile(resolve(projectRoot, 'src/lib/application/browser-composition.ts'), 'utf8');
    expect(composition).toContain('HttpPatientRepository');
    expect(composition).toContain('HttpDietDraftStore');
    expect(composition).not.toMatch(/PGlite|openLocalDatabase|IndexedDbDietDraftStore|InMemoryDietDraftStore/);
  });
});
