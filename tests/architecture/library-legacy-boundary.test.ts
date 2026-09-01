import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(process.cwd(), 'src');
const canonicalRoots = ['app', 'hooks', 'lib/application', 'lib/infrastructure'];
const legacyPersistencePattern = /nutridiet_(?:custom_foods|recipes|ready_meals)|(?:recipesStore|readyMealsStore)|(?:get|save|add|update|delete)(?:CustomFood|Recipe|ReadyMeal)(?:FromStorage|ToStorage)/;

function sourceFiles(relativeRoot: string): string[] {
  const root = join(sourceRoot, relativeRoot);
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const relativePath = join(relativeRoot, entry.name);
    if (entry.isDirectory()) return sourceFiles(relativePath);
    return /\.(ts|tsx)$/.test(entry.name) ? [relativePath] : [];
  });
}

describe('reusable library legacy boundary', () => {
  it('keeps legacy library persistence out of canonical runtime surfaces', () => {
    const offenders = canonicalRoots.flatMap((root) =>
      sourceFiles(root).filter((file) => legacyPersistencePattern.test(readFileSync(join(sourceRoot, file), 'utf8'))),
    );

    expect(offenders).toEqual([]);
  });

  it('keeps the static TACO adapter free of account-library persistence', () => {
    const adapter = readFileSync(join(sourceRoot, 'lib/library-ui-adapter.ts'), 'utf8');
    expect(adapter).not.toMatch(/nutridiet_(?:custom_foods|recipes|ready_meals)/);
    expect(adapter).not.toMatch(/recipesStore|readyMealsStore/);
  });
});
