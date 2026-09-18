import { afterEach, describe, expect, it } from 'vitest';
import { createActiveAccountContext } from '@/lib/application/account/get-active-account';
import { createPatientApplication } from '@/lib/application/composition-root';
import { createPatientProfileReader } from '@/lib/application/patients/patient-profile-reader';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { LocalObjectiveCatalogRepository } from '@/lib/infrastructure/local-db/objective-catalog-repository';
import { LocalPatientRepository } from '@/lib/infrastructure/local-db/patient-repository';
import { LocalTransactionRunner } from '@/lib/infrastructure/local-db/transaction-runner';
import { accounts, bodyAssessments, nextFollowUps, patients } from '@/lib/infrastructure/local-db/schema';
import { getTodayDateKey } from '@/lib/patientListDateUtils';
import { buildPatientListRows } from '@/lib/patientListView';
import { toPatientViewModel } from '@/lib/patientViewModel';

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
  birthDate: '1990-01-01',
  heightCm: 180,
  weightKg: 80,
  phone: null,
  whatsapp: '11999990000',
  currentObjective: objective,
  defaultMacroTargets: { proteinG: 150, carbsG: 200, fatsG: 60, kcal: 2140 },
});

function offsetDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function legacyDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
}

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

  it('returns account-scoped 25-row pages with global search and the existing group/order across page boundaries', async () => {
    const app = await application();
    await app.listActivePatients();
    const today = getTodayDateKey();
    const createdAt = `${today}T12:00:00.000Z`;
    const todayNames = ['Álvaro', 'Aline', 'Ana', 'Érica', 'Erika'];
    const rows = Array.from({ length: 50 }, (_, index) => {
      const group = index < 10 ? 'atrasado' : index < 15 ? 'hoje' : index < 40 ? 'proximo' : 'sem-evento';
      const suffix = String(index).padStart(2, '0');
      return {
        id: `patient-${suffix}`, accountId: 'local-account', displayCode: `P-${suffix}`,
        name: group === 'hoje' ? todayNames[index - 10] : `${group} ${suffix}`,
        gender: 'Feminino', currentObjective: index % 2 === 0 ? 'Recorte' : 'Manutenção',
        createdAt, updatedAt: createdAt, version: 1, archivedAt: null,
      };
    });
    await handle!.db.insert(patients).values([
      ...rows,
      { id: 'patient-archived', accountId: 'local-account', displayCode: 'P-ARCHIVED', name: 'Paciente arquivado', gender: 'Feminino', currentObjective: 'Recorte', createdAt, updatedAt: createdAt, version: 1, archivedAt: createdAt },
    ]);
    await handle!.db.insert(accounts).values({ id: 'account-other', displayName: 'Outra Conta', phone: null, createdAt, updatedAt: createdAt });
    await handle!.db.insert(patients).values({ id: 'patient-other', accountId: 'account-other', displayCode: 'P-OTHER', name: 'Paciente externo', gender: 'Feminino', currentObjective: 'Recorte', createdAt, updatedAt: createdAt, version: 1, archivedAt: null });

    const followUps = rows.flatMap((patient, index) => {
      const dueDate = index < 10 ? offsetDateKey(today, index - 10)
        : index < 15 ? today
          : index < 40 ? offsetDateKey(today, Math.ceil((index - 14) / 2))
            : null;
      return dueDate ? [{ accountId: 'local-account', patientId: patient.id, dueDate, type: 'ASSESSMENT_UPDATE', version: 1, createdAt, updatedAt: createdAt }] : [];
    });
    await handle!.db.insert(nextFollowUps).values(followUps);
    const assessmentDates = [
      { patientId: 'patient-41', clinicalDate: offsetDateKey(today, -60) },
      { patientId: 'patient-42', clinicalDate: offsetDateKey(today, -30) },
    ];
    await handle!.db.insert(bodyAssessments).values(assessmentDates.map(({ patientId, clinicalDate }) => ({
      id: `assessment-${patientId}`, accountId: 'local-account', patientId, clinicalDate, weightKg: '70',
      autoFilledFields: [], calculationMethod: 'NONE', calculationVersion: 'simplified-v1',
      calculationInputSnapshot: { assessmentType: 'simplified', heightCm: 165, weightKg: 70 },
      version: 1, createdAt: `${clinicalDate}T12:00:00.000Z`, updatedAt: `${clinicalDate}T12:00:00.000Z`,
    })));

    const activePatients = await new LocalPatientRepository(handle!).listActive('local-account');
    const followUpByPatient = new Map(followUps.map((followUp) => [followUp.patientId, followUp]));
    const activityByPatient = new Map(assessmentDates.map(({ patientId, clinicalDate }) => [patientId, { at: legacyDate(clinicalDate), type: 'assessment' as const }]));
    const expectedIds = buildPatientListRows(activePatients.map((patient) => {
      const followUp = followUpByPatient.get(patient.id);
      return toPatientViewModel(patient, {
        nextEvent: followUp ? { date: legacyDate(followUp.dueDate), type: 'assessment-update', version: followUp.version } : null,
        lastActivity: activityByPatient.get(patient.id) ?? null,
      });
    }), today).map((row) => row.patient.id);

    const firstPage = await app.listActivePatientsPage({ pageIndex: 0, pageSize: 100 });
    const secondPage = await app.listActivePatientsPage({ pageIndex: 1, pageSize: 25 });
    const beyondLastPage = await app.listActivePatientsPage({ pageIndex: 2, pageSize: 25 });
    expect(firstPage).toMatchObject({ total: 50, pageIndex: 0, pageSize: 25 });
    expect(firstPage.items.map(({ patient }) => patient.id)).toEqual(expectedIds.slice(0, 25));
    expect(secondPage.items.map(({ patient }) => patient.id)).toEqual(expectedIds.slice(25));
    expect(beyondLastPage).toMatchObject({ items: [], total: 50, pageIndex: 2, pageSize: 25 });

    const matchingPage = await app.listActivePatientsPage({ query: '  RECORTE ', pageIndex: 0, pageSize: 100 });
    expect(matchingPage).toMatchObject({ total: 25, pageIndex: 0, pageSize: 25 });
    expect(matchingPage.items).toHaveLength(25);
    expect(matchingPage.items.every(({ patient }) => patient.currentObjective === 'Recorte')).toBe(true);
    expect((await app.listActivePatientsPage({ query: 'RECORTE', pageIndex: 1 })).items).toEqual([]);
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
