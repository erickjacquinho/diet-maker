import { afterEach, describe, expect, it } from 'vitest';
import { createActiveAccountContext } from '@/lib/application/account/get-active-account';
import { createPatientApplication } from '@/lib/application/composition-root';
import { createPatientProfileReader } from '@/lib/application/patients/patient-profile-reader';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { LocalObjectiveCatalogRepository } from '@/lib/infrastructure/local-db/objective-catalog-repository';
import { LocalPatientRepository } from '@/lib/infrastructure/local-db/patient-repository';
import { LocalTransactionRunner } from '@/lib/infrastructure/local-db/transaction-runner';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

async function application() {
  handle = await openLocalDatabase({ mode: 'test-memory', dataDir: `memory://create-list-${Date.now()}-${Math.random()}` });
  const patientRepository = new LocalPatientRepository(handle);
  const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
  const accountContext = createActiveAccountContext(new LocalAccountContextRepository(handle));
  return createPatientApplication({
    accountContext,
    patientRepository,
    objectiveCatalogRepository,
    patientProfileReader: createPatientProfileReader(patientRepository, objectiveCatalogRepository),
    transactionRunner: new LocalTransactionRunner(),
  });
}

const input = (name: string, objective: string) => ({
  name,
  age: 30,
  gender: 'Masculino',
  heightCm: 180,
  weightKg: 80,
  phone: null,
  whatsapp: null,
  currentObjective: objective,
  defaultMacroTargets: { proteinG: 150, carbsG: 200, fatsG: 60, kcal: 2140 },
});

describe('patient create, list and profile use cases', () => {
  it('creates normalized patients and filters without mutating the repository', async () => {
    const app = await application();
    const first = await app.createPatient(input(' Ana Lima ', 'Cutting'));
    await app.createPatient(input('Bruno Souza', 'Bulking'));

    expect(first.name).toBe('Ana Lima');
    expect((await app.listActivePatients('ana')).map((row) => row.patient.name)).toEqual(['Ana Lima']);
    expect((await app.listActivePatients('BULK')).map((row) => row.patient.name)).toEqual(['Bruno Souza']);
    expect((await app.listActivePatients()).length).toBe(2);
  });

  it('rejects invalid forms and reports an explicit missing profile', async () => {
    const app = await application();
    await expect(app.createPatient(input('   ', 'Cutting'))).rejects.toMatchObject({ code: 'INVALID_FIELD' });
    await expect(app.createPatient({ ...input('João Inválido', 'Cutting'), heightCm: 0 })).rejects.toMatchObject({ code: 'INVALID_FIELD' });
    await expect(app.getPatientProfile('does-not-exist')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('does not expose a patient when a different account context asks for its id', async () => {
    const app = await application();
    const created = await app.createPatient(input('Ana Protegida', 'Cutting'));
    const otherAccountApplication = createPatientApplication({
      accountContext: {
        getActive: async () => null,
        requireActive: async () => ({
          accountId: 'account-other',
          account: {
            id: 'account-other',
            displayName: 'Outra Conta',
            createdAt: '2026-08-30T00:00:00.000Z',
            updatedAt: '2026-08-30T00:00:00.000Z',
          },
        }),
      },
      patientRepository: new LocalPatientRepository(handle!),
      objectiveCatalogRepository: new LocalObjectiveCatalogRepository(handle!),
      patientProfileReader: createPatientProfileReader(
        new LocalPatientRepository(handle!),
        new LocalObjectiveCatalogRepository(handle!),
      ),
      transactionRunner: new LocalTransactionRunner(),
    });

    await expect(otherAccountApplication.getPatientProfile(created.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
