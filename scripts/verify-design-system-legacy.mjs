import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { legacyRules } from './design-system-legacy-rules.mjs';

const EXTENSIONS = new Set(['.css', '.js', '.jsx', '.json', '.mjs', '.ts', '.tsx']);
const DEFAULT_PATHS = ['src', 'tailwind.config.js', 'components.json'];

async function exists(target) { try { await stat(target); return true; } catch { return false; } }
async function discover(target) {
  if (!(await exists(target))) throw new Error(`Escopo inexistente: ${target}`);
  const info = await stat(target);
  if (info.isFile()) return EXTENSIONS.has(path.extname(target)) ? [target] : [];
  const entries = await readdir(target, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (['node_modules', '.next', '__tests__'].includes(entry.name)) continue;
    files.push(...(await discover(path.join(target, entry.name))));
  }
  return files;
}

function parseArgs(args) {
  const paths = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--paths') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--paths exige um escopo.');
      paths.push(...value.split(',').filter(Boolean));
      index += 1;
    }
  }
  return { mode: args.includes('--strict') ? 'strict' : 'inventory', json: args.includes('--json'), paths: paths.length ? paths : DEFAULT_PATHS };
}

export async function verifyLegacy(rootDir, options = {}) {
  const requested = options.paths ?? DEFAULT_PATHS;
  const files = [...new Set((await Promise.all(requested.map((item) => discover(path.resolve(rootDir, item))))).flat())].sort();
  const findings = [];
  for (const absolute of files) {
    const projectPath = path.relative(rootDir, absolute).replaceAll('\\', '/');
    const source = await readFile(absolute, 'utf8');
    const lines = source.split(/\r?\n/);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      for (const rule of legacyRules) {
        if (rule.code === 'LEG007' && projectPath === 'src/design-system/tokens.css') continue;
        rule.pattern.lastIndex = 0;
        for (const match of lines[lineIndex].matchAll(rule.pattern)) findings.push({ code: rule.code, rule: rule.rule, path: projectPath, line: lineIndex + 1, message: `${rule.message} Encontrado: ${match[0]}`, severity: 'error' });
      }
    }
  }
  findings.sort((a, b) => `${a.path}:${String(a.line).padStart(6, '0')}:${a.code}`.localeCompare(`${b.path}:${String(b.line).padStart(6, '0')}:${b.code}`));
  return { mode: options.mode ?? 'inventory', findings, counts: { files: files.length, findings: findings.length } };
}

async function runCli() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await verifyLegacy(process.cwd(), options);
    if (options.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else if (result.findings.length) for (const item of result.findings) process.stdout.write(`${item.code} ${item.path}:${item.line} ${item.message}\n`);
    else process.stdout.write(`0 legacy findings across ${result.counts.files} files\n`);
    process.exitCode = result.findings.length ? 1 : 0;
  } catch (error) {
    process.stderr.write(`Legacy audit configuration failure: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await runCli();
