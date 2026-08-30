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
  handle = await openLocalDatabase({ mode: 'test-memory', dataDir: `memory://objective-catalog-${Date.now()}-${Math.random()}` });
  const patientRepository = new LocalPatientRepository(handle);
  const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
  return createPatientApplication({
    accountContext: createActiveAccountContext(new LocalAccountContextRepository(handle)),
    patientRepository,
    objectiveCatalogRepository,
    patientProfileReader: createPatientProfileReader(patientRepository, objectiveCatalogRepository),
    transactionRunner: new LocalTransactionRunner(),
  });
}

const patientInput = {
  name: 'Paciente do catálogo',
  age: 30,
  gender: 'Masculino',
  heightCm: 180,
  weightKg: 80,
  phone: null,
  whatsapp: null,
  currentObjective: 'Preparação para Maratona',
  defaultMacroTargets: { proteinG: 150, carbsG: 200, fatsG: 60, kcal: 2140 },
};

describe('objective catalog use cases', () => {
  it('normalizes custom labels and is idempotent within the active account', async () => {
    const app = await application();
    const first = await app.addObjectiveOption('  Preparação para Maratona ');
    const repeated = await app.addObjectiveOption('PREPARAÇÃO PARA MARATONA');

    expect(first.id).toBe(repeated.id);
    expect(first.normalizedLabel).toBe('preparação para maratona');
    expect((await app.listActivePatients()).length).toBe(0);
  });

  it('archives a custom option without rewriting a saved patient value', async () => {
    const app = await application();
    const option = await app.addObjectiveOption('Preparação para Maratona');
    const patient = await app.createPatient(patientInput);

    await app.archiveObjectiveOption(option.id);

    await expect(app.getPatientProfile(patient.id)).resolves.toMatchObject({
      patient: { currentObjective: 'Preparação para Maratona' },
      availableObjectives: expect.not.arrayContaining(['Preparação para Maratona']),
    });
    await expect(app.archiveObjectiveOption('missing-objective')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects an empty custom label before persistence', async () => {
    const app = await application();
    await expect(app.addObjectiveOption('   ')).rejects.toMatchObject({ code: 'INVALID_FIELD' });
  });
});
