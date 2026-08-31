import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

const patientFlowFiles = [
  'src/app/pacientes/page.tsx',
  'src/app/pacientes/[id]/page.tsx',
  'src/app/pacientes/[id]/PatientProfileCurrentContext.tsx',
  'src/app/pacientes/[id]/PatientProfileModals.tsx',
  'src/hooks/usePatientsPage.ts',
  'src/hooks/usePatientProfilePage.ts',
  'src/components/molecules/CreatePatientModal.tsx',
  'src/components/molecules/EditPatientModal.tsx',
  'src/components/molecules/DeletePatientModal.tsx',
  'src/components/molecules/AddObjectiveModal.tsx',
  'src/lib/application/browser-composition.ts',
  'src/lib/application/composition-root.ts',
];

const canonicalFiles = [
  'src/lib/domain/account.ts',
  'src/lib/domain/objective-option.ts',
  'src/lib/domain/patient.ts',
  'src/lib/application/account/account-context.ts',
  'src/lib/application/patients',
  'src/lib/persistence',
  'src/lib/infrastructure/local-db',
];

function readSource(relativePath: string): string {
  const absolutePath = join(root, relativePath);
  try {
    return readFileSync(absolutePath, 'utf8');
  } catch {
    return '';
  }
}

function expandSources(relativePath: string): string[] {
  const source = readSource(relativePath);
  if (source) return [source];

  try {
    return readdirSync(join(root, relativePath), { withFileTypes: true })
      .flatMap((entry) => {
        const child = join(relativePath, entry.name);
        if (entry.isDirectory()) return expandSources(child);
        return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [readSource(child)] : [];
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

describe('legacy patient persistence cutover', () => {
  it('keeps the patient flow away from legacy storage imports and keys', () => {
    const forbidden = /patientsStore(?:['"]|Types)|localStorage|sessionStorage|nutridiet_patients|nutridiet_assessments_|nutridiet_diets_|diet_maker_custom_objectives/i;
    const violations = patientFlowFiles.flatMap((file) => forbidden.test(readSource(file)) ? [file] : []);

    expect(violations).toEqual([]);
  });

  it('keeps canonical patient modules free from legacy storage and UI dependencies', () => {
    const forbidden = /localStorage|sessionStorage|nutridiet_patients|nutridiet_assessments_|nutridiet_diets_|diet_maker_custom_objectives|from ['"]react['"]|from ['"]next\//i;
    const violations = canonicalFiles.flatMap((file) => expandSources(file).some((source) => forbidden.test(source)) ? [file] : []);

    expect(violations).toEqual([]);
  });

  it('does not introduce a next-follow-up persistence column in the canonical patient model', () => {
    const canonicalSources = [
      readSource('src/lib/domain/patient.ts'),
      readSource('src/lib/infrastructure/local-db/schema.ts'),
      readSource('src/lib/infrastructure/local-db/patient-repository.ts'),
    ].join('\n');

    expect(canonicalSources).not.toMatch(/nextEvent|next_event/i);
  });
});
