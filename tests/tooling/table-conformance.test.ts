import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const resolver = resolve(process.cwd(), '.agents/skills/proj-table-adequation-v2/scripts/resolve-table-contract.mjs');
const auditor = resolve(process.cwd(), '.agents/skills/proj-table-adequation-v2/scripts/audit-table-conformance.mjs');
const target = 'src/components/molecules/ImportPreviousDietModal.tsx';

function run(script: string, args: string[]) {
  return JSON.parse(execFileSync(process.execPath, [script, ...args, '--json'], { encoding: 'utf8' }));
}

describe('table adequation v2 tooling', () => {
  it('resolves the live canonical DataTable contract and target composition', () => {
    const result = run(resolver, ['--target', target]);

    expect(result.schemaVersion).toBe(2);
    expect(result.canonical.source).toBe('src/components/molecules/DataTable.tsx');
    expect(result.canonical.capabilities.selection).toBe(true);
    expect(result.target.usesDataTable).toBe(true);
    expect(result.target.typedColumns).toBe(true);
    expect(result.target.props.attributes.maxHeight).toContain('table-modal');
    const badge = result.target.dependencies.find((dependency: { name: string }) => dependency.name === 'Badge');
    expect(badge?.source).toBe('src/components/atoms/Badge.tsx');
    expect(result.target.dependencyGraph.some((dependency: { path: string; depth: number }) =>
      dependency.path === 'src/components/atoms/Badge.tsx' && dependency.depth === 1,
    )).toBe(true);
  });

  it('audits the target with the current sources instead of a copied contract', () => {
    const result = run(auditor, ['--target', target, '--strict']);

    expect(result.summary.targets).toBe(1);
    expect(result.summary.errors).toBe(0);
    expect(result.findings.some((finding: { code: string }) => finding.code === 'CONTRACT_DRIFT')).toBe(false);
  });
});
