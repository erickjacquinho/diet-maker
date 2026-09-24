// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserPatientRuntime, disposeBrowserPatientRuntime, type BrowserPatientRuntime } from '@/lib/application/browser-composition';
import { PGliteDietRepository } from '@/lib/infrastructure/local-db/diets/pglite-diet-repository';
import { patients } from '@/lib/infrastructure/local-db/schema';
import { toDietHistoryViews } from '@/lib/application/diets/diet-history-view';
import { createPatientDietReader } from '@/lib/infrastructure/local-db/diets/pglite-patient-diet-reader';
import type { DietPlan } from '@/lib/domain/diets/diet-model';
import { activeDietFixture, cycleDraftFixture, mealWithAlternativeAndSubstituteFixture } from '../fixtures/diets';

let runtime: BrowserPatientRuntime | undefined;
afterEach(async () => { vi.restoreAllMocks(); await disposeBrowserPatientRuntime(runtime); runtime = undefined; });

async function setup(size = 1) {
  const timestamp = '2026-09-17T10:00:00.000Z';
  runtime = await createBrowserPatientRuntime({ id: 'account-a', displayName: 'Conta teste', phone: null, createdAt: timestamp, updatedAt: timestamp });
  await runtime.handle.db.insert(patients).values(Array.from({ length: size }, (_, index) => ({
    id: index === 0 ? 'patient-a' : `patient-${index}`, accountId: 'account-a', displayCode: `P-${index}`, name: `Paciente ${index}`,
    gender: 'Feminino', createdAt: timestamp, updatedAt: timestamp, version: 1,
  })));
  return runtime;
}

describe('patient loading with the real local database', () => {
  it('increments the workspace revision after a confirmed mutation', async () => {
    const timestamp = '2026-09-17T10:00:00.000Z';
    runtime = await createBrowserPatientRuntime({ id: 'account-a', displayName: 'Conta teste', phone: null, createdAt: timestamp, updatedAt: timestamp });
    const input = {
      name: 'Ana Lima', age: 32, gender: 'Feminino', birthDate: '1994-06-12', heightCm: 165, weightKg: 62,
      phone: null, whatsapp: '11999990000', currentObjective: 'Manutenção',
      defaultMacroTargets: { proteinG: 110, carbsG: 200, fatsG: 55, kcal: 1755 },
    };

    await expect(runtime.getCheckpointState()).resolves.toEqual({ workspaceRevision: 0, checkpointRevision: 0 });
    await runtime.application.createPatient(input);
    await expect(runtime.getCheckpointState()).resolves.toEqual({ workspaceRevision: 1, checkpointRevision: 0 });
    await expect(runtime.application.createPatient({ ...input, heightCm: 0 })).rejects.toMatchObject({ code: 'INVALID_FIELD' });
    await expect(runtime.getCheckpointState()).resolves.toEqual({ workspaceRevision: 1, checkpointRevision: 0 });
  });

  it('returns 25 of 100 patients with five bounded queries and no diet hydration', async () => {
    const { handle, application } = await setup(100);
    await handle.client.exec(`
      INSERT INTO diet_plans (id, account_id, patient_id, name, mode, status, version, created_at, updated_at, activated_at)
      SELECT 'diet-' || p.id || '-' || n, 'account-a', p.id, 'Plano ' || n, 'SIMPLE',
        CASE WHEN n = 20 THEN 'ACTIVE' ELSE 'SNAPSHOT' END, 1, '2026-09-01', '2026-09-01', '2026-09-' || lpad(n::text, 2, '0')
      FROM patients p CROSS JOIN generate_series(1, 20) n;
      INSERT INTO body_assessments (id, account_id, patient_id, clinical_date, weight_kg, auto_filled_fields, calculation_method, calculation_version, calculation_input_snapshot, version, created_at, updated_at)
      SELECT 'assessment-' || p.id || '-' || n, 'account-a', p.id, '2026-09-' || lpad(n::text, 2, '0'), 70,
        '[]'::jsonb, 'NONE', 'simplified-v1', '{"assessmentType":"simplified","heightCm":165,"weightKg":70}'::jsonb, 1, '2026-09-01', '2026-09-01'
      FROM patients p CROSS JOIN generate_series(1, 20) n;
    `);
    const hydrate = vi.spyOn(PGliteDietRepository.prototype, 'getById');
    const query = vi.spyOn(handle.client, 'query');
    const start = performance.now();
    const page = await application.listActivePatientsPage({ pageIndex: 0, pageSize: 25 });
    const duration = performance.now() - start;
    console.info(`[patient-loading] 100 pacientes, 2000 dietas, 2000 avaliações: ${duration.toFixed(1)}ms; ${query.mock.calls.length} consultas`);
    expect(duration).toBeLessThan(1000);
    expect(page).toMatchObject({ total: 100, pageIndex: 0, pageSize: 25 });
    expect(page.items).toHaveLength(25);
    expect(query).toHaveBeenCalledTimes(5);
    expect(hydrate).not.toHaveBeenCalled();
    for (const summary of page.items) {
      expect(summary.related).toEqual({ dietCount: 20, assessmentCount: 20 });
      expect(summary.clinical?.latestAssessment?.clinicalDate).toBe('2026-09-20');
      expect(summary.clinical?.previousAssessment?.clinicalDate).toBe('2026-09-19');
    }
  });

  it('returns the first page of 2,000 assessments and diets within one second', async () => {
    const { handle, application, dietApplication } = await setup();
    await handle.client.exec(`
      INSERT INTO diet_plans (id, account_id, patient_id, name, mode, status, version, created_at, updated_at, activated_at)
      SELECT 'diet-' || lpad(n::text, 4, '0'), 'account-a', 'patient-a', 'Plano ' || n, 'SIMPLE',
        CASE WHEN n = 2000 THEN 'ACTIVE' ELSE 'SNAPSHOT' END, 1, '2026-09-01', '2026-09-01',
        to_char(date '2020-01-01' + n, 'YYYY-MM-DD')
      FROM generate_series(1, 2000) n;
      INSERT INTO body_assessments (id, account_id, patient_id, clinical_date, weight_kg, auto_filled_fields, calculation_method, calculation_version, calculation_input_snapshot, version, created_at, updated_at)
      SELECT 'assessment-' || lpad(n::text, 4, '0'), 'account-a', 'patient-a', to_char(date '2020-01-01' + n, 'YYYY-MM-DD'), 70,
        '[]'::jsonb, 'NONE', 'simplified-v1', '{"assessmentType":"simplified","heightCm":165,"weightKg":70}'::jsonb, 1, '2026-09-01', '2026-09-01'
      FROM generate_series(1, 2000) n;
    `);
    const fullDietRead = vi.spyOn(PGliteDietRepository.prototype, 'getById');

    const assessmentStart = performance.now();
    const assessmentPage = await application.listAssessmentsPage('patient-a', { pageIndex: 0, pageSize: 25 });
    const assessmentDuration = performance.now() - assessmentStart;
    const dietStart = performance.now();
    const dietPage = await dietApplication.listDietHistoryViewsPage('patient-a', { pageIndex: 0, pageSize: 25 });
    const dietDuration = performance.now() - dietStart;
    console.info(`[patient-history] 2.000 registros: avaliações ${assessmentDuration.toFixed(1)}ms, dietas ${dietDuration.toFixed(1)}ms`);

    expect(assessmentPage).toMatchObject({ total: 2000, pageIndex: 0, pageSize: 25 });
    expect(assessmentPage.items).toHaveLength(25);
    expect(dietPage).toMatchObject({ total: 2000, pageIndex: 0, pageSize: 25 });
    expect(dietPage.items).toHaveLength(25);
    expect(assessmentDuration).toBeLessThan(1000);
    expect(dietDuration).toBeLessThan(1000);
    expect(fullDietRead).not.toHaveBeenCalled();
  });

  it('keeps projected macros, targets, cycles and meal counts identical to full snapshot calculations', async () => {
    const { handle, dietApplication } = await setup();
    const repository = new PGliteDietRepository(handle);
    const plans: DietPlan[] = [
      { ...structuredClone(activeDietFixture), variations: [{ ...structuredClone(activeDietFixture.variations[0]), meals: [structuredClone(mealWithAlternativeAndSubstituteFixture)] }] },
      { ...structuredClone(activeDietFixture), id: 'cycle', name: 'Ciclo', mode: 'CARB_CYCLING', activatedAt: '2026-09-17', variations: structuredClone(cycleDraftFixture.payload.variations).map((variation) => ({ ...variation, assignedDays: [...variation.assignedDays] })) },
    ];
    for (const plan of plans) {
      // Ensure every descendant has its own identity across prescriptions.
      for (const variation of plan.variations) {
        variation.id = `${plan.id}-${variation.id}`;
        for (const meal of variation.meals) {
          meal.id = `${variation.id}-${meal.id}`;
          for (const option of meal.options) {
            option.id = `${meal.id}-${option.id}`;
            for (const item of option.items) {
              const originalId = item.id;
              item.id = `${variation.id}-${originalId}`;
              if (item.parentItemId) item.parentItemId = `${variation.id}-${item.parentItemId}`;
            }
          }
        }
      }
      await repository.confirmActive({ accountId: 'account-a', patientId: 'patient-a', targetDietId: plan.id, draftId: 'draft', confirmedDraftRevision: 1, plan });
    }
    const expected = toDietHistoryViews(await createPatientDietReader(repository).getPatientDietSummary('account-a', 'patient-a'));
    const query = vi.spyOn(handle.client, 'query');
    const actual = await dietApplication.listDietHistoryViews('patient-a');
    expect(actual).toEqual(expected);
    expect(query).toHaveBeenCalledTimes(4); // Patient existence + three history queries.
    query.mockClear();
    const page = await dietApplication.listDietHistoryViewsPage('patient-a', { pageIndex: 0, pageSize: 1 });
    expect(page).toMatchObject({ total: expected.length, pageIndex: 0, pageSize: 1, items: [expected[0]] });
    expect(query).toHaveBeenCalledTimes(5); // Patient scope, count, page, variation summaries and assigned days.
    expect(await repository.listHistoryViews('other-account', 'patient-a')).toEqual([]);
    expect(await repository.listPatientSummaries('other-account', ['patient-a'])).toEqual({ 'patient-a': { dietCount: 0, assessmentCount: 0, lastActivity: null } });
  });
});
