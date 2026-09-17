import { describe, expect, it } from 'vitest';
import {
  createPatientApplication,
  type PatientApplicationDependencies,
} from '@/lib/application/composition-root';
import type { AccountContextSnapshot } from '@/lib/persistence/account-context';
import type { Patient, PatientInput } from '@/lib/domain/patient';

const account: AccountContextSnapshot = {
  accountId: 'account-test',
  account: { id: 'account-test', displayName: 'Consultório de Teste', createdAt: '2026-08-30T00:00:00.000Z', updatedAt: '2026-08-30T00:00:00.000Z' },
};

const input: PatientInput = {
  name: 'João Silva',
  age: 30,
  gender: 'Masculino',
  birthDate: '1995-01-01',
  isPregnant: false,
  pregnancyDueDate: null,
  heightCm: 180,
  weightKg: 80,
  phone: null,
  whatsapp: '11999990000',
  currentObjective: 'Cutting',
  defaultMacroTargets: { proteinG: 150, carbsG: 200, fatsG: 60, kcal: 2140 },
};

function makeDependencies(overrides: Partial<PatientApplicationDependencies> = {}): PatientApplicationDependencies {
  const patient: Patient = {
    id: 'patient-test',
    accountId: account.accountId,
    displayCode: 'P-0001',
    ...input,
    age: input.age ?? null,
    gender: input.gender ?? '',
    birthDate: input.birthDate ?? null,
    isPregnant: input.isPregnant ?? false,
    pregnancyDueDate: input.pregnancyDueDate ?? null,
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    currentObjective: input.currentObjective ?? null,
    defaultMacroTargets: {
      proteinG: input.defaultMacroTargets?.proteinG ?? null,
      carbsG: input.defaultMacroTargets?.carbsG ?? null,
      fatsG: input.defaultMacroTargets?.fatsG ?? null,
      kcal: input.defaultMacroTargets?.kcal ?? null,
    },
    createdAt: '2026-08-30T00:00:00.000Z',
    updatedAt: '2026-08-30T00:00:00.000Z',
    version: 1,
    archivedAt: null,
  };

  return {
    accountContext: {
      getActive: async () => account,
      requireActive: async () => account,
    },
    patientRepository: {
      create: async () => patient,
      getById: async () => patient,
      listActive: async () => [patient],
      update: async (_accountId, _patientId, expectedVersion, updateInput) => ({
        ...patient,
        ...updateInput,
        age: updateInput.age ?? null,
        gender: updateInput.gender ?? '',
        birthDate: updateInput.birthDate ?? null,
        isPregnant: updateInput.isPregnant ?? false,
        pregnancyDueDate: updateInput.pregnancyDueDate ?? null,
        heightCm: updateInput.heightCm ?? null,
        weightKg: updateInput.weightKg ?? null,
        currentObjective: updateInput.currentObjective ?? null,
        defaultMacroTargets: {
          proteinG: updateInput.defaultMacroTargets?.proteinG ?? null,
          carbsG: updateInput.defaultMacroTargets?.carbsG ?? null,
          fatsG: updateInput.defaultMacroTargets?.fatsG ?? null,
          kcal: updateInput.defaultMacroTargets?.kcal ?? null,
        },
        version: expectedVersion + 1,
        updatedAt: '2026-08-30T00:00:01.000Z',
      }),
      archive: async () => ({ ...patient, archivedAt: '2026-08-30T00:00:01.000Z', version: 2 }),
      restore: async () => ({ ...patient, version: 2 }),
    },
    objectiveCatalogRepository: {
      list: async () => [],
      addCustom: async () => ({ id: 'objective-test', accountId: account.accountId, label: 'Cutting', normalizedLabel: 'cutting', origin: 'CUSTOM', archivedAt: null, createdAt: '2026-08-30T00:00:00.000Z', updatedAt: '2026-08-30T00:00:00.000Z' }),
      archiveCustom: async () => undefined,
    },
    patientProfileReader: {
      getProfile: async () => ({ patient, initials: 'JS', availableObjectives: ['Cutting'], related: { dietCount: 0, assessmentCount: 0 } }),
      listActiveSummaries: async () => [],
    },
    transactionRunner: {
      run: async <T>(operation: () => Promise<T>) => operation(),
    },
    ...overrides,
  };
}

describe('patient application boundary', () => {
  it('passes only the validated active account to create and returns a typed entity', async () => {
    const dependencies = makeDependencies();
    const application = createPatientApplication(dependencies);
    const result = await application.createPatient(input);

    expect(result.id).toBe('patient-test');
    expect(result.accountId).toBe(account.accountId);
  });

  it('fails closed when the active account context is unavailable', async () => {
    const application = createPatientApplication(makeDependencies({
      accountContext: {
        getActive: async () => null,
        requireActive: async () => { throw new Error('Conta ausente'); },
      },
    }));

    await expect(application.listActivePatients()).rejects.toThrow('Conta');
  });

  it('does not report success after a repository failure or partial mutation', async () => {
    let writes = 0;
    const application = createPatientApplication(makeDependencies({
      patientRepository: {
        ...makeDependencies().patientRepository,
        create: async () => { writes += 1; throw new Error('falha de persistência'); },
      },
    }));

    await expect(application.createPatient(input)).rejects.toThrow('persistência');
    expect(writes).toBe(1);
  });
});
