import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { inventoryByCategory } from './diet-legacy-inventory';

const root = path.resolve(process.cwd(), 'src');

function readFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? readFiles(file) : /\.(ts|tsx)$/.test(entry.name) ? [file] : [];
  });
}

describe('diet persistence architecture boundary', () => {
  it('keeps domain/application free of framework and provider imports', () => {
    const files = [...readFiles(path.join(root, 'lib', 'domain', 'diets')), ...readFiles(path.join(root, 'lib', 'application', 'diets'))];
    const forbidden = /from\s+['"](?:react|next\/|@electric-sql\/pglite|drizzle-orm)|\b(?:PGlite|indexedDB|localStorage|sessionStorage)\b/;
    expect(files.filter((file) => forbidden.test(fs.readFileSync(file, 'utf8')))).toEqual([]);
  });

  it('keeps UI free of direct persistence providers and legacy diet findings', () => {
    const uiFiles = [...readFiles(path.join(root, 'app')), ...readFiles(path.join(root, 'components')), ...readFiles(path.join(root, 'hooks'))];
    const forbidden = /@electric-sql\/pglite|drizzle-orm|\bindexedDB\b|(?:localStorage|sessionStorage)|['"]@\/lib\/storage['"]/;
    const findings = inventoryByCategory();
    expect(findings).toEqual(new Map());
    const forbiddenUiFiles = uiFiles.filter((file) => forbidden.test(fs.readFileSync(file, 'utf8')));
    expect(forbiddenUiFiles).toEqual([]);
  });
});
