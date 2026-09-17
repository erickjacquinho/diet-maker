import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import type { LocalDatabaseHandle } from '../client';
import { dietItemSnapshots, dietMealItems, dietMealOptions, dietMeals, dietPlans, dietVariationDays, dietVariations, patients } from '../schema';
import type { ConfirmActiveCommand, DietRepository } from '@/lib/application/diets/diet-ports';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { ConfirmActiveResult, DietDayCode, DietPlan, DietVariationKind } from '@/lib/domain/diets/diet-model';
import { mapDietAggregate, type DietAggregateRows } from './diet-row-mappers';
import { toProjectedHistoricalDietView, type DietHistoryVariation } from '@/lib/application/diets/diet-history-view';
import type { HistoricalDiet } from '@/lib/patientsStoreTypes';
import type { PatientActivity } from '@/lib/persistence/patient-profile-reader';
import { createDecimalString } from '@/lib/domain/diets/diet-model';

type FailureLevel = 'plan' | 'variation' | 'day' | 'meal' | 'option' | 'item' | 'snapshot';

export interface DietRepositoryOptions {
  failAt?: FailureLevel;
  now?: () => string;
}

export class PGliteDietRepository implements DietRepository {
  private readonly now: () => string;

  constructor(private readonly handle: LocalDatabaseHandle, private readonly options: DietRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  private maybeFail(level: FailureLevel): void {
    if (this.options.failAt === level) throw new Error(`Falha injetada em ${level}.`);
  }

  async getById(accountId: string, patientId: string, dietId: string): Promise<DietPlan | null> {
    const planRows = await this.handle.db.select().from(dietPlans).where(and(eq(dietPlans.id, dietId), eq(dietPlans.accountId, accountId), eq(dietPlans.patientId, patientId)));
    const plan = planRows[0];
    if (!plan) return null;
    this.maybeFail('plan');
    const variations = await this.handle.db.select().from(dietVariations).where(eq(dietVariations.dietPlanId, dietId)).orderBy(asc(dietVariations.position));
    const variationIds = variations.map((variation) => variation.id);
    const days = variationIds.length === 0 ? [] : await this.handle.db.select().from(dietVariationDays).where(inArray(dietVariationDays.variationId, variationIds));
    const meals = variationIds.length === 0 ? [] : await this.handle.db.select().from(dietMeals).where(inArray(dietMeals.variationId, variationIds)).orderBy(asc(dietMeals.position));
    const mealIds = meals.map((meal) => meal.id);
    const options = mealIds.length === 0 ? [] : await this.handle.db.select().from(dietMealOptions).where(inArray(dietMealOptions.dietMealId, mealIds)).orderBy(asc(dietMealOptions.position));
    const optionIds = options.map((option) => option.id);
    const items = optionIds.length === 0 ? [] : await this.handle.db.select().from(dietMealItems).where(inArray(dietMealItems.dietMealOptionId, optionIds)).orderBy(asc(dietMealItems.position));
    const itemIds = items.map((item) => item.id);
    const snapshots = itemIds.length === 0 ? [] : await this.handle.db.select().from(dietItemSnapshots).where(inArray(dietItemSnapshots.dietMealItemId, itemIds));
    return mapDietAggregate({ plan, variations, days, meals, options, items, snapshots });
  }

  async listConfirmed(accountId: string, patientId: string): Promise<DietPlan[]> {
    const rows = await this.handle.db.select({ id: dietPlans.id }).from(dietPlans)
      .where(and(eq(dietPlans.accountId, accountId), eq(dietPlans.patientId, patientId)))
      .orderBy(desc(dietPlans.activatedAt));
    const plans = await Promise.all(rows.map((row) => this.getById(accountId, patientId, row.id)));
    return plans.filter((plan): plan is DietPlan => plan !== null);
  }

  async countConfirmed(accountId: string, patientId: string): Promise<number> {
    const rows = await this.handle.db.select({ count: count() }).from(dietPlans).where(and(eq(dietPlans.accountId, accountId), eq(dietPlans.patientId, patientId)));
    return Number(rows[0].count);
  }

  async listPatientSummaries(accountId: string, patientIds: readonly string[]): Promise<Record<string, { dietCount: number; assessmentCount: number; lastActivity: PatientActivity | null }>> {
    const result: Record<string, { dietCount: number; assessmentCount: number; lastActivity: PatientActivity | null }> = Object.fromEntries(patientIds.map((id) => [id, { dietCount: 0, assessmentCount: 0, lastActivity: null }]));
    if (!patientIds.length) return result;
    const ranked = this.handle.db.select({
      patientId: dietPlans.patientId, id: dietPlans.id, activatedAt: dietPlans.activatedAt, updatedAt: dietPlans.updatedAt,
      count: sql<number>`count(*) OVER (PARTITION BY ${dietPlans.patientId})::int`.as('diet_count'),
      rank: sql<number>`row_number() OVER (PARTITION BY ${dietPlans.patientId} ORDER BY ${dietPlans.activatedAt} DESC, ${dietPlans.updatedAt} DESC, ${dietPlans.id} ASC)`.as('diet_rank'),
    }).from(dietPlans).where(and(eq(dietPlans.accountId, accountId), inArray(dietPlans.patientId, [...patientIds]))).as('ranked_diets');
    const rows = await this.handle.db.select().from(ranked).where(eq(ranked.rank, 1));
    for (const row of rows) result[row.patientId] = {
      dietCount: Number(row.count), assessmentCount: 0,
      lastActivity: { eventDate: row.activatedAt.slice(0, 10), confirmedAt: row.updatedAt, type: 'diet', sourceId: row.id },
    };
    return result;
  }

  async listHistoryViews(accountId: string, patientId: string): Promise<HistoricalDiet[]> {
    const plans = await this.handle.db.select().from(dietPlans).where(and(eq(dietPlans.accountId, accountId), eq(dietPlans.patientId, patientId))).orderBy(desc(dietPlans.activatedAt));
    if (!plans.length) return [];
    const ids = plans.map((plan) => plan.id);
    const [variations, days] = await Promise.all([
      this.handle.db.select({
        variation: dietVariations,
        mealsCount: sql<number>`count(DISTINCT ${dietMeals.id})::int`,
        protein: sql<string>`coalesce(sum(${dietItemSnapshots.prescribedProtein}), 0)::text`,
        carbs: sql<string>`coalesce(sum(${dietItemSnapshots.prescribedCarbs}), 0)::text`,
        fat: sql<string>`coalesce(sum(${dietItemSnapshots.prescribedFat}), 0)::text`,
        energy: sql<string>`coalesce(sum(coalesce(${dietItemSnapshots.prescribedEnergyKcal}, ${dietItemSnapshots.prescribedProtein} * 4 + ${dietItemSnapshots.prescribedCarbs} * 4 + ${dietItemSnapshots.prescribedFat} * 9)), 0)::text`,
      }).from(dietVariations)
        .leftJoin(dietMeals, eq(dietMeals.variationId, dietVariations.id))
        .leftJoin(dietMealOptions, and(eq(dietMealOptions.dietMealId, dietMeals.id), eq(dietMealOptions.countsTowardTotals, true)))
        .leftJoin(dietMealItems, and(eq(dietMealItems.dietMealOptionId, dietMealOptions.id), eq(dietMealItems.role, 'PRIMARY')))
        .leftJoin(dietItemSnapshots, eq(dietItemSnapshots.dietMealItemId, dietMealItems.id))
        .where(inArray(dietVariations.dietPlanId, ids)).groupBy(dietVariations.id).orderBy(asc(dietVariations.position)),
      this.handle.db.select().from(dietVariationDays).where(inArray(dietVariationDays.dietPlanId, ids)).orderBy(asc(dietVariationDays.position)),
    ]);
    const daysByVariation = new Map<string, DietDayCode[]>();
    for (const day of days) {
      const assigned = daysByVariation.get(day.variationId) ?? [];
      assigned.push(day.dayCode as DietDayCode);
      daysByVariation.set(day.variationId, assigned);
    }
    const byPlan = new Map<string, DietHistoryVariation[]>();
    for (const { variation, mealsCount, protein, carbs, fat, energy } of variations) {
      const values = byPlan.get(variation.dietPlanId) ?? [];
      values.push({
        id: variation.id, name: variation.name, kind: variation.kind as DietVariationKind,
        assignedDays: daysByVariation.get(variation.id) ?? [], mealsCount: Number(mealsCount),
        targets: { protein: createDecimalString(variation.targetProtein), carbs: createDecimalString(variation.targetCarbs), fat: createDecimalString(variation.targetFat), energyKcal: createDecimalString(variation.targetKcal) },
        prescribed: { proteinG: Number(protein), carbsG: Number(carbs), fatsG: Number(fat), targetKcal: Number(energy) },
      });
      byPlan.set(variation.dietPlanId, values);
    }
    return plans.map((plan) => toProjectedHistoricalDietView({
      id: plan.id, name: plan.name, activatedAt: plan.activatedAt, mode: plan.mode as DietPlan['mode'], status: plan.status as DietPlan['status'],
      variations: byPlan.get(plan.id) ?? [],
    })).sort((left, right) => Number(right.status === 'Ativa') - Number(left.status === 'Ativa'));
  }

  async confirmActive(command: ConfirmActiveCommand): Promise<ConfirmActiveResult> {
    if (command.plan.accountId !== command.accountId || command.plan.patientId !== command.patientId || command.plan.id !== command.targetDietId) {
      throw new DietDomainError('CONTEXT_MISSING', 'A prescrição não pertence ao contexto ativo.');
    }

    return this.handle.db.transaction(async (tx) => {
      const patientRows = await tx.select({ id: patients.id, archivedAt: patients.archivedAt }).from(patients)
        .where(and(eq(patients.id, command.patientId), eq(patients.accountId, command.accountId)));
      const patient = patientRows[0];
      if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
      if (patient.archivedAt !== null) throw new DietDomainError('ARCHIVED_PATIENT', 'Paciente arquivado não pode receber nova prescrição.');

      const currentRows = await tx.select().from(dietPlans).where(and(eq(dietPlans.id, command.targetDietId), eq(dietPlans.accountId, command.accountId), eq(dietPlans.patientId, command.patientId)));
      const current = currentRows[0];
      if (!command.baseDietId) {
        if (current) return { status: 'ALREADY_COMMITTED', planId: current.id, version: current.version };
        await tx.update(dietPlans).set({ status: 'SNAPSHOT', supersededAt: this.now(), updatedAt: this.now() }).where(and(eq(dietPlans.accountId, command.accountId), eq(dietPlans.patientId, command.patientId), eq(dietPlans.status, 'ACTIVE')));
        await tx.insert(dietPlans).values(this.planRow(command.plan, 1));
        this.maybeFail('plan');
        await this.writeDescendants(tx, command.plan);
        return { status: 'COMMITTED_NEW', planId: command.plan.id, version: 1 };
      }

      if (!current || current.id !== command.baseDietId || current.status !== 'ACTIVE' || current.version !== command.baseDietVersion) {
        throw new DietDomainError('VERSION_CONFLICT', 'A prescrição vigente foi alterada antes da confirmação.');
      }
      const nextVersion = current.version + 1;
      await tx.update(dietPlans).set({
        name: command.plan.name,
        mode: command.plan.mode,
        status: 'ACTIVE',
        weightReferenceKg: command.plan.weightReferenceKg ?? null,
        version: nextVersion,
        updatedAt: command.plan.updatedAt,
        activatedAt: command.plan.activatedAt,
        supersededAt: null,
      }).where(and(eq(dietPlans.id, current.id), eq(dietPlans.accountId, command.accountId), eq(dietPlans.patientId, command.patientId), eq(dietPlans.version, current.version), eq(dietPlans.status, 'ACTIVE')));
      this.maybeFail('plan');
      await tx.delete(dietVariations).where(eq(dietVariations.dietPlanId, current.id));
      await this.writeDescendants(tx, { ...command.plan, id: current.id, version: nextVersion });
      return { status: 'COMMITTED_UPDATE', planId: current.id, version: nextVersion };
    });
  }

  private planRow(plan: DietPlan, version: number): typeof dietPlans.$inferInsert {
    return {
      id: plan.id,
      accountId: plan.accountId,
      patientId: plan.patientId,
      name: plan.name,
      mode: plan.mode,
      status: 'ACTIVE',
      weightReferenceKg: plan.weightReferenceKg ?? null,
      version,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      activatedAt: plan.activatedAt,
      supersededAt: null,
    };
  }

  private async writeDescendants(tx: Parameters<Parameters<LocalDatabaseHandle['db']['transaction']>[0]>[0], plan: DietPlan): Promise<void> {
    const variationRows = plan.variations.map((variation) => ({
      id: variation.id, dietPlanId: plan.id, accountId: plan.accountId, patientId: plan.patientId, position: variation.position, kind: variation.kind, name: variation.name, inputMode: variation.inputMode,
      targetProtein: variation.targets.protein, targetCarbs: variation.targets.carbs, targetFat: variation.targets.fat, targetKcal: variation.targets.energyKcal,
      gPerKgProtein: variation.gPerKg?.protein ?? null, gPerKgCarbs: variation.gPerKg?.carbs ?? null, gPerKgFat: variation.gPerKg?.fat ?? null,
    }));
    this.maybeFail('variation');
    if (variationRows.length) await tx.insert(dietVariations).values(variationRows);

    const dayRows = plan.variations.flatMap((variation) => variation.assignedDays.map((dayCode, position) => ({ variationId: variation.id, dietPlanId: plan.id, accountId: plan.accountId, patientId: plan.patientId, dayCode, position })));
    this.maybeFail('day');
    if (dayRows.length) await tx.insert(dietVariationDays).values(dayRows);

    const mealRows = plan.variations.flatMap((variation) => variation.meals.map((meal) => ({ id: meal.id, dietPlanId: plan.id, variationId: variation.id, accountId: plan.accountId, patientId: plan.patientId, position: meal.position, name: meal.name, time: meal.time ?? null })));
    this.maybeFail('meal');
    if (mealRows.length) await tx.insert(dietMeals).values(mealRows);

    const optionRows = plan.variations.flatMap((variation) => variation.meals.flatMap((meal) => meal.options.map((option) => ({ id: option.id, dietMealId: meal.id, position: option.position, label: option.label, countsTowardTotals: option.countsTowardTotals }))));
    this.maybeFail('option');
    if (optionRows.length) await tx.insert(dietMealOptions).values(optionRows);

    const itemRows = plan.variations.flatMap((variation) => variation.meals.flatMap((meal) => meal.options.flatMap((option) => option.items.map((item) => ({ id: item.id, dietMealOptionId: option.id, position: item.position, role: item.role, parentItemId: item.parentItemId ?? null, name: item.name }))))).sort((left, right) => {
      if (left.role === right.role) return left.position - right.position;
      return left.role === 'PRIMARY' ? -1 : 1;
    });
    this.maybeFail('item');
    if (itemRows.length) await tx.insert(dietMealItems).values(itemRows);

    const snapshotRows = plan.variations.flatMap((variation) => variation.meals.flatMap((meal) => meal.options.flatMap((option) => option.items.map((item) => ({
      dietMealItemId: item.id, sourceType: item.snapshot.sourceType, sourceId: item.snapshot.sourceId, sourceVersion: item.snapshot.sourceVersion, displayName: item.snapshot.displayName, description: item.snapshot.description,
      measurementBasis: item.snapshot.measurementBasis, foodState: item.snapshot.foodState, referenceQuantity: item.snapshot.referenceQuantity, referenceUnit: item.snapshot.referenceUnit,
      referenceProtein: item.snapshot.referenceNutrients.protein, referenceCarbs: item.snapshot.referenceNutrients.carbs, referenceFat: item.snapshot.referenceNutrients.fat, referenceFiber: item.snapshot.referenceNutrients.fiber, referenceEnergyKcal: item.snapshot.referenceNutrients.energyKcal ?? null,
      prescribedQuantity: item.snapshot.prescribedQuantity, prescribedUnit: item.snapshot.prescribedUnit, prescribedProtein: item.snapshot.prescribedNutrients.protein, prescribedCarbs: item.snapshot.prescribedNutrients.carbs, prescribedFat: item.snapshot.prescribedNutrients.fat, prescribedFiber: item.snapshot.prescribedNutrients.fiber, prescribedEnergyKcal: item.snapshot.prescribedNutrients.energyKcal ?? null,
      energySource: item.snapshot.energySource, calculationVersion: item.snapshot.calculationVersion, conversionSnapshot: item.snapshot.conversionSnapshot, compositionSnapshot: item.snapshot.compositionSnapshot,
    })))));
    this.maybeFail('snapshot');
    if (snapshotRows.length) await tx.insert(dietItemSnapshots).values(snapshotRows);
  }
}
