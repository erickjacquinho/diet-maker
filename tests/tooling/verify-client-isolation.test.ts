import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const script = resolve(process.cwd(), 'scripts/verify-client-isolation.mjs');
const roots: string[] = [];

type Files = Record<string, string>;

const cleanFiles: Files = {
  'src/app/page.tsx': 'export default function Page() { return null; }\n',
  '.env.example': 'NEXT_PUBLIC_APP_NAME=\nONLINE_DATABASE_URL=\n',
  'next.config.ts': 'export default {};\n',
  '.github/workflows/ci.yml': 'name: ci\n',
  'supabase/migrations/001_init.sql':
    'CREATE TABLE IF NOT EXISTS app.accounts (id uuid);\nCREATE TABLE private.saves (id uuid);\n',
  '.next/static/chunks/app.js': 'console.log("hello");\n',
  '.next/server/app/index.html': '<html><body>ok</body></html>\n',
  'public/robots.txt': 'User-agent: *\n',
};

function makeRoot(files: Files): string {
  const root = mkdtempSync(join(tmpdir(), 'client-isolation-'));
  roots.push(root);
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['add', '-A', '-f', '--', '.env.example', 'src', 'next.config.ts', '.github', 'supabase/migrations'], {
    cwd: root,
  });
  return root;
}

function run(root: string) {
  const result = spawnSync(process.execPath, [script, '--root', root], { encoding: 'utf8' });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function scan(overrides: Files, remove: string[] = []) {
  const files = { ...cleanFiles, ...overrides };
  for (const path of remove) delete files[path];
  return run(makeRoot(files));
}

afterEach(() => {
  while (roots.length) rmSync(roots.pop() as string, { recursive: true, force: true });
});

describe('verify-client-isolation script', () => {
  describe('public prefix scan', () => {
    const places: Array<[string, string]> = [
      ['.env.example', 'NEXT_PUBLIC_SUPABASE_SECRET_KEY=\n'],
      ['next.config.ts', 'export default { env: { NEXT_PUBLIC_SUPABASE_SECRET_KEY: "" } };\n'],
      ['.github/workflows/ci.yml', 'env:\n  NEXT_PUBLIC_SUPABASE_SECRET_KEY: x\n'],
      ['src/lib/config.ts', 'export const k = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;\n'],
    ];

    it.each(places)('flags a sensitive NEXT_PUBLIC_ name in %s', (file, content) => {
      const result = scan({ [file]: content });
      expect(result.status).toBe(1);
      expect(result.output).toContain(file);
      expect(result.output).toContain('public-prefix');
    });

    it('flags a sensitive fragment such as TOKEN', () => {
      const result = scan({ '.env.example': 'NEXT_PUBLIC_STRIPE_TOKEN=\n' });
      expect(result.status).toBe(1);
      expect(result.output).toContain('public-prefix');
    });

    it('accepts a harmless NEXT_PUBLIC_ name', () => {
      const result = scan({ '.env.example': 'NEXT_PUBLIC_APP_NAME=\n' });
      expect(result.status).toBe(0);
    });
  });

  describe('bundle scan', () => {
    const locations = [
      '.next/static/chunks/leak.js',
      '.next/server/app/leak.html',
      '.next/server/app/leak.rsc',
      'public/leak.txt',
    ];
    const patterns: Array<[string, string]> = [
      ['supabase-host', 'https://abcdefghijklmnop.supabase.co/auth/v1'],
      ['key-prefix', 'sb_secret_UNIQUEMARKER123'],
      ['env-name', 'process.env.SERVER_MASTER_KEY'],
      ['db-object', 'select * from app.accounts'],
      ['db-role', 'user=app_runtime'],
    ];

    for (const location of locations) {
      it.each(patterns)(`detects %s in ${location} without printing the snippet`, (id, snippet) => {
        const result = scan({ [location]: `${snippet}\n` });
        expect(result.status).toBe(1);
        expect(result.output).toContain(location);
        expect(result.output).toContain(id);
        expect(result.output).not.toContain(snippet);
      });
    }

    it('derives db-object names from the migrations', () => {
      const result = scan({
        'supabase/migrations/002_more.sql': 'CREATE VIEW private.derived_view AS SELECT 1;\n',
        'public/leak.txt': 'private.derived_view\n',
      });
      expect(result.status).toBe(1);
      expect(result.output).toContain('db-object');
    });

    it('detects the linked project ref when supabase/.temp/project-ref exists', () => {
      const result = scan({
        'supabase/.temp/project-ref': 'zzprojectrefzz\n',
        '.next/static/chunks/leak.js': 'const r = "zzprojectrefzz";\n',
      });
      expect(result.status).toBe(1);
      expect(result.output).toContain('project-ref');
      expect(result.output).not.toContain('zzprojectrefzz');
    });

    it('reports project-ref as skipped without the linked ref file', () => {
      const result = scan({});
      expect(result.status).toBe(0);
      expect(result.output).toContain('project-ref: skipped');
    });
  });

  describe('output contract', () => {
    it('exits 0 with a summary on a clean fixture', () => {
      const result = scan({});
      expect(result.status).toBe(0);
      expect(result.output).toMatch(/checked \d+ patterns in \d+ files/);
    });

    it('exits 2 when there is no .next build output', () => {
      const result = scan({}, ['.next/static/chunks/app.js', '.next/server/app/index.html']);
      expect(result.status).toBe(2);
      expect(result.output).toContain('.next');
    });
  });
});
