import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const patientUiFiles = [
  'src/app/pacientes/page.tsx',
  'src/app/pacientes/[id]/page.tsx',
  'src/app/pacientes/[id]/PatientProfileModals.tsx',
  'src/hooks/usePatientsPage.ts',
  'src/hooks/usePatientProfilePage.ts',
  'src/hooks/useAssessmentWorkspacePage.ts',
  'src/hooks/useAssessmentForm.ts',
  'src/app/pacientes/[id]/avaliacao/[assessmentId]/page.tsx',
  'src/app/pacientes/[id]/consulta/[date]/page.tsx',
  'src/components/molecules/CreatePatientModal.tsx',
  'src/components/molecules/EditPatientModal.tsx',
  'src/components/molecules/DeletePatientModal.tsx',
  'src/components/molecules/AddObjectiveModal.tsx',
];

function readIfExists(relativePath: string): string {
  try {
    return readFileSync(join(root, relativePath), 'utf8');
  } catch {
    return '';
  }
}

describe('patient persistence boundary', () => {
  it('keeps patient UI orchestration independent from physical storage and legacy keys', () => {
    const violations = patientUiFiles.flatMap((file) => {
      const source = readIfExists(file);
      return /patientsStore|legacyClinicalStore|getConsultationRecord|nutridiet_(?:assessments_|patients)|localStorage|indexedDB|from ['\"]drizzle-orm|from ['\"]@electric-sql\/pglite/i.test(source) ? [file] : [];
    });

    expect(violations).toEqual([]);
  });

  it('keeps canonical domain/application modules free from UI and legacy storage imports', () => {
    const files = [
      'src/lib/domain/account.ts',
      'src/lib/domain/objective-option.ts',
      'src/lib/domain/patient.ts',
      'src/lib/application/composition-root.ts',
      'src/lib/application/account/account-context.ts',
      'src/lib/application/patients',
    ];
    const violations = files.flatMap((file) => {
      const source = readIfExists(file);
      return /localStorage|nutridiet_patients|diet_maker_custom_objectives|react['\"]|next\//i.test(source) ? [file] : [];
    });

    expect(violations).toEqual([]);
  });
});
