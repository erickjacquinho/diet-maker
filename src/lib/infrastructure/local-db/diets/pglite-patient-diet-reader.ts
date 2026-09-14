import type { DietRepository, DietHistoryRow, PatientDietReader, PatientDietSummary, PreviousDietSource } from '@/lib/application/diets/diet-ports';
import type { DietPlan } from '@/lib/domain/diets/diet-model';

function row(plan: DietPlan): DietHistoryRow {
  return {
    id: plan.id, version: plan.version, name: plan.name, mode: plan.mode, status: plan.status, activatedAt: plan.activatedAt,
    mealCount: plan.variations.reduce((total, variation) => total + variation.meals.length, 0), canEdit: plan.status === 'ACTIVE', canOpenReadOnly: true,
    canUseAsSource: true, canDelete: false, plan,
  };
}

export function createPatientDietReader(repository: DietRepository): PatientDietReader {
  async function list(accountId: string, patientId: string): Promise<DietPlan[]> {
    return repository.listConfirmed(accountId, patientId);
  }

  return {
    async getPatientDietSummary(accountId: string, patientId: string): Promise<PatientDietSummary> {
      const plans = await list(accountId, patientId);
      const current = plans.find((plan) => plan.status === 'ACTIVE') ?? null;
      const history = plans.filter((plan) => plan.status === 'SNAPSHOT').sort((a, b) => b.activatedAt.localeCompare(a.activatedAt)).map(row);
      return { current: current ? row(current) : null, history, confirmedCount: await repository.countConfirmed(accountId, patientId), recoverableDraft: null };
    },
    async listHistory(accountId, patientId) {
      const plans = await list(accountId, patientId);
      return plans.filter((plan) => plan.status === 'SNAPSHOT').sort((a, b) => b.activatedAt.localeCompare(a.activatedAt)).map(row);
    },
    async listPreviousSources(accountId, patientId): Promise<PreviousDietSource[]> {
      const plans = await list(accountId, patientId);
      return plans.sort((a, b) => b.activatedAt.localeCompare(a.activatedAt)).map((plan) => ({ plan, activeVariation: plan.variations[0] ?? null }));
    },
    async getSnapshot(accountId, patientId, dietId) {
      const plan = await repository.getById(accountId, patientId, dietId);
      return plan?.status === 'SNAPSHOT' ? structuredClone(plan) : plan;
    },
    countConfirmed: (accountId, patientId) => repository.countConfirmed(accountId, patientId),
  };
}
