import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const EXTENSIONS = new Set(['.css', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
const DEFAULT_PATHS = ['src', 'tests', 'tailwind.config.js'];
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.next', 'dist', 'coverage']);
const SKIPPED_PATH_PREFIXES = ['tests/fixtures/', 'tests/design-system/z-index-audit.test.mjs'];
const CANONICAL_TOKENS = new Set([
  'z-base',
  'z-raised',
  'z-sticky',
  'z-navigation',
  'z-dropdown',
  'z-popover',
  'z-overlay',
  'z-modal',
  'z-toast',
  'z-tooltip',
]);

function normalize(projectPath) {
  return projectPath.replaceAll(path.sep, '/');
}

function isSkipped(projectPath) {
  const normalized = normalize(projectPath);
  return SKIPPED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix) || normalized === prefix);
}

function matchesProjectPath(projectPath, suffix) {
  const normalized = normalize(projectPath);
  return normalized === suffix || normalized.endsWith('/' + suffix);
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function discover(target) {
  if (!(await exists(target))) throw new Error('Scope does not exist: ' + target);
  const info = await stat(target);
  if (info.isFile()) return EXTENSIONS.has(path.extname(target)) ? [target] : [];

  const entries = await readdir(target, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
    files.push(...(await discover(path.join(target, entry.name))));
  }
  return files;
}

function finding(pathname, line, code, rule, message, expected) {
  return {
    code,
    rule,
    path: pathname,
    line,
    severity: 'error',
    message,
    expected,
  };
}

function auditLayerSources(sources) {
  const findings = [];

  for (const sourceEntry of sources.sort((left, right) => left.path.localeCompare(right.path))) {
    const pathname = normalize(sourceEntry.path);
    if (isSkipped(pathname)) continue;

    const lines = sourceEntry.source.split(/\r?\n/);
    const sheetVariantsStart = matchesProjectPath(pathname, 'src/components/ui/sheet.tsx')
      ? lines.findIndex((line) => line.includes('const sheetVariants'))
      : -1;
    const sheetContentBoundary = sheetVariantsStart >= 0
      ? lines.findIndex((line, index) => index > sheetVariantsStart && line.includes('interface SheetContentProps'))
      : -1;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const layerPattern = /\bz-(?:base|raised|sticky|navigation|dropdown|popover|overlay|modal|toast|tooltip|\d+|\[[^\s"'`]+\])/g;

      for (const match of line.matchAll(layerPattern)) {
        const token = match[0];
        if (/^z-\d+$/.test(token)) {
          findings.push(finding(pathname, lineIndex + 1, 'ZI001', 'raw-numeric-layer', 'Use the semantic layer token instead of a raw numeric z-index class.', 'canonical z-* token'));
        } else if (token.startsWith('z-[')) {
          findings.push(finding(pathname, lineIndex + 1, 'ZI001', 'arbitrary-layer', 'Arbitrary z-index classes are not allowed outside the central token map.', 'canonical z-* token'));
        } else if (!CANONICAL_TOKENS.has(token)) {
          findings.push(finding(pathname, lineIndex + 1, 'ZI001', 'unknown-layer-token', 'The layer token is not part of the canonical Design System scale.', 'canonical z-* token'));
        }
      }

      if (/style\s*\.\s*zIndex/.test(line)) {
        findings.push(finding(pathname, lineIndex + 1, 'ZI002', 'inline-z-index', 'Inline zIndex styles bypass the canonical layer contract.', 'semantic z-* token'));
      }

      if (matchesProjectPath(pathname, 'src/components/ui/dropdown-menu.tsx') && line.includes('z-popover')) {
        findings.push(finding(pathname, lineIndex + 1, 'ZI003', 'dropdown-layer', 'DropdownMenu content must use z-dropdown, not z-popover.', 'z-dropdown'));
      }

      if (matchesProjectPath(pathname, 'src/components/ui/select.tsx') && line.includes('z-popover')) {
        findings.push(finding(pathname, lineIndex + 1, 'ZI004', 'select-layer', 'SelectContent must use z-dropdown by default.', 'z-dropdown or explicit z-modal'));
      }

      if (
        sheetVariantsStart >= 0 &&
        sheetContentBoundary > sheetVariantsStart &&
        lineIndex > sheetVariantsStart &&
        lineIndex < sheetContentBoundary &&
        line.includes('z-overlay')
      ) {
        findings.push(finding(pathname, lineIndex + 1, 'ZI005', 'sheet-content-layer', 'SheetContent must be above SheetOverlay and use z-modal.', 'z-modal'));
      }
    }

    if (matchesProjectPath(pathname, 'src/components/molecules/DatePickerField.tsx')) {
      const hasModalContext = /layer\s*=\s*["']modal["']/.test(sourceEntry.source);
      if (!hasModalContext) {
        const line = lines.findIndex((item) => item.includes('PopoverContent'));
        findings.push(finding(pathname, line >= 0 ? line + 1 : 1, 'ZI006', 'modal-context', 'DatePickerField must declare modal context for its calendar popover.', 'layer="modal"'));
      }
    }
  }

  findings.sort((left, right) =>
    (left.path + ':' + String(left.line).padStart(6, '0') + ':' + left.code)
      .localeCompare(right.path + ':' + String(right.line).padStart(6, '0') + ':' + right.code),
  );

  return {
    mode: 'strict',
    findings,
    counts: {
      files: sources.length,
      findings: findings.length,
    },
  };
}

export async function auditZIndex(rootDir, options = {}) {
  const requested = options.paths ?? DEFAULT_PATHS;
  const absoluteFiles = [
    ...new Set((await Promise.all(requested.map((item) => discover(path.resolve(rootDir, item))))).flat()),
  ].sort();

  const sources = [];
  for (const absolute of absoluteFiles) {
    const projectPath = normalize(path.relative(rootDir, absolute));
    sources.push({ path: projectPath, source: await readFile(absolute, 'utf8') });
  }

  return auditLayerSources(sources);
}

export { auditLayerSources };

function parseArgs(args) {
  const paths = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--paths') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--paths requires a scope.');
      paths.push(...value.split(',').filter(Boolean));
      index += 1;
    }
  }

  return {
    mode: args.includes('--strict') ? 'strict' : 'inventory',
    json: args.includes('--json'),
    paths: paths.length ? paths : DEFAULT_PATHS,
  };
}

async function runCli() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await auditZIndex(process.cwd(), options);
    result.mode = options.mode;

    if (options.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else if (result.findings.length) {
      for (const item of result.findings) {
        process.stdout.write(item.code + ' ' + item.path + ':' + item.line + ' ' + item.message + '\n');
      }
    } else {
      process.stdout.write('0 z-index findings across ' + result.counts.files + ' files\n');
    }

    process.exitCode = result.findings.length ? 1 : 0;
  } catch (error) {
    process.stderr.write('Z-index audit configuration failure: ' + error.message + '\n');
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await runCli();
}
