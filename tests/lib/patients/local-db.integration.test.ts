import { afterEach, describe, expect, it } from 'vitest';
import { createActiveAccountContext } from '@/lib/application/account/get-active-account';
import { createPatientProfileReader } from '@/lib/application/patients/patient-profile-reader';
import { applyMigrations } from '@/lib/infrastructure/local-db/migrations';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { LocalObjectiveCatalogRepository } from '@/lib/infrastructure/local-db/objective-catalog-repository';
import { LocalPatientRepository } from '@/lib/infrastructure/local-db/patient-repository';
import { createPatientApplication } from '@/lib/application/composition-root';
import { LocalTransactionRunner } from '@/lib/infrastructure/local-db/transaction-runner';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

async function createApplication() {
  handle = await openLocalDatabase({ mode: 'test-memory', dataDir: `memory://patient-test-${Date.now()}-${Math.random()}` });
  const patientRepository = new LocalPatientRepository(handle);
  const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
  const accountContext = createActiveAccountContext(new LocalAccountContextRepository(handle));
  const patientProfileReader = createPatientProfileReader(patientRepository, objectiveCatalogRepository);
  return createPatientApplication({
    accountContext,
    patientRepository,
    objectiveCatalogRepository,
    patientProfileReader,
    transactionRunner: new LocalTransactionRunner(),
  });
}

const patientInput = {
  name: '  Ana Lima ',
  age: 32,
  gender: 'Feminino',
  birthDate: '1994-06-12',
  heightCm: 165,
  weightKg: 62,
  phone: null,
  whatsapp: '11999990000',
  currentObjective: 'Manutenção',
  defaultMacroTargets: { proteinG: 110, carbsG: 200, fatsG: 55, kcal: 1755 },
};

describe('local relational patient adapter', () => {
  it('applies migrations idempotently and creates a stable account with default objectives', async () => {
    const application = await createApplication();
    expect(await applyMigrations(handle!.client)).toBe('6');
    const account = await application.listActivePatients();
    expect(account).toEqual([]);
    const profile = await application.addObjectiveOption('Preparação para Maratona');
    expect(profile.normalizedLabel).toBe('preparação para maratona');
  });

  it('enforces account scope, active listing and optimistic versioning', async () => {
    const application = await createApplication();
    const created = await application.createPatient(patientInput);
    expect(created.displayCode).toBe('P-0001');
    expect(created.version).toBe(1);

    const updated = await application.updatePatient(created.id, created.version, {
      ...patientInput,
      name: 'Ana Lima Atualizada',
    });
    expect(updated.version).toBe(2);
    await expect(application.updatePatient(created.id, created.version, patientInput)).rejects.toMatchObject({ code: 'STALE_VERSION' });

    const archived = await application.archivePatient(created.id, updated.version);
    expect(archived.archivedAt).not.toBeNull();
    expect(await application.listActivePatients()).toEqual([]);
    await expect(application.getPatientProfile(created.id)).resolves.toMatchObject({ patient: { archivedAt: expect.any(String) } });
    await expect(application.restorePatient(created.id, archived.version)).resolves.toMatchObject({ version: 4, archivedAt: null });
    expect((await application.listActivePatients())[0].patient.name).toBe('Ana Lima Atualizada');
  });
});
