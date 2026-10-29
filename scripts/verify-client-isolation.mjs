#!/usr/bin/env node
// Fails when the browser-facing code can learn about the database: sensitive
// NEXT_PUBLIC_ names in sources/config and database references in the built bundle.
// Findings name the file and the pattern id, never the matched text.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const EXPLICIT_NAMES = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'ONLINE_DATABASE_URL',
  'ONLINE_DATABASE_SSL_CA_B64',
  'SERVER_MASTER_KEY',
  'SERVER_MASTER_KEY_ID',
  'ACCOUNT_KEK_ACTIVE_ID',
];
const EXPLICIT_PATTERN = /^ACCOUNT_KEK_V[1-9][0-9]*$/;
const FRAGMENTS = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'DATABASE', 'SUPABASE'];

// Nominal exceptions: { id, file, reason }. Add one only for a proven false positive.
const EXCEPTIONS = [];

function fail(message) {
  console.error(`verify-client-isolation: ${message}`);
  process.exit(2);
}

function parseRoot(argv) {
  const index = argv.indexOf('--root');
  if (index === -1) return process.cwd();
  const value = argv[index + 1];
  if (!value || !existsSync(value) || !statSync(value).isDirectory()) fail('--root must name an existing directory.');
  return resolve(value);
}

const root = parseRoot(process.argv.slice(2));

function walk(dir, accept) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, accept));
    else if (accept(full)) found.push(full);
  }
  return found;
}

function rel(file) {
  return relative(root, file).split('\\').join('/');
}

function sensitiveName(name) {
  return EXPLICIT_NAMES.includes(name) || EXPLICIT_PATTERN.test(name) || FRAGMENTS.some((part) => name.includes(part));
}

function versionedEnvFiles() {
  try {
    const listed = execFileSync('git', ['ls-files', '--', '.env*', '**/.env*'], { cwd: root, encoding: 'utf8' });
    return listed.split('\n').filter(Boolean).map((file) => join(root, file));
  } catch {
    return readdirSync(root).filter((name) => name.startsWith('.env')).map((name) => join(root, name));
  }
}

function migrationObjects() {
  const objects = new Set();
  const create = /CREATE\s+(?:OR\s+REPLACE\s+)?(?:MATERIALIZED\s+)?(?:TABLE|VIEW|FUNCTION|SEQUENCE)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:app|private)\.([a-z_][a-z0-9_]*)/gi;
  const files = walk(join(root, 'supabase', 'migrations'), (file) => file.endsWith('.sql'));
  for (const file of files) {
    for (const match of readFileSync(file, 'utf8').matchAll(create)) objects.add(match[1].toLowerCase());
  }
  return [...objects];
}

const findings = new Map();
function record(file, id, count) {
  if (!count || EXCEPTIONS.some((item) => item.id === id && item.file === file)) return;
  findings.set(`${file}\u0000${id}`, { file, id, count });
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

// A. Public prefix
const prefixFiles = [
  ...walk(join(root, 'src'), () => true),
  ...versionedEnvFiles(),
  ...readdirSync(root).filter((name) => /^next\.config\./.test(name)).map((name) => join(root, name)),
  ...walk(join(root, '.github', 'workflows'), () => true),
].filter((file, index, all) => existsSync(file) && all.indexOf(file) === index);

for (const file of prefixFiles) {
  const text = readFileSync(file, 'utf8');
  let hits = 0;
  for (const match of text.matchAll(/NEXT_PUBLIC_([A-Z0-9_]+)/g)) if (sensitiveName(match[1])) hits += 1;
  record(rel(file), 'public-prefix', hits);
}

// B. Bundle
const nextDir = join(root, '.next');
if (!existsSync(nextDir)) fail('.next was not found. Run npm run build first.');

const bundleFiles = [
  ...walk(join(nextDir, 'static'), () => true),
  ...walk(join(nextDir, 'server', 'app'), (file) => /\.(html|rsc|body|meta)$/.test(file)),
  ...walk(join(nextDir, 'server', 'pages'), (file) => file.endsWith('.html')),
  ...walk(join(root, 'public'), () => true),
];

const refFile = join(root, 'supabase', '.temp', 'project-ref');
const projectRef = existsSync(refFile) ? readFileSync(refFile, 'utf8').trim() : '';
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const objects = migrationObjects();

const patterns = [
  ['supabase-host', /[a-z0-9-]+\.supabase\.(?:co|com|in)\b/gi],
  ['key-prefix', /sb_publishable_|sb_secret_|service_role/g],
  ['env-name', new RegExp(`\\b(?:${[...EXPLICIT_NAMES, 'ACCOUNT_KEK_V[1-9][0-9]*'].join('|')})\\b`, 'g')],
  ['db-role', /\b(?:app_runtime|online_runtime)\b/g],
];
if (objects.length) patterns.push(['db-object', new RegExp(`\\b(?:app|private)\\.(?:${objects.map(escape).join('|')})\\b`, 'gi')]);
if (projectRef) patterns.push(['project-ref', new RegExp(escape(projectRef), 'g')]);

for (const file of bundleFiles) {
  const text = readFileSync(file, 'utf8');
  for (const [id, pattern] of patterns) record(rel(file), id, countMatches(text, pattern));
}

const checkedIds = 7; // public-prefix, supabase-host, project-ref, key-prefix, env-name, db-object, db-role
const total = new Set([...prefixFiles, ...bundleFiles]).size;
console.log(
  `verify-client-isolation: checked ${checkedIds} patterns in ${total} files (project-ref: ${projectRef ? 'checked' : 'skipped'})`,
);

if (findings.size === 0) process.exit(0);
for (const { file, id, count } of findings.values()) console.log(`FAIL ${file}  ${id}  x${count}`);
console.log(
  `${findings.size} finding${findings.size === 1 ? '' : 's'}. Remove the reference or move the code to a server module.`,
);
process.exit(1);
