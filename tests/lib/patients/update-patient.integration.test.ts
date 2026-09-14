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
  handle = await openLocalDatabase({ mode: 'test-memory', dataDir: `memory://update-patient-${Date.now()}-${Math.random()}` });
  const patientRepository = new LocalPatientRepository(handle);
  const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
  const accountContext = createActiveAccountContext(new LocalAccountContextRepository(handle));
  return createPatientApplication({
    accountContext,
    patientRepository,
    objectiveCatalogRepository,
    patientProfileReader: createPatientProfileReader(
      patientRepository,
      objectiveCatalogRepository,
      async () => ({ dietCount: 2, assessmentCount: 3 }),
    ),
    transactionRunner: new LocalTransactionRunner(),
  });
}

const input = {
  name: 'Ana Lima',
  age: 32,
  gender: 'Feminino',
  heightCm: 165,
  weightKg: 62,
  phone: null,
  whatsapp: '11999990000',
  currentObjective: 'Manutenção',
  defaultMacroTargets: { proteinG: 110, carbsG: 200, fatsG: 55, kcal: 1755 },
};

describe('updatePatient use case', () => {
  it('updates only the current patient and increments its version', async () => {
    const app = await application();
    const created = await app.createPatient(input);
    const updated = await app.updatePatient(created.id, created.version, {
      ...input,
      name: '  Ana Lima Atualizada  ',
      weightKg: 64,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('Ana Lima Atualizada');
    expect(updated.weightKg).toBe(64);
    expect(updated.version).toBe(2);
    await expect(app.getPatientProfile(created.id)).resolves.toMatchObject({
      patient: { name: 'Ana Lima Atualizada', version: 2 },
      related: { dietCount: 2, assessmentCount: 3 },
    });
  });

  it('rejects a stale version without overwriting the latest confirmed data', async () => {
    const app = await application();
    const created = await app.createPatient(input);
    await app.updatePatient(created.id, created.version, { ...input, name: 'Primeira edição' });

    await expect(app.updatePatient(created.id, created.version, { ...input, name: 'Sobrescrita indevida' }))
      .rejects.toMatchObject({ code: 'STALE_VERSION' });
    await expect(app.getPatientProfile(created.id)).resolves.toMatchObject({ patient: { name: 'Primeira edição', version: 2 } });
  });

  it('rejects invalid and archived updates while preserving the record', async () => {
    const app = await application();
    const created = await app.createPatient(input);

    await expect(app.updatePatient(created.id, created.version, { ...input, weightKg: 0 }))
      .rejects.toMatchObject({ code: 'INVALID_FIELD' });
    const archived = await app.archivePatient(created.id, created.version);
    await expect(app.updatePatient(archived.id, archived.version, { ...input, name: 'Não editar' }))
      .rejects.toMatchObject({ code: 'ARCHIVED_PATIENT' });
    await expect(app.getPatientProfile(created.id)).resolves.toMatchObject({ patient: { name: 'Ana Lima', archivedAt: expect.any(String) } });
  });
});
