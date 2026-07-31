import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SCAN_ROOTS = ['src', 'tests', 'scripts'];
const CONFIG_FILES = ['components.json', 'eslint.config.mjs', 'package.json', 'tailwind.config.js'];
const SOURCE_EXTENSIONS = new Set(['.css', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
const EXCLUDED_PREFIXES = ['tests/fixtures/design-system-legacy/'];

const BASELINE_RULES = [
  ['LEG001', 'legacy-palette', /\b(?:warm-[\w-]+|emerald-(?:50|100|500|600|700)|cream|charcoal)\b/g],
  ['LEG002', 'arbitrary-text-style', /\b(?:text|leading|tracking)-\[[^\]]+\]/g],
  ['LEG003', 'forbidden-radius', /\brounded-(?:xl|2xl|3xl|full)\b/g],
  ['LEG004', 'legacy-font-weight', /\bfont-(?:black|extrabold)\b/g],
  ['LEG005', 'legacy-depth-motion', /\b(?:shadow(?:-[\w\[\]-]+)?|transition-all)\b/g],
  ['LEG006', 'out-of-scope-breakpoint', /\b(?:sm|md):[\w\[\]-]+/g],
  ['LEG007', 'local-visual-literal', /#[0-9a-fA-F]{3,8}\b/g],
  ['LEG008', 'legacy-alias', /\b(?:warm|cream|charcoal)(?:Background|Surface|Border|Text|Muted)?\b/g],
  ['LEG009', 'direct-legacy-import', /(?:from\s+|import\s*)["']@\/design-system\/tokens["']/g],
  ['LEG010', 'legacy-font', /\b(?:Inter|Fira Code|Arial|sans-serif)\b/g],
];

function projectPath(absolutePath) {
  return path.relative(ROOT, absolutePath).replaceAll('\\', '/');
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function lineFor(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function collectImports(source) {
  const imports = [];
  for (const line of source.split(/\r?\n/)) {
    const from = line.match(/^\s*(?:import|export)\b.*?\bfrom\s+["']([^"']+)["']/)?.[1];
    const sideEffect = line.match(/^\s*import\s+["']([^"']+)["']/)?.[1];
    if (from ?? sideEffect) imports.push(from ?? sideEffect);
  }
  return imports.sort();
}

function routeFromFile(file) {
  const relative = file.replace(/^src\/app\/?/, '').replace(/\/(?:page|layout)\.tsx$/, '').replace(/^(?:page|layout)\.tsx$/, '');
  return relative ? `/${relative}` : '/';
}

export async function captureBaseline() {
  const discovered = (await Promise.all(SCAN_ROOTS.map((root) => walk(path.join(ROOT, root)))))
    .flat()
    .map(projectPath)
    .filter((file) => !EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix)));
  for (const config of CONFIG_FILES) if (await exists(path.join(ROOT, config))) discovered.push(config);
  const sourceFiles = [...new Set(discovered)].sort();
  const imports = {};
  const legacyFindings = [];

  for (const file of sourceFiles) {
    const source = await readFile(path.join(ROOT, ...file.split('/')), 'utf8');
    const fileImports = collectImports(source);
    if (fileImports.length) imports[file] = fileImports;
    for (const [code, rule, pattern] of BASELINE_RULES) {
      pattern.lastIndex = 0;
      for (const match of source.matchAll(pattern)) {
        if (code === 'LEG007' && file === 'src/design-system/tokens.css') continue;
        legacyFindings.push({ code, rule, path: file, line: lineFor(source, match.index ?? 0), match: match[0] });
      }
    }
  }

  legacyFindings.sort((left, right) =>
    `${left.path}:${String(left.line).padStart(6, '0')}:${left.code}`.localeCompare(
      `${right.path}:${String(right.line).padStart(6, '0')}:${right.code}`,
    ),
  );
  const components = sourceFiles.filter((file) => /^src\/components\/(?:ui|atoms|molecules|organisms|templates)\/[^/]+\.tsx$/.test(file));
  const routeFiles = sourceFiles.filter((file) => /^src\/app\/(?:.*\/)?(?:page|layout)\.tsx$/.test(file));
  const routes = [...new Set(routeFiles.filter((file) => file.endsWith('/page.tsx') || file === 'src/app/page.tsx').map(routeFromFile))].sort();

  return {
    schemaVersion: 1,
    capturedAt: git('log', '-1', '--format=%cI'),
    registryRevision: git('rev-parse', 'HEAD'),
    sourceFiles,
    components,
    routes,
    imports,
    legacyFindings,
    counts: {
      sourceFiles: sourceFiles.length,
      components: components.length,
      routes: routes.length,
      imports: Object.values(imports).reduce((total, values) => total + values.length, 0),
      legacyFindings: legacyFindings.length,
    },
  };
}

async function runCli() {
  const baseline = await captureBaseline();
  process.stdout.write(`${JSON.stringify(baseline, null, process.argv.includes('--json') ? 2 : 0)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await runCli();
}
