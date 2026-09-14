import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

describe('patient flow design-system contract', () => {
  it('keeps the destructive patient action aligned with the catalog profile', () => {
    const profile = readSource('design-system/components/profiles/molecules/delete-patient-modal.md');
    const registry = readSource('design-system/components/registry.json');
    const implementation = readSource('src/components/molecules/DeletePatientModal.tsx');

    expect(profile).toContain('molecule-delete-patient-modal');
    expect(profile).toContain('arquivamento');
    expect(profile).toContain('HoldToDeleteButton');
    expect(registry).toContain('"id": "molecule-delete-patient-modal"');
    expect(registry).toContain('"path": "src/components/molecules/DeletePatientModal.tsx"');
    expect(implementation).toContain('variant="secondary"');
    expect(implementation).toContain('role="alert"');
    expect(implementation).toContain('onError={handleArchiveError}');
  });

  it('keeps the patient flow on tokenized styles and outside ui primitive edits', () => {
    const implementationFiles = [
      'src/components/molecules/CreatePatientModal.tsx',
      'src/components/molecules/EditPatientModal.tsx',
      'src/components/molecules/DeletePatientModal.tsx',
      'src/components/molecules/AddObjectiveModal.tsx',
      'src/app/pacientes/page.tsx',
      'src/app/pacientes/[id]/page.tsx',
    ];
    const arbitraryZPrefix = ['z-', '['].join('');
    const forbidden = new RegExp(`# [0-9a-f]{3,8}\\b|transition-all|${arbitraryZPrefix}[^\\]]+\\]`.replace('# ', '#'), 'i');
    const violations = implementationFiles.filter((file) => forbidden.test(readSource(file)));

    expect(violations).toEqual([]);
  });

  it('exposes explicit accessible states for forms and archive confirmation', () => {
    const sources = [
      readSource('src/components/molecules/CreatePatientModal.tsx'),
      readSource('src/components/molecules/EditPatientModal.tsx'),
      readSource('src/components/molecules/AddObjectiveModal.tsx'),
      readSource('src/components/molecules/DeletePatientModal.tsx'),
    ].join('\n');

    expect(sources).toContain('aria-describedby');
    expect(sources).toContain('role="alert"');
    expect(sources).toContain('disabled={isSubmitting}');
    expect(sources).toContain('Pressione e segure por 1,5 segundos');
  });
});
