import { afterEach, describe, expect, it } from 'vitest';
import { createActiveAccountContext } from '@/lib/application/account/get-active-account';
import { createPatientApplication } from '@/lib/application/composition-root';
import { createPatientProfileReader } from '@/lib/application/patients/patient-profile-reader';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { LocalObjectiveCatalogRepository } from '@/lib/infrastructure/local-db/objective-catalog-repository';
import { LocalPatientRepository } from '@/lib/infrastructure/local-db/patient-repository';
import { LocalTransactionRunner } from '@/lib/infrastructure/local-db/transaction-runner';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

async function application() {
  handle = await openLocalDatabase({ mode: 'test-memory', dataDir: `memory://archive-restore-${Date.now()}-${Math.random()}` });
  const patientRepository = new LocalPatientRepository(handle);
  const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
  return createPatientApplication({
    accountContext: createActiveAccountContext(new LocalAccountContextRepository(handle)),
    patientRepository,
    objectiveCatalogRepository,
    patientProfileReader: createPatientProfileReader(
      patientRepository,
      objectiveCatalogRepository,
      async () => ({ dietCount: 1, assessmentCount: 1 }),
    ),
    transactionRunner: new LocalTransactionRunner(),
  });
}

const input = {
  name: 'Paciente com histórico',
  age: 40,
  gender: 'Masculino',
  birthDate: '1986-03-20',
  heightCm: 178,
  weightKg: 84,
  phone: null,
  whatsapp: '11999990000',
  currentObjective: 'Cutting',
  defaultMacroTargets: { proteinG: 170, carbsG: 180, fatsG: 70, kcal: 2030 },
};

describe('archive and restore patient use cases', () => {
  it('archives logically, hides from active list and preserves related records', async () => {
    const app = await application();
    const created = await app.createPatient(input);
    const archived = await app.archivePatient(created.id, created.version);

    expect(archived.id).toBe(created.id);
    expect(archived.archivedAt).toEqual(expect.any(String));
    expect(await app.listActivePatients()).toEqual([]);
    await expect(app.getPatientProfile(created.id)).resolves.toMatchObject({
      patient: { id: created.id, archivedAt: expect.any(String) },
      related: { dietCount: 1, assessmentCount: 1 },
    });
    await expect(app.updatePatient(created.id, archived.version, input)).rejects.toMatchObject({ code: 'ARCHIVED_PATIENT' });
  });

  it('requires the expected version and supports restoration without duplicating the patient', async () => {
    const app = await application();
    const created = await app.createPatient(input);
    const changed = await app.updatePatient(created.id, created.version, { ...input, name: 'Paciente atualizado' });
    const archived = await app.archivePatient(created.id, changed.version);

    await expect(app.archivePatient(created.id, created.version)).rejects.toMatchObject({ code: 'STALE_VERSION' });
    const restored = await app.restorePatient(created.id, archived.version);
    expect(restored).toMatchObject({ id: created.id, name: 'Paciente atualizado', archivedAt: null, version: 4 });
    expect((await app.listActivePatients()).map((row) => row.patient.id)).toEqual([created.id]);
    await expect(app.restorePatient(created.id, restored.version)).rejects.toMatchObject({ code: 'ALREADY_ACTIVE' });
  });

  it('fails without changing another account or the existing patient state', async () => {
    const app = await application();
    const created = await app.createPatient(input);

    await expect(app.archivePatient('missing-patient', 1)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(app.getPatientProfile(created.id)).resolves.toMatchObject({ patient: { archivedAt: null, version: 1 } });
  });
});
