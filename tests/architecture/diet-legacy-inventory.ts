import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const legacyDietPatterns = {
  dietStorageKeys: /nutridiet_diets_/i,
  cycleTransport: /nutridiet_cycle_configured/i,
  embeddedHistory: /dietHistory\s*[:.]|dietHistory\s*\??\s*:/i,
  dietStore: /(?:from|import\s*\()\s*['"].*dietStore|dietStore/i,
  dietDuplication: /dietDuplication/i,
} as const;

export type LegacyDietInventoryEntry = {
  category: keyof typeof legacyDietPatterns;
  file: string;
  matches: string[];
};

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && entry.name === '__tests__') return [];
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name) ? [path] : [];
  });
}

export function collectLegacyDietInventory(root = process.cwd()): LegacyDietInventoryEntry[] {
  const sourceRoot = join(root, 'src');
  return listSourceFiles(sourceRoot).flatMap((absoluteFile) => {
    const source = readFileSync(absoluteFile, 'utf8');
    const relativeFile = absoluteFile.slice(root.length + 1).replaceAll('\\', '/');

    return Object.entries(legacyDietPatterns).flatMap(([category, pattern]) => {
      const matches = source.match(pattern);
      return matches
        ? [{ category: category as keyof typeof legacyDietPatterns, file: relativeFile, matches }]
        : [];
    });
  });
}

export function inventoryByCategory(root = process.cwd()): Map<keyof typeof legacyDietPatterns, LegacyDietInventoryEntry[]> {
  const result = new Map<keyof typeof legacyDietPatterns, LegacyDietInventoryEntry[]>();
  for (const entry of collectLegacyDietInventory(root)) {
    const entries = result.get(entry.category) ?? [];
    entries.push(entry);
    result.set(entry.category, entries);
  }
  return result;
}
