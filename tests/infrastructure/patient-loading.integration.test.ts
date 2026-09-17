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
  it('reads 100 patients and 2,000 diets/assessments in four batch queries without hydrating diets', async () => {
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
    const summaries = await application.listActivePatients();
    const duration = performance.now() - start;
    console.info(`[patient-loading] 100 pacientes, 2000 dietas, 2000 avaliações: ${duration.toFixed(1)}ms; ${query.mock.calls.length} consultas`);
    expect(duration).toBeLessThan(1000);
    expect(summaries).toHaveLength(100);
    expect(query).toHaveBeenCalledTimes(4);
    expect(hydrate).not.toHaveBeenCalled();
    for (const summary of summaries) {
      expect(summary.related).toEqual({ dietCount: 20, assessmentCount: 20 });
      expect(summary.clinical?.latestAssessment?.clinicalDate).toBe('2026-09-20');
      expect(summary.clinical?.previousAssessment?.clinicalDate).toBe('2026-09-19');
    }
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
    expect(await repository.listHistoryViews('other-account', 'patient-a')).toEqual([]);
    expect(await repository.listPatientSummaries('other-account', ['patient-a'])).toEqual({ 'patient-a': { dietCount: 0, assessmentCount: 0, lastActivity: null } });
  });
});
