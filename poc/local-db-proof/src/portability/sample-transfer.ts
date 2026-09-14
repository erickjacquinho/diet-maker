import {
  PocError,
  SUPPORTED_FORMAT_VERSION,
  SUPPORTED_SCHEMA_VERSION,
  type Account,
  type ConfirmedFixture,
  type DietMeal,
  type DietMealItem,
  type DietPlan,
  type Patient,
  type Recipe,
  type RecipeIngredient,
  type PortableSample,
} from '../contracts';

interface PortableSampleTarget {
  replaceConfirmed(sample: PortableSample): Promise<void>;
}

function importError(message: string, details?: Record<string, unknown>, cause?: unknown): PocError {
  return new PocError('IMPORT_REJECTED', 'portable-sample', message, details, cause ? { cause } : undefined);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isSourceKind(value: unknown): value is 'TACO' | 'CUSTOM' {
  return value === 'TACO' || value === 'CUSTOM';
}

function isAccount(value: unknown): value is Account {
  return isRecord(value)
    && isString(value.id)
    && isString(value.displayName)
    && isString(value.createdAt)
    && isString(value.updatedAt);
}

function isPatient(value: unknown): value is Patient {
  return isRecord(value)
    && isString(value.id)
    && isString(value.accountId)
    && isString(value.name)
    && isBoolean(value.archived)
    && isString(value.createdAt)
    && isString(value.updatedAt);
}

function isRecipe(value: unknown): value is Recipe {
  return isRecord(value)
    && isString(value.id)
    && isString(value.accountId)
    && isString(value.name)
    && isFiniteNumber(value.yieldPortions)
    && isString(value.createdAt)
    && isString(value.updatedAt);
}

function isRecipeIngredient(value: unknown): value is RecipeIngredient {
  return isRecord(value)
    && isString(value.id)
    && isString(value.recipeId)
    && isSourceKind(value.sourceKind)
    && isString(value.sourceId)
    && isFiniteNumber(value.quantityG);
}

function isDietPlan(value: unknown): value is DietPlan {
  return isRecord(value)
    && isString(value.id)
    && isString(value.accountId)
    && isString(value.patientId)
    && (value.status === 'ACTIVE' || value.status === 'SNAPSHOT')
    && isFiniteNumber(value.version)
    && isString(value.createdAt)
    && isString(value.updatedAt)
    && (value.fixtureMetadata === undefined || isString(value.fixtureMetadata));
}

function isDietMeal(value: unknown): value is DietMeal {
  return isRecord(value)
    && isString(value.id)
    && isString(value.dietPlanId)
    && isFiniteNumber(value.position)
    && isString(value.name);
}

function isDietMealItem(value: unknown): value is DietMealItem {
  return isRecord(value)
    && isString(value.id)
    && isString(value.mealId)
    && isSourceKind(value.sourceKind)
    && isString(value.sourceId)
    && isFiniteNumber(value.quantityG)
    && isFiniteNumber(value.energyKcal)
    && isFiniteNumber(value.proteinG)
    && isFiniteNumber(value.carbsG)
    && isFiniteNumber(value.fatG);
}

function isArrayOf<T>(value: unknown, guard: (candidate: unknown) => candidate is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

function assertPortableRecords(records: unknown, accountId: string): asserts records is ConfirmedFixture {
  if (!isRecord(records)) {
    throw importError('A amostra não contém um conjunto de registros válido.');
  }

  if ('drafts' in records) {
    throw importError('Drafts não podem fazer parte da amostra confirmada.');
  }

  if (!isArrayOf(records.accounts, isAccount)
    || !isArrayOf(records.patients, isPatient)
    || !isArrayOf(records.recipes, isRecipe)
    || !isArrayOf(records.recipeIngredients, isRecipeIngredient)
    || !isArrayOf(records.dietPlans, isDietPlan)
    || !isArrayOf(records.dietMeals, isDietMeal)
    || !isArrayOf(records.dietMealItems, isDietMealItem)) {
    throw importError('Uma coleção da amostra é inválida.');
  }

  const accounts = records.accounts;
  if (accounts.length !== 1 || accounts[0].id !== accountId) {
    throw importError('A amostra deve conter exatamente a Conta exportada.', { accountId });
  }

  const patientIds = new Set<string>();
  for (const patient of records.patients) {
    if (!isString(patient.id) || patient.accountId !== accountId || patientIds.has(patient.id)) {
      throw importError('Amostra rejeitada: Paciente fora do escopo ou duplicado.');
    }
    patientIds.add(patient.id);
  }

  const recipeIds = new Set<string>();
  for (const recipe of records.recipes) {
    if (!isString(recipe.id) || recipe.accountId !== accountId || recipeIds.has(recipe.id)) {
      throw importError('Amostra rejeitada: Receita fora do escopo ou duplicada.');
    }
    recipeIds.add(recipe.id);
  }

  for (const ingredient of records.recipeIngredients) {
    if (!isString(ingredient.id) || !recipeIds.has(String(ingredient.recipeId))) {
      throw importError('Amostra rejeitada: ingrediente sem Receita pai.');
    }
  }

  const dietPlanIds = new Set<string>();
  const activePatients = new Set<string>();
  for (const plan of records.dietPlans) {
    if (!isString(plan.id) || plan.accountId !== accountId || !patientIds.has(String(plan.patientId)) || dietPlanIds.has(plan.id)) {
      throw importError('Amostra rejeitada: dieta fora do escopo ou duplicada.');
    }
    if (plan.status !== 'ACTIVE' && plan.status !== 'SNAPSHOT') {
      throw importError('Amostra rejeitada: estado de dieta não suportado.');
    }
    if (plan.status === 'ACTIVE' && activePatients.has(String(plan.patientId))) {
      throw importError('Amostra rejeitada: mais de uma dieta ACTIVE para o Paciente.');
    }
    if (plan.status === 'ACTIVE') {
      activePatients.add(String(plan.patientId));
    }
    dietPlanIds.add(plan.id);
  }

  const mealIds = new Set<string>();
  for (const meal of records.dietMeals) {
    if (!isString(meal.id) || !dietPlanIds.has(String(meal.dietPlanId)) || mealIds.has(meal.id)) {
      throw importError('Amostra rejeitada: refeição sem Dieta pai ou duplicada.');
    }
    mealIds.add(meal.id);
  }

  for (const item of records.dietMealItems) {
    if (!isString(item.id) || !mealIds.has(String(item.mealId))) {
      throw importError('Amostra rejeitada: item nutricional sem Refeição pai.');
    }
  }
}

export function createPortableSample(records: ConfirmedFixture, accountId: string): PortableSample {
  assertPortableRecords(records, accountId);
  return {
    formatVersion: SUPPORTED_FORMAT_VERSION,
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    accountId,
    records: structuredClone(records),
  };
}

export function serializeSample(sample: PortableSample): string {
  validatePortableSample(sample);
  return JSON.stringify(sample, null, 2);
}

export function deserializeSample(serialized: string): PortableSample {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (cause) {
    throw importError('JSON inválido; a base atual não foi alterada.', undefined, cause);
  }

  try {
    validatePortableSample(parsed);
    return structuredClone(parsed);
  } catch (cause) {
    if (cause instanceof PocError) {
      throw cause;
    }
    throw importError('A amostra não pôde ser validada antes da importação.', undefined, cause);
  }
}

export function validatePortableSample(value: unknown): asserts value is PortableSample {
  if (!isRecord(value)) {
    throw importError('A amostra deve ser um objeto JSON.');
  }
  if (value.formatVersion !== SUPPORTED_FORMAT_VERSION) {
    throw importError('Formato de portabilidade não suportado.', { formatVersion: value.formatVersion });
  }
  if (value.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw importError('Versão de schema não suportada.', { schemaVersion: value.schemaVersion });
  }
  if (!isString(value.exportedAt) || !isString(value.accountId)) {
    throw importError('A amostra não contém envelope completo.');
  }

  assertPortableRecords(value.records, value.accountId);
}

export async function importSample(target: PortableSampleTarget, serialized: string): Promise<void> {
  const sample = deserializeSample(serialized);
  await target.replaceConfirmed(sample);
}
