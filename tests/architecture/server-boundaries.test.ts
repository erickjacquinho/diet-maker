import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { describe, expect, it } from 'vitest';

type Sources = Map<string, string>; // posix path relative to the repo root -> source

const repoRoot = process.cwd();
const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
const poolOwners = [
  'src/lib/server/online-db/client.ts',
  'src/lib/server/online-db/accounts.ts',
  'src/lib/server/online-db/repository.ts',
];
const serverOnlyModules = ['src/lib/server/online-db/accounts.ts', 'src/lib/server/crypto/account-kek.ts'];
const clientPoolModule = 'src/lib/server/online-db/client.ts';

function loadSources(dir = 'src'): Sources {
  const sources: Sources = new Map();
  const walk = (current: string) => {
    for (const entry of readdirSync(join(repoRoot, current), { withFileTypes: true })) {
      const path = posix.join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(ts|tsx)$/.test(entry.name)) sources.set(path, readFileSync(join(repoRoot, path), 'utf8'));
    }
  };
  walk(dir);
  return sources;
}

function specifiers(source: string): string[] {
  const found: string[] = [];
  const patterns = [
    /\b(?:import|export)\s+(?!type\b)[^'";]*?\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) for (const match of source.matchAll(pattern)) found.push(match[1]);
  return found;
}

function resolveModule(from: string, specifier: string, sources: Sources): string | undefined {
  let base: string;
  if (specifier.startsWith('@/')) base = posix.join('src', specifier.slice(2));
  else if (specifier.startsWith('.')) base = posix.join(dirname(from), specifier);
  else return undefined;
  for (const suffix of ['', ...extensions]) if (sources.has(base + suffix)) return base + suffix;
  return undefined;
}

// drizzle-orm core and drizzle-orm/pglite stay reachable: the local-first PGlite stack runs in the browser.
// Only the server driver is forbidden transitively; components and hooks still cannot import drizzle-orm
// directly (ESLint no-restricted-imports).
function isForbiddenExternal(specifier: string): boolean {
  return /^@supabase\//.test(specifier) || /^pg(\/|$)/.test(specifier) || specifier === 'drizzle-orm/node-postgres';
}

function isServerModule(path: string, sources: Sources): boolean {
  return path.startsWith('src/lib/server/') || /^\s*import\s+['"]server-only['"]/m.test(sources.get(path) ?? '');
}

function clientRoots(sources: Sources): string[] {
  return [...sources.keys()].filter(
    (path) =>
      path.startsWith('src/components/') ||
      path.startsWith('src/hooks/') ||
      /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*['"]use client['"]/.test(sources.get(path) ?? ''),
  );
}

/** Returns one chain per client root that can reach a forbidden or server-only module. */
function findClientViolations(sources: Sources): string[][] {
  const violations: string[][] = [];
  for (const root of clientRoots(sources)) {
    const seen = new Set<string>([root]);
    const queue: string[][] = [[root]];
    while (queue.length) {
      const chain = queue.shift() as string[];
      const current = chain[chain.length - 1];
      for (const specifier of specifiers(sources.get(current) ?? '')) {
        if (isForbiddenExternal(specifier) || specifier === 'server-only') {
          violations.push([...chain, specifier]);
          continue;
        }
        const next = resolveModule(current, specifier, sources);
        if (!next || seen.has(next)) continue;
        seen.add(next);
        if (isServerModule(next, sources)) violations.push([...chain, next]);
        else queue.push([...chain, next]);
      }
    }
  }
  return violations;
}

/** Files outside the allowlist that import the pool client, pg or drizzle's node-postgres driver. */
function findPoolViolations(sources: Sources): string[] {
  const offenders: string[] = [];
  for (const [path, source] of sources) {
    if (poolOwners.includes(path)) continue;
    const touchesPool = specifiers(source).some(
      (specifier) =>
        /^pg(\/|$)/.test(specifier) ||
        specifier === 'drizzle-orm/node-postgres' ||
        resolveModule(path, specifier, sources) === clientPoolModule,
    );
    if (touchesPool) offenders.push(path);
  }
  return offenders;
}

const format = (chains: string[][]) => chains.map((chain) => chain.join(' -> ')).join('\n');

describe('server boundaries', () => {
  const sources = loadSources();

  it('keeps database clients and server modules out of the client import graph', () => {
    const violations = findClientViolations(sources);
    expect(violations, format(violations)).toEqual([]);
  });

  it('lets only the pool owners reach the database client', () => {
    const offenders = findPoolViolations(sources);
    expect(offenders, `Pool access outside the allowlist:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('starts every foundation server module with import server-only', () => {
    const missing = serverOnlyModules.filter(
      (path) => !/^(?:\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/))*\s*import\s+['"]server-only['"]/.test(sources.get(path) ?? ''),
    );
    expect(missing, `Missing "import 'server-only'" as first statement:\n${missing.join('\n')}`).toEqual([]);
  });

  describe('detector fixtures', () => {
    it('reports a transitive component -> lib -> lib/server chain', () => {
      const fixture: Sources = new Map([
        ['src/components/Widget.tsx', "import { read } from '@/lib/helper';\nexport const W = () => read();\n"],
        ['src/lib/helper.ts', "import { query } from './server/db';\nexport const read = () => query();\n"],
        ['src/lib/server/db.ts', "import 'server-only';\nexport const query = () => 1;\n"],
      ]);
      const violations = findClientViolations(fixture);
      expect(violations).toHaveLength(1);
      expect(violations[0]).toEqual(['src/components/Widget.tsx', 'src/lib/helper.ts', 'src/lib/server/db.ts']);
    });

    it('reports a database client reached through a dynamic import in a use client file', () => {
      const fixture: Sources = new Map([
        ['src/app/Panel.tsx', "'use client';\nexport const load = () => import('pg');\n"],
      ]);
      expect(findClientViolations(fixture)).toEqual([['src/app/Panel.tsx', 'pg']]);
    });

    it('reports the server driver but allows the browser PGlite driver', () => {
      const fixture: Sources = new Map([
        ['src/components/A.tsx', "import { drizzle } from 'drizzle-orm/node-postgres';\nexport const a = drizzle;\n"],
        ['src/components/B.tsx', "import { drizzle } from 'drizzle-orm/pglite';\nexport const b = drizzle;\n"],
      ]);
      expect(findClientViolations(fixture)).toEqual([['src/components/A.tsx', 'drizzle-orm/node-postgres']]);
    });

    it('ignores type-only imports and accepts a clean client graph', () => {
      const fixture: Sources = new Map([
        ['src/components/Clean.tsx', "import type { Pool } from 'pg';\nexport const C = () => null;\n"],
      ]);
      expect(findClientViolations(fixture)).toEqual([]);
    });

    it('reports a pool import outside the allowlist and names the file', () => {
      const fixture: Sources = new Map([
        ['src/lib/server/online-db/client.ts', "import { Pool } from 'pg';\nexport const getOnlineDatabase = () => Pool;\n"],
        ['src/lib/server/other.ts', "import { getOnlineDatabase } from './online-db/client';\nexport const x = getOnlineDatabase;\n"],
        ['src/lib/server/rogue.ts', "import { Pool } from 'pg';\nexport const p = Pool;\n"],
      ]);
      expect(findPoolViolations(fixture).sort()).toEqual(['src/lib/server/other.ts', 'src/lib/server/rogue.ts']);
    });
  });
});
