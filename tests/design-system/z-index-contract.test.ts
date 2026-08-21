import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const canonicalLayers = {
  'z-base': 0,
  'z-raised': 10,
  'z-sticky': 20,
  'z-navigation': 30,
  'z-dropdown': 40,
  'z-popover': 50,
  'z-overlay': 60,
  'z-modal': 70,
  'z-toast': 80,
  'z-tooltip': 90,
} as const;

type LayerContext = 'default' | 'modal';
type LayerOccurrence = {
  file: string;
  line: number;
  token: string;
  context: LayerContext;
};

const inventoryRoots = ['src', 'tests'];
const ignoredFiles = new Set([
  'tests/design-system/z-index-contract.test.ts',
  'tests/design-system/z-index-audit.test.mjs',
]);

function collectFiles(directory: string): string[] {
  const absoluteDirectory = path.join(root, directory);
  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(directory, entry.name).replaceAll(path.sep, '/');
    if (entry.isDirectory()) return collectFiles(relativePath);
    if (!/\.(?:tsx?|css|mjs)$/.test(entry.name) || ignoredFiles.has(relativePath)) return [];
    return [relativePath];
  });
}

function collectOccurrences(file: string): LayerOccurrence[] {
  const source = readFileSync(path.join(root, file), 'utf8');
  const backtick = String.fromCharCode(96);
  const layerPattern = new RegExp("\\bz-" + "[^\\s\\\"'" + backtick + "]+", 'g');

  return source.split(/\r?\n/).flatMap((line, index) =>
    [...line.matchAll(layerPattern)].map((match) => ({
      file,
      line: index + 1,
      token: match[0].replace(/[),;"']+$/, ''),
      context: file.includes('DatePicker') ? 'modal' : 'default',
    })),
  );
}

function readSource(file: string): string {
  return readFileSync(path.join(root, file), 'utf8');
}

describe('z-index layer inventory contract', () => {
  it('records every layer occurrence with a file, line, token and context', () => {
    const files = inventoryRoots.flatMap(collectFiles);
    const occurrences = files.flatMap(collectOccurrences);

    expect(occurrences.length).toBeGreaterThan(0);
    expect(occurrences.every((occurrence) => occurrence.file && occurrence.line > 0)).toBe(true);
    expect(occurrences.every((occurrence) => occurrence.context === 'default' || occurrence.context === 'modal')).toBe(true);
    expect(occurrences.every((occurrence) => occurrence.token in canonicalLayers)).toBe(true);
  });

  it('covers the identified primitive and consumer files', () => {
    const expectedFiles = [
      'src/components/ui/dialog.tsx',
      'src/components/ui/sheet.tsx',
      'src/components/ui/dropdown-menu.tsx',
      'src/components/ui/select.tsx',
      'src/components/ui/popover.tsx',
      'src/components/ui/tooltip.tsx',
      'src/components/ui/calendar.tsx',
      'src/components/molecules/DatePickerField.tsx',
      'src/components/molecules/CreateRecipeModal.tsx',
      'src/components/organisms/PatientListTable.tsx',
      'src/app/refeicoes-prontas/page.tsx',
      'src/app/receitas/page.tsx',
      'src/app/pacientes/page.tsx',
      'src/app/alimentos/page.tsx',
      'src/app/presets/page.tsx',
    ];

    for (const file of expectedFiles) {
      expect(existsSync(path.join(root, file)), file).toBe(true);
    }
  });

  it('keeps the central Tailwind map aligned with the canonical values', () => {
    const source = readSource('tailwind.config.js');

    expect(source).toContain('zIndex:');
    for (const [token, value] of Object.entries(canonicalLayers)) {
      const key = token.replace('z-', '');
      expect(source).toContain(key + ": '" + value + "'");
    }
  });
});

describe('z-index forbidden usage contract', () => {
  it('rejects raw numeric layers and inline z-index styles outside the central map', () => {
    const files = inventoryRoots.flatMap(collectFiles);
    const source = files.map((file) => readSource(file)).join('\n');
    const rawRaisedToken = ['z-', '10'].join('');
    const arbitraryTokenPrefix = ['z-', '['].join('');
    const inlineStyle = ['style', 'zIndex'].join('.');

    expect(source).not.toContain(rawRaisedToken);
    expect(source).not.toContain(arbitraryTokenPrefix);
    expect(source).not.toContain(inlineStyle);
  });

  it('keeps each primitive family on its semantic default and explicit modal context', () => {
    const dropdownSource = readSource('src/components/ui/dropdown-menu.tsx');
    const selectSource = readSource('src/components/ui/select.tsx');
    const popoverSource = readSource('src/components/ui/popover.tsx');
    const sheetSource = readSource('src/components/ui/sheet.tsx');
    const datePickerSource = readSource('src/components/molecules/DatePickerField.tsx');

    expect(dropdownSource).toContain('z-dropdown');
    expect(dropdownSource).not.toContain('z-popover');
    expect(selectSource).toContain('z-dropdown');
    expect(selectSource).toContain('z-modal');
    expect(popoverSource).toContain('z-popover');
    expect(popoverSource).toContain('z-modal');
    expect(sheetSource).toContain('z-overlay');
    expect(sheetSource).toContain('z-modal');
    expect(datePickerSource).toContain('layer="modal"');
    expect(datePickerSource).not.toContain('z-modal');
  });
});
