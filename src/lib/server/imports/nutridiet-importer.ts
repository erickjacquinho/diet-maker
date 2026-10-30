import 'server-only';

import { createHash } from 'node:crypto';
import { sql, type SQL } from 'drizzle-orm';
import { normalizeClinicalDate } from '@/lib/domain/clinical';
import type { DietEditableDocument, DietPlan, NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { scaleNutrition } from '@/lib/domain/library/library-nutrition';
import { mapDietAggregate } from '@/lib/infrastructure/local-db/diets/diet-row-mappers';
import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import { parseDietDocument } from '@/lib/contracts/diets';
import { parseFoodDto } from '@/lib/contracts/library';
import { parseReadyMealDto, parseRecipeDto } from '@/lib/contracts/recipes';
import { isFavoriteFoodId, isReminderId } from '@/lib/contracts/agenda';
import type { FieldSealer } from '../crypto/account-keys';
import { ApiError } from '../api/api-errors';
import { SENSITIVE_COLUMN } from '../patients/patient-repository';
import { COMMENTS_COLUMN } from '../clinical/clinical-repository';
import type { SqlExecutor } from '../patients/patient-repository';

export interface ImportSummary {
  patients: number;
  bodyAssessments: number;
  nextFollowUps: number;
  dietPlans: number;
  foodCatalogItems: number;
  recipes: number;
  readyMeals: number;
  readyDiets: number;
  favorites: number;
  agendaReminders: number;
  objectiveOptions: number;
  /** Rows with no server counterpart: the profile, and the built-in objectives (the API provides those itself). */
  skipped: { account: number; objectiveOptions: number };
}

const invalid = (reason: string) => new ApiError(422, 'UNPROCESSABLE', { reason });
const idPattern = /^[A-Za-z0-9_-]{1,100}$/;

/** Deterministic UUIDv5-style ID, so a retried import maps every local ID to the same server ID. */
export function importedUuid(accountId: string, kind: string, localId: string): string {
  const hash = createHash('sha256').update(`nutridiet-import:v1|${accountId}|${kind}|${localId}`).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Ids stored inside documents keep their local value when safe, otherwise get a stable hashed one. */
function documentId(value: string): string {
  return idPattern.test(value) ? value : `i${createHash('sha256').update(value).digest('base64url').slice(0, 22)}`;
}

const iso = (value: string): string => {
  if (Number.isNaN(Date.parse(value))) throw invalid('INVALID_TIMESTAMP');
  return new Date(value).toISOString();
};

export async function importNutridietEnvelope(
  tx: SqlExecutor,
  sealer: FieldSealer,
  accountId: string,
  envelope: BackupEnvelope,
): Promise<ImportSummary> {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });
  const id = (kind: string, localId: string) => importedUuid(accountId, kind, localId);

  const foodIds = new Map(envelope.foodCatalogItems.map((row) => [row.id, id('food', row.id)]));
  const recipeIds = new Map(envelope.recipes.map((row) => [row.id, id('recipe', row.id)]));
  const mealIds = new Map(envelope.readyMeals.map((row) => [row.id, id('ready-meal', row.id)]));
  const patientIds = new Map(envelope.patients.map((row) => [row.id, id('patient', row.id)]));

  function remapSnapshot(snapshot: NutritionSnapshot): NutritionSnapshot {
    const table = snapshot.sourceType === 'ACCOUNT_CUSTOM' ? foodIds
      : snapshot.sourceType === 'RECIPE' ? recipeIds
        : snapshot.sourceType === 'READY_MEAL' ? mealIds
          : undefined;
    if (!table) return snapshot;
    // A snapshot of an entity that is not in the file keeps a stable, unresolvable ID instead of dangling.
    return { ...snapshot, sourceId: table.get(snapshot.sourceId) ?? id(`orphan-${snapshot.sourceType}`, snapshot.sourceId) };
  }

  function remapDocument(document: DietEditableDocument): DietEditableDocument {
    return parseDietDocument({
      ...document,
      variations: document.variations.map((variation) => ({
        ...variation,
        id: documentId(variation.id),
        meals: variation.meals.map((meal) => ({
          ...meal,
          id: documentId(meal.id),
          options: meal.options.map((option) => ({
            ...option,
            id: documentId(option.id),
            items: option.items.map((item) => ({
              ...item,
              id: documentId(item.id),
              ...(item.parentItemId ? { parentItemId: documentId(item.parentItemId) } : {}),
              snapshot: remapSnapshot(item.snapshot),
            })),
          })),
        })),
      })),
    });
  }

  const guard = <T>(reason: string, run_: () => T): T => {
    try {
      return run_();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw invalid(reason);
    }
  };

  // The account must be empty: an import never merges (Decisão 11).
  const { rows: counts } = await run<{ used: boolean }>(sql`
    SELECT (
      EXISTS (SELECT 1 FROM app.patients WHERE account_id = ${accountId})
      OR EXISTS (SELECT 1 FROM app.food_catalog_items WHERE account_id = ${accountId})
      OR EXISTS (SELECT 1 FROM app.recipes WHERE account_id = ${accountId})
      OR EXISTS (SELECT 1 FROM app.ready_meals WHERE account_id = ${accountId})
      OR EXISTS (SELECT 1 FROM app.ready_diets WHERE account_id = ${accountId})
      OR EXISTS (SELECT 1 FROM app.agenda_reminders WHERE account_id = ${accountId})
      OR EXISTS (SELECT 1 FROM app.favorite_foods WHERE account_id = ${accountId})
      OR EXISTS (SELECT 1 FROM app.objective_options WHERE account_id = ${accountId})
    ) AS used`);
  if (counts[0].used) throw new ApiError(409, 'CONFLICT', { reason: 'ACCOUNT_NOT_EMPTY' });

  // ---- custom objectives (built-in ones are provided by the API, so they are not stored) ----
  const customObjectives = envelope.objectiveOptions.filter((row) => row.origin === 'CUSTOM');
  for (const row of customObjectives) {
    await run(sql`
      INSERT INTO app.objective_options (account_id, id, label, normalized_label, created_at, updated_at, archived_at)
      VALUES (${accountId}, ${id('objective', row.id)}, ${row.label}, ${row.normalizedLabel}, ${iso(row.createdAt)}, ${iso(row.updatedAt)},
        ${row.archivedAt ? iso(row.archivedAt) : null})
      ON CONFLICT (account_id, normalized_label) DO NOTHING`);
  }

  // ---- patients (S1 sealed) ----
  for (const row of envelope.patients) {
    const patientId = patientIds.get(row.id)!;
    const blob = await sealer.seal({ column: SENSITIVE_COLUMN, rowId: patientId }, {
      name: row.name, birthDate: row.birthDate ?? null, isPregnant: row.isPregnant ?? false,
      pregnancyDueDate: row.pregnancyDueDate ?? null, maritalStatus: row.maritalStatus ?? null,
      phone: row.phone ?? null, whatsapp: row.whatsapp ?? null,
    });
    await run(sql`
      INSERT INTO app.patients (account_id, id, display_code, sensitive, sensitive_key_version, gender, height_cm, weight_kg,
        current_objective, target_protein, target_carbs, target_fats, target_kcal, version, created_at, updated_at, archived_at)
      VALUES (${accountId}, ${patientId}, ${row.displayCode}, ${blob}, ${blob.readUInt32BE(1)}, ${row.gender ?? ''},
        ${row.heightCm ?? null}, ${row.weightKg ?? null}, ${row.currentObjective ?? null}, ${row.targetProtein ?? null},
        ${row.targetCarbs ?? null}, ${row.targetFats ?? null}, ${row.targetKcal ?? null}, ${row.version},
        ${iso(row.createdAt)}, ${iso(row.updatedAt)}, ${row.archivedAt ? iso(row.archivedAt) : null})`);
  }

  // ---- assessments ----
  for (const row of envelope.bodyAssessments) {
    const clinicalDate = normalizeClinicalDate(row.clinicalDate);
    if (!clinicalDate) throw invalid('INVALID_CLINICAL_DATE');
    const patientId = patientIds.get(row.patientId);
    if (!patientId) throw invalid('BACKUP_RELATION_INVALID');
    await run(sql`
      INSERT INTO app.body_assessments (account_id, id, patient_id, clinical_date, assessment_type, weight_kg, body_fat_percent,
        fat_mass_kg, lean_mass_kg, waist_cm, scapula_cm, bust_cm, abdomen_cm, hip_cm, left_proximal_thigh_cm, right_proximal_thigh_cm,
        neck_cm, left_arm_cm, right_arm_cm, left_distal_thigh_cm, right_distal_thigh_cm, left_calf_cm, right_calf_cm,
        auto_filled_fields, calculation_method, calculation_version, calculation_input, version, created_at, updated_at)
      VALUES (${accountId}, ${id('assessment', row.id)}, ${patientId}, ${clinicalDate},
        ${row.calculationMethod === 'NONE' ? 'simplified' : 'complete'}, ${row.weightKg}, ${row.bodyFatPercent ?? null},
        ${row.fatMassKg ?? null}, ${row.leanMassKg ?? null}, ${row.waistCm ?? null}, ${row.scapulaCm ?? null}, ${row.bustCm ?? null},
        ${row.abdomenCm ?? null}, ${row.hipCm ?? null}, ${row.leftProximalThighCm ?? null}, ${row.rightProximalThighCm ?? null},
        ${row.neckCm ?? null}, ${row.leftArmCm ?? null}, ${row.rightArmCm ?? null}, ${row.leftDistalThighCm ?? null},
        ${row.rightDistalThighCm ?? null}, ${row.leftCalfCm ?? null}, ${row.rightCalfCm ?? null},
        ${JSON.stringify(row.autoFilledFields ?? [])}::jsonb, ${row.calculationMethod}, ${row.calculationVersion},
        ${JSON.stringify(row.calculationInputSnapshot ?? {})}::jsonb, ${row.version}, ${iso(row.createdAt)}, ${iso(row.updatedAt)})`);
  }

  // ---- next follow-ups (comments sealed) ----
  let followUps = 0;
  for (const row of envelope.nextFollowUps) {
    const patientId = patientIds.get(row.patientId);
    if (!patientId) throw invalid('BACKUP_RELATION_INVALID');
    const assessmentDue = row.assessmentDueDate ?? (row.type === 'DIET_UPDATE' ? null : row.dueDate);
    const dietDue = row.dietDueDate ?? (row.type === 'ASSESSMENT_UPDATE' ? null : row.dueDate);
    const dates = [assessmentDue, dietDue].map((date) => (date === null ? null : normalizeClinicalDate(date)));
    if (dates.some((date, index) => date === null && [assessmentDue, dietDue][index] !== null) || (dates[0] === null && dates[1] === null)) {
      throw invalid('INVALID_FOLLOW_UP_DATE');
    }
    const blob = await sealer.seal({ column: COMMENTS_COLUMN, rowId: patientId }, row.comments ?? '');
    await run(sql`
      INSERT INTO app.next_follow_ups (account_id, patient_id, assessment_due_date, diet_due_date, comments, comments_key_version,
        version, created_at, updated_at)
      VALUES (${accountId}, ${patientId}, ${dates[0]}, ${dates[1]}, ${blob}, ${blob.readUInt32BE(1)}, ${row.version},
        ${iso(row.createdAt)}, ${iso(row.updatedAt)})`);
    followUps += 1;
  }

  // ---- diet plans (document assembled from the normalized rows) ----
  const group = <T, K extends keyof T>(rows: T[], key: K) => {
    const map = new Map<unknown, T[]>();
    for (const row of rows) map.set(row[key], [...(map.get(row[key]) ?? []), row]);
    return map;
  };
  const variationsByPlan = group(envelope.dietVariations, 'dietPlanId');
  const daysByPlan = group(envelope.dietVariationDays, 'dietPlanId');
  const mealsByPlan = group(envelope.dietMeals, 'dietPlanId');
  const optionsByMeal = group(envelope.dietMealOptions, 'dietMealId');
  const itemsByOption = group(envelope.dietMealItems, 'dietMealOptionId');
  const snapshotsByItem = new Map(envelope.dietItemSnapshots.map((row) => [row.dietMealItemId, row]));
  for (const plan of envelope.dietPlans) {
    const patientId = patientIds.get(plan.patientId);
    if (!patientId) throw invalid('BACKUP_RELATION_INVALID');
    const meals = mealsByPlan.get(plan.id) ?? [];
    const options = meals.flatMap((meal) => optionsByMeal.get(meal.id) ?? []);
    const items = options.flatMap((option) => itemsByOption.get(option.id) ?? []);
    const aggregate: DietPlan = guard('INVALID_DIET', () => mapDietAggregate({
      plan, variations: variationsByPlan.get(plan.id) ?? [], days: daysByPlan.get(plan.id) ?? [], meals, options, items,
      snapshots: items.flatMap((item) => snapshotsByItem.get(item.id) ?? []),
    }));
    const document = guard('INVALID_DIET', () => remapDocument({
      name: aggregate.name, mode: aggregate.mode, weightReferenceKg: aggregate.weightReferenceKg, variations: aggregate.variations,
    }));
    await run(sql`
      INSERT INTO app.diet_plans (account_id, id, patient_id, name, mode, status, weight_reference_kg, variations, version,
        created_at, updated_at, activated_at, superseded_at)
      VALUES (${accountId}, ${id('diet', plan.id)}, ${patientId}, ${document.name}, ${document.mode}, ${plan.status},
        ${document.weightReferenceKg ?? null}, ${JSON.stringify(document.variations)}::jsonb, ${plan.version},
        ${iso(plan.createdAt)}, ${iso(plan.updatedAt)}, ${iso(plan.activatedAt)}, ${plan.supersededAt ? iso(plan.supersededAt) : null})`);
  }

  // ---- library: foods, recipes, ready meals, ready diets ----
  for (const row of envelope.foodCatalogItems) {
    const foodId = foodIds.get(row.id)!;
    guard('INVALID_FOOD', () => parseFoodDto({
      id: foodId, name: row.name, description: row.description, brand: row.brand ?? undefined,
      measurementBasis: row.measurementBasis, foodState: row.foodState,
      servingReference: row.servingReference && row.servingUnit ? { quantity: row.servingReference, unit: row.servingUnit } : undefined,
      referenceNutrients: {
        protein: row.referenceProtein, carbs: row.referenceCarbs, fat: row.referenceFat, fiber: row.referenceFiber,
        ...(row.referenceEnergyKcal === null ? {} : { energyKcal: row.referenceEnergyKcal }),
      },
      energySource: row.energySource, calculationVersion: row.calculationVersion, status: row.status, version: row.version,
      createdAt: row.createdAt, updatedAt: row.updatedAt, archivedAt: row.archivedAt,
    }));
    await run(sql`
      INSERT INTO app.food_catalog_items (account_id, id, name, description, brand, measurement_basis, food_state, serving_reference,
        serving_unit, reference_protein, reference_carbs, reference_fat, reference_fiber, reference_energy_kcal, energy_source,
        calculation_version, status, version, created_at, updated_at, archived_at)
      VALUES (${accountId}, ${foodId}, ${row.name}, ${row.description ?? ''}, ${row.brand ?? null}, ${row.measurementBasis},
        ${row.foodState}, ${row.servingReference ?? null}, ${row.servingUnit ?? null}, ${row.referenceProtein}, ${row.referenceCarbs},
        ${row.referenceFat}, ${row.referenceFiber}, ${row.referenceEnergyKcal ?? null}, ${row.energySource}, ${row.calculationVersion},
        ${row.status}, ${row.version}, ${iso(row.createdAt)}, ${iso(row.updatedAt)}, ${row.archivedAt ? iso(row.archivedAt) : null})`);
  }

  const ingredientsByRecipe = group(envelope.recipeIngredients, 'recipeId');
  for (const row of envelope.recipes) {
    const nutrition = (p: string, c: string, f: string, fiber: string, kcal: string | null) =>
      ({ protein: p, carbs: c, fat: f, fiber, ...(kcal === null ? {} : { energyKcal: kcal }) });
    const total = nutrition(row.totalProtein, row.totalCarbs, row.totalFat, row.totalFiber, row.totalEnergyKcal);
    const ingredients = [...(ingredientsByRecipe.get(row.id) ?? [])].sort((a, b) => a.position - b.position).map((ingredient, position) => ({
      position, sourceType: ingredient.sourceType,
      sourceId: ingredient.sourceType === 'ACCOUNT_CUSTOM' ? (foodIds.get(ingredient.sourceId) ?? id('orphan-food', ingredient.sourceId)) : ingredient.sourceId,
      sourceVersion: ingredient.sourceVersion, quantity: ingredient.quantity, unit: ingredient.unit,
      ingredientSnapshot: remapSnapshot(ingredient.ingredientSnapshot as NutritionSnapshot),
    }));
    const dto = guard('INVALID_RECIPE', () => parseRecipeDto({
      id: recipeIds.get(row.id), name: row.name, category: row.category, instructions: row.instructions ?? '',
      prepTimeMinutes: row.prepTimeMinutes ?? undefined, yieldPortions: row.yieldPortions, yieldUnit: row.yieldUnit,
      preparedWeightGrams: row.preparedWeightGrams ?? undefined,
      nutrition: {
        total,
        perPortion: nutrition(row.perPortionProtein, row.perPortionCarbs, row.perPortionFat, row.perPortionFiber, row.perPortionEnergyKcal),
        ...(row.preparedWeightGrams === null ? {} : { perPrepared100g: scaleNutrition(total as never, '100', row.preparedWeightGrams) }),
      },
      status: row.status, version: row.version, createdAt: row.createdAt, updatedAt: row.updatedAt, archivedAt: row.archivedAt, ingredients,
    }));
    await run(sql`
      INSERT INTO app.recipes (account_id, id, name, category, instructions, prep_time_minutes, yield_portions, yield_unit,
        prepared_weight_grams, nutrition, ingredients, status, version, created_at, updated_at, archived_at)
      VALUES (${accountId}, ${dto.id}, ${dto.name}, ${dto.category}, ${dto.instructions}, ${dto.prepTimeMinutes ?? null},
        ${dto.yieldPortions}, ${dto.yieldUnit}, ${dto.preparedWeightGrams ?? null}, ${JSON.stringify(dto.nutrition)}::jsonb,
        ${JSON.stringify(dto.ingredients)}::jsonb, ${dto.status}, ${dto.version}, ${iso(row.createdAt)}, ${iso(row.updatedAt)},
        ${row.archivedAt ? iso(row.archivedAt) : null})`);
  }

  const itemsByMeal = group(envelope.readyMealItems, 'readyMealId');
  for (const row of envelope.readyMeals) {
    const items = [...(itemsByMeal.get(row.id) ?? [])].sort((a, b) => a.position - b.position).map((item, position) => {
      const table = item.sourceType === 'RECIPE' ? recipeIds : foodIds;
      const snapshot = item.itemSnapshot as NutritionSnapshot;
      const taco = snapshot.sourceType === 'SYSTEM_TACO';
      return {
        position, sourceType: item.sourceType,
        sourceId: taco ? item.sourceId : (table.get(item.sourceId) ?? id('orphan', item.sourceId)),
        sourceVersion: item.sourceVersion, quantity: item.quantity ?? undefined, unit: item.unit ?? undefined,
        recipePortions: item.recipePortions ?? undefined, itemSnapshot: remapSnapshot(snapshot),
      };
    });
    const dto = guard('INVALID_READY_MEAL', () => parseReadyMealDto({
      id: mealIds.get(row.id), name: row.name, description: row.description ?? '', suggestedTime: row.suggestedTime ?? undefined,
      status: row.status, version: row.version, createdAt: row.createdAt, updatedAt: row.updatedAt, archivedAt: row.archivedAt, items,
    }));
    await run(sql`
      INSERT INTO app.ready_meals (account_id, id, name, description, suggested_time, items, status, version, created_at, updated_at, archived_at)
      VALUES (${accountId}, ${dto.id}, ${dto.name}, ${dto.description}, ${dto.suggestedTime ?? null}, ${JSON.stringify(dto.items)}::jsonb,
        ${dto.status}, ${dto.version}, ${iso(row.createdAt)}, ${iso(row.updatedAt)}, ${row.archivedAt ? iso(row.archivedAt) : null})`);
  }

  for (const row of envelope.readyDiets) {
    const document = guard('INVALID_READY_DIET', () => remapDocument(row.document));
    await run(sql`
      INSERT INTO app.ready_diets (account_id, id, name, document, version, created_at, updated_at)
      VALUES (${accountId}, ${id('ready-diet', row.id)}, ${row.name}, ${JSON.stringify(document)}::jsonb, ${row.version},
        ${iso(row.createdAt)}, ${iso(row.updatedAt)})`);
  }

  // ---- favorites and agenda ----
  let favorites = 0;
  for (const favorite of new Set(envelope.favorites)) {
    const foodId = foodIds.get(favorite) ?? favorite;
    if (!isFavoriteFoodId(foodId)) continue;
    await run(sql`INSERT INTO app.favorite_foods (account_id, food_id, is_favorite) VALUES (${accountId}, ${foodId}, true)`);
    favorites += 1;
  }
  for (const reminder of envelope.agendaReminders) {
    if (!isReminderId(reminder.id)) throw invalid('INVALID_REMINDER');
    await run(sql`
      INSERT INTO app.agenda_reminders (account_id, id, due_date, due_time, task)
      VALUES (${accountId}, ${reminder.id}, ${reminder.date}, ${reminder.time}, ${reminder.task})`);
  }

  return {
    patients: envelope.patients.length, bodyAssessments: envelope.bodyAssessments.length, nextFollowUps: followUps,
    dietPlans: envelope.dietPlans.length, foodCatalogItems: envelope.foodCatalogItems.length, recipes: envelope.recipes.length,
    readyMeals: envelope.readyMeals.length, readyDiets: envelope.readyDiets.length, favorites,
    agendaReminders: envelope.agendaReminders.length, objectiveOptions: customObjectives.length,
    skipped: { account: envelope.account.length, objectiveOptions: envelope.objectiveOptions.length - customObjectives.length },
  };
}
