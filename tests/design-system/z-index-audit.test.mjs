import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { auditLayerSources } from '../../scripts/audit-z-index.mjs';

const root = process.cwd();
const script = path.join(root, 'scripts/audit-z-index.mjs');

describe('z-index audit contract', () => {
  it('reports actionable findings for forbidden and contextually wrong layers', () => {
    const rawNumeric = ['z-', '10'].join('');
    const arbitrary = ['z-', '[999]'].join('');
    const inlineStyle = ['style', 'zIndex'].join('.');
    const wrongDropdownToken = ['z-', 'popover'].join('');

    const result = auditLayerSources([
      {
        path: 'src/components/ui/example.tsx',
        source: '<div className="' + rawNumeric + ' ' + arbitrary + '" ' + inlineStyle + '={{}} />',
      },
      {
        path: 'src/components/ui/dropdown-menu.tsx',
        source: 'const content = "' + wrongDropdownToken + '";',
      },
      {
        path: 'src/components/ui/sheet.tsx',
        source: [
          'const sheetVariants = cva(',
          '  "fixed z-overlay",',
          ');',
          'interface SheetContentProps {}',
        ].join('\n'),
      },
    ]);

    expect(result.findings.map((item) => item.code)).toEqual(
      expect.arrayContaining(['ZI001', 'ZI002', 'ZI003', 'ZI005']),
    );
    expect(result.findings.every((item) => item.path && item.line > 0 && item.severity === 'error')).toBe(true);
    expect(result.findings.every((item) => item.message && item.expected)).toBe(true);
  });

  it('keeps the strict CLI clean for canonical primitives and the central map', () => {
    const output = execFileSync(
      process.execPath,
      [script, '--strict', '--json', '--paths', 'src/components/ui/dialog.tsx,tailwind.config.js'],
      { cwd: root, encoding: 'utf8' },
    );
    const result = JSON.parse(output) as { findings: unknown[]; counts: { files: number } };

    expect(result.findings).toEqual([]);
    expect(result.counts.files).toBe(2);
  });
});

