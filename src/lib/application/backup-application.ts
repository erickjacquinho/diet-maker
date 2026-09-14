import {
  BACKUP_APP_ID,
  BACKUP_ENVELOPE_KEYS,
  BACKUP_FORMAT_VERSION,
  BACKUP_ROW_KEYS,
  BACKUP_SCHEMA_VERSION,
  BACKUP_TABLE_NAMES,
  LEGACY_BACKUP_SCHEMA_VERSION,
} from '@/lib/infrastructure/local-db/logical-export-schema';
import type {
  AccountRow,
  BackupEnvelope,
  BodyAssessmentRow,
  DietItemSnapshotRow,
  DietMealItemRow,
  DietMealOptionRow,
  DietMealRow,
  DietPlanRow,
  DietVariationDayRow,
  DietVariationRow,
  FoodCatalogItemRow,
  NextFollowUpRow,
  ObjectiveOptionRow,
  PatientRow,
  ReadyMealItemRow,
  ReadyMealRow,
  RecipeIngredientRow,
  RecipeRow,
} from '@/lib/infrastructure/local-db/logical-export-schema';
import { BackupRepositoryError, type BackupErrorCode, type BackupRepository } from '@/lib/persistence/backup-repository';
import type { AccountContext } from '@/lib/persistence/account-context';
import type { DietDraftStore } from './diets/diet-ports';

export interface BackupValidationContext {
  accountId?: string;
  schemaVersion?: string;
}

export class BackupApplicationError extends Error {
  readonly code: BackupErrorCode;
  readonly cause?: unknown;

  constructor(code: BackupErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'BackupApplicationError';
    this.code = code;
    this.cause = options?.cause;
  }
}

type UnknownRecord = Record<string, unknown>;

function fail(code: BackupErrorCode, message: string, cause?: unknown): never {
  throw new BackupApplicationError(code, message, { cause });
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isJsonValue(value: unknown): boolean {
  if (value === null || isString(value) || isNumber(value) || isBoolean(value)) return true;
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function isNullable(value: unknown, predicate: (candidate: unknown) => boolean): boolean {
  return value === null || predicate(value);
}

function assertExactKeys(record: UnknownRecord, expected: readonly string[], tableName: string): void {
  const actual = Object.keys(record).sort();
  const required = [...expected].sort();
  if (actual.length !== required.length || actual.some((key, index) => key !== required[index])) {
    fail('BACKUP_FORMAT_INVALID', `O registro ${tableName} possui campos desconhecidos ou incompletos.`);
  }
}

function assertFields(record: UnknownRecord, tableName: string, fields: Record<string, (value: unknown) => boolean>, expectedKeys?: readonly string[]): void {
  assertExactKeys(record, expectedKeys ?? BACKUP_ROW_KEYS[tableName as keyof typeof BACKUP_ROW_KEYS], tableName);
  for (const [field, predicate] of Object.entries(fields)) {
    if (!predicate(record[field])) fail('BACKUP_FORMAT_INVALID', `O campo ${tableName}.${field} possui tipo inválido.`);
  }
}

function stringFields(...names: string[]): Record<string, (value: unknown) => boolean> {
  return Object.fromEntries(names.map((name) => [name, isString]));
}

function numericStringFields(...names: string[]): Record<string, (value: unknown) => boolean> {
  return Object.fromEntries(names.map((name) => [name, (value: unknown) => isString(value) && value.trim() !== '' && Number.isFinite(Number(value))]));
}

function nullableStringFields(...names: string[]): Record<string, (value: unknown) => boolean> {
  return Object.fromEntries(names.map((name) => [name, (value: unknown) => isNullable(value, isString)]));
}

function nullableNumericStringFields(...names: string[]): Record<string, (value: unknown) => boolean> {
  return Object.fromEntries(names.map((name) => [name, (value: unknown) => isNullable(value, (candidate) => isString(candidate) && candidate.trim() !== '' && Number.isFinite(Number(candidate)))]));
}

function validateRowShape(tableName: keyof typeof BACKUP_ROW_KEYS, value: unknown, schemaVersion: string): UnknownRecord {
  if (!isRecord(value)) fail('BACKUP_FORMAT_INVALID', `O registro ${tableName} deve ser um objeto.`);

  const fields: Record<string, (candidate: unknown) => boolean> = {};
  switch (tableName) {
    case 'account':
      if (schemaVersion === LEGACY_BACKUP_SCHEMA_VERSION) {
        Object.assign(fields, stringFields('id', 'displayName', 'createdAt', 'updatedAt'));
      } else {
        Object.assign(fields, stringFields('id', 'displayName', 'createdAt', 'updatedAt'), nullableStringFields('phone'));
      }
      break;
    case 'objectiveOptions':
      Object.assign(fields, stringFields('id', 'accountId', 'label', 'normalizedLabel', 'origin', 'createdAt', 'updatedAt'), nullableStringFields('archivedAt'));
      break;
    case 'patients':
      Object.assign(fields, stringFields('id', 'accountId', 'displayCode', 'name', 'gender', 'currentObjective', 'createdAt', 'updatedAt'), { age: isNumber, heightCm: isNumber, weightKg: isNumber, targetProtein: isNumber, targetCarbs: isNumber, targetFats: isNumber, targetKcal: isNumber, version: isNumber }, nullableStringFields('maritalStatus', 'phone', 'whatsapp', 'archivedAt'));
      break;
    case 'bodyAssessments':
      Object.assign(fields, stringFields('id', 'accountId', 'patientId', 'clinicalDate', 'calculationMethod', 'calculationVersion', 'createdAt', 'updatedAt'), numericStringFields('weightKg', 'bodyFatPercent', 'fatMassKg', 'leanMassKg', 'waistCm', 'scapulaCm', 'bustCm', 'abdomenCm', 'hipCm', 'leftProximalThighCm', 'rightProximalThighCm'), nullableNumericStringFields('neckCm', 'leftArmCm', 'rightArmCm', 'leftDistalThighCm', 'rightDistalThighCm', 'leftCalfCm', 'rightCalfCm'), { autoFilledFields: isJsonValue, calculationInputSnapshot: isJsonValue, version: isNumber });
      break;
    case 'nextFollowUps':
      Object.assign(fields, stringFields('accountId', 'patientId', 'dueDate', 'type', 'createdAt', 'updatedAt'), { version: isNumber });
      break;
    case 'dietPlans':
      Object.assign(fields, stringFields('id', 'accountId', 'patientId', 'name', 'mode', 'status', 'createdAt', 'updatedAt', 'activatedAt'), nullableNumericStringFields('weightReferenceKg'), { version: isNumber }, nullableStringFields('supersededAt'));
      break;
    case 'dietVariations':
      Object.assign(fields, stringFields('id', 'dietPlanId', 'accountId', 'patientId', 'kind', 'name', 'inputMode'), numericStringFields('targetProtein', 'targetCarbs', 'targetFat', 'targetKcal'), nullableNumericStringFields('gPerKgProtein', 'gPerKgCarbs', 'gPerKgFat'), { position: isNumber });
      break;
    case 'dietVariationDays':
      Object.assign(fields, stringFields('variationId', 'dietPlanId', 'accountId', 'patientId', 'dayCode'), { position: isNumber });
      break;
    case 'dietMeals':
      Object.assign(fields, stringFields('id', 'dietPlanId', 'variationId', 'accountId', 'patientId', 'name'), { position: isNumber }, nullableStringFields('time'));
      break;
    case 'dietMealOptions':
      Object.assign(fields, stringFields('id', 'dietMealId', 'label'), { position: isNumber, countsTowardTotals: isBoolean });
      break;
    case 'dietMealItems':
      Object.assign(fields, stringFields('id', 'dietMealOptionId', 'role', 'name'), { position: isNumber }, nullableStringFields('parentItemId'));
      break;
    case 'dietItemSnapshots':
      Object.assign(fields, stringFields('dietMealItemId', 'sourceType', 'sourceId', 'sourceVersion', 'displayName', 'description', 'measurementBasis', 'foodState', 'referenceUnit', 'prescribedUnit', 'energySource', 'calculationVersion'), numericStringFields('referenceQuantity', 'referenceProtein', 'referenceCarbs', 'referenceFat', 'referenceFiber', 'prescribedQuantity', 'prescribedProtein', 'prescribedCarbs', 'prescribedFat', 'prescribedFiber'), nullableNumericStringFields('referenceEnergyKcal', 'prescribedEnergyKcal'), { conversionSnapshot: isJsonValue, compositionSnapshot: isJsonValue });
      break;
    case 'foodCatalogItems':
      Object.assign(fields, stringFields('id', 'accountId', 'name', 'description', 'measurementBasis', 'foodState', 'energySource', 'calculationVersion', 'status', 'createdAt', 'updatedAt'), nullableStringFields('brand', 'servingUnit', 'archivedAt'), nullableNumericStringFields('servingReference', 'referenceEnergyKcal'), numericStringFields('referenceProtein', 'referenceCarbs', 'referenceFat', 'referenceFiber'), { version: isNumber });
      break;
    case 'recipes':
      Object.assign(fields, stringFields('id', 'accountId', 'name', 'category', 'instructions', 'yieldPortions', 'totalProtein', 'totalCarbs', 'totalFat', 'totalFiber', 'perPortionProtein', 'perPortionCarbs', 'perPortionFat', 'perPortionFiber', 'status', 'createdAt', 'updatedAt'), nullableNumericStringFields('preparedWeightGrams', 'totalEnergyKcal', 'perPortionEnergyKcal'), nullableStringFields('archivedAt'), numericStringFields('yieldPortions', 'totalProtein', 'totalCarbs', 'totalFat', 'totalFiber', 'perPortionProtein', 'perPortionCarbs', 'perPortionFat', 'perPortionFiber'), { prepTimeMinutes: (value: unknown) => value === null || isNumber(value), version: isNumber });
      break;
    case 'recipeIngredients':
      Object.assign(fields, stringFields('id', 'recipeId', 'accountId', 'sourceType', 'sourceId', 'sourceVersion', 'quantity', 'unit'), { position: isNumber, ingredientSnapshot: isJsonValue });
      break;
    case 'readyMeals':
      Object.assign(fields, stringFields('id', 'accountId', 'name', 'description', 'status', 'createdAt', 'updatedAt'), nullableStringFields('suggestedTime', 'archivedAt'), { version: isNumber });
      break;
    case 'readyMealItems':
      Object.assign(fields, stringFields('id', 'readyMealId', 'accountId', 'sourceType', 'sourceId', 'sourceVersion'), nullableNumericStringFields('quantity', 'recipePortions'), nullableStringFields('unit'), { position: isNumber, itemSnapshot: isJsonValue });
      break;
  }
  const expectedKeys = tableName === 'account' && schemaVersion === LEGACY_BACKUP_SCHEMA_VERSION && !Object.prototype.hasOwnProperty.call(value, 'phone')
    ? ['id', 'displayName', 'createdAt', 'updatedAt']
    : undefined;
  assertFields(value, tableName, fields, expectedKeys);
  return value;
}

function rows<T>(tableName: keyof typeof BACKUP_ROW_KEYS, value: unknown, schemaVersion: string): T[] {
  if (!Array.isArray(value)) fail('BACKUP_FORMAT_INVALID', `A coleção ${tableName} deve ser um array.`);
  return value.map((row) => validateRowShape(tableName, row, schemaVersion)) as T[];
}

function ensureUnique<T>(rowsToCheck: readonly T[], key: (row: T) => string, tableName: string): void {
  const seen = new Set<string>();
  for (const row of rowsToCheck) {
    const identity = key(row);
    if (seen.has(identity)) fail('BACKUP_RELATION_INVALID', `A coleção ${tableName} possui identificadores duplicados.`);
    seen.add(identity);
  }
}

function byId<T extends { id: string }>(rowsToCheck: readonly T[]): Map<string, T> {
  return new Map(rowsToCheck.map((row) => [row.id, row]));
}

function requireReference<T>(map: ReadonlyMap<string, T>, id: string, relation: string): T {
  const row = map.get(id);
  if (!row) fail('BACKUP_RELATION_INVALID', `A relação ${relation} aponta para um registro inexistente.`);
  return row;
}

function assertAccountScope(row: { accountId?: string }, tableName: string, accountId: string): void {
  if (row.accountId !== undefined && row.accountId !== accountId) fail('BACKUP_RELATION_INVALID', `O registro ${tableName} pertence a outra Conta.`);
}

function validateRelations(envelope: BackupEnvelope, expectedAccountId?: string): void {
  const account = envelope.account[0];
  if (envelope.account.length !== 1 || !account) fail('BACKUP_APP_MISMATCH', 'O arquivo não identifica uma Conta válida.');
  const accountId = expectedAccountId ?? account.id;
  if (!account.id || !account.displayName.trim()) fail('BACKUP_FORMAT_INVALID', 'O arquivo não contém um profile identificável.');
  if (expectedAccountId && account.id !== expectedAccountId) fail('BACKUP_APP_MISMATCH', 'O arquivo não identifica a Conta local ativa.');

  envelope.objectiveOptions.forEach((row) => assertAccountScope(row, 'objectiveOptions', accountId));
  envelope.patients.forEach((row) => assertAccountScope(row, 'patients', accountId));
  envelope.bodyAssessments.forEach((row) => assertAccountScope(row, 'bodyAssessments', accountId));
  envelope.nextFollowUps.forEach((row) => assertAccountScope(row, 'nextFollowUps', accountId));
  envelope.dietPlans.forEach((row) => assertAccountScope(row, 'dietPlans', accountId));
  envelope.dietVariations.forEach((row) => assertAccountScope(row, 'dietVariations', accountId));
  envelope.dietVariationDays.forEach((row) => assertAccountScope(row, 'dietVariationDays', accountId));
  envelope.dietMeals.forEach((row) => assertAccountScope(row, 'dietMeals', accountId));
  envelope.foodCatalogItems.forEach((row) => assertAccountScope(row, 'foodCatalogItems', accountId));
  envelope.recipes.forEach((row) => assertAccountScope(row, 'recipes', accountId));
  envelope.recipeIngredients.forEach((row) => assertAccountScope(row, 'recipeIngredients', accountId));
  envelope.readyMeals.forEach((row) => assertAccountScope(row, 'readyMeals', accountId));
  envelope.readyMealItems.forEach((row) => assertAccountScope(row, 'readyMealItems', accountId));

  const patientsById = byId(envelope.patients);
  const plansById = byId(envelope.dietPlans);
  const variationsById = byId(envelope.dietVariations);
  const mealsById = byId(envelope.dietMeals);
  const optionsById = byId(envelope.dietMealOptions);
  const itemsById = byId(envelope.dietMealItems);
  const recipesById = byId(envelope.recipes);
  const readyMealsById = byId(envelope.readyMeals);

  ensureUnique(envelope.account, (row) => row.id, 'account');
  ensureUnique(envelope.objectiveOptions, (row) => row.id, 'objectiveOptions');
  ensureUnique(envelope.patients, (row) => row.id, 'patients');
  ensureUnique(envelope.bodyAssessments, (row) => row.id, 'bodyAssessments');
  ensureUnique(envelope.dietPlans, (row) => row.id, 'dietPlans');
  ensureUnique(envelope.dietVariations, (row) => row.id, 'dietVariations');
  ensureUnique(envelope.dietMeals, (row) => row.id, 'dietMeals');
  ensureUnique(envelope.dietMealOptions, (row) => row.id, 'dietMealOptions');
  ensureUnique(envelope.dietMealItems, (row) => row.id, 'dietMealItems');
  ensureUnique(envelope.dietItemSnapshots, (row) => row.dietMealItemId, 'dietItemSnapshots');
  ensureUnique(envelope.foodCatalogItems, (row) => row.id, 'foodCatalogItems');
  ensureUnique(envelope.recipes, (row) => row.id, 'recipes');
  ensureUnique(envelope.recipeIngredients, (row) => row.id, 'recipeIngredients');
  ensureUnique(envelope.readyMeals, (row) => row.id, 'readyMeals');
  ensureUnique(envelope.readyMealItems, (row) => row.id, 'readyMealItems');
  ensureUnique(envelope.nextFollowUps, (row) => `${row.accountId}|${row.patientId}`, 'nextFollowUps');
  ensureUnique(envelope.dietVariationDays, (row) => `${row.variationId}|${row.dayCode}`, 'dietVariationDays');

  const activeByPatient = new Set<string>();
  for (const row of envelope.dietPlans) {
    if (!patientsById.has(row.patientId)) fail('BACKUP_RELATION_INVALID', 'Uma dieta referencia um paciente inexistente.');
    if (row.status === 'ACTIVE') {
      if (activeByPatient.has(row.patientId)) fail('BACKUP_RELATION_INVALID', 'Um paciente possui mais de uma dieta vigente.');
      activeByPatient.add(row.patientId);
    }
  }
  for (const row of envelope.bodyAssessments) requireReference(patientsById, row.patientId, 'bodyAssessments.patientId');
  for (const row of envelope.nextFollowUps) requireReference(patientsById, row.patientId, 'nextFollowUps.patientId');

  for (const row of envelope.dietVariations) {
    const plan = requireReference(plansById, row.dietPlanId, 'dietVariations.dietPlanId');
    if (plan.accountId !== row.accountId || plan.patientId !== row.patientId) fail('BACKUP_RELATION_INVALID', 'A variação de dieta possui escopo incompatível com o plano.');
  }
  for (const row of envelope.dietVariationDays) {
    const variation = requireReference(variationsById, row.variationId, 'dietVariationDays.variationId');
    if (variation.dietPlanId !== row.dietPlanId || variation.accountId !== row.accountId || variation.patientId !== row.patientId) fail('BACKUP_RELATION_INVALID', 'O dia da variação possui uma cadeia incompatível.');
  }
  for (const row of envelope.dietMeals) {
    const variation = requireReference(variationsById, row.variationId, 'dietMeals.variationId');
    if (variation.dietPlanId !== row.dietPlanId || variation.accountId !== row.accountId || variation.patientId !== row.patientId) fail('BACKUP_RELATION_INVALID', 'A refeição possui uma cadeia de dieta incompatível.');
    requireReference(plansById, row.dietPlanId, 'dietMeals.dietPlanId');
  }
  for (const row of envelope.dietMealOptions) requireReference(mealsById, row.dietMealId, 'dietMealOptions.dietMealId');
  for (const row of envelope.dietMealItems) {
    const option = requireReference(optionsById, row.dietMealOptionId, 'dietMealItems.dietMealOptionId');
    if (row.parentItemId !== null) {
      const parent = requireReference(itemsById, row.parentItemId, 'dietMealItems.parentItemId');
      if (parent.dietMealOptionId !== option.id || parent.id === row.id) fail('BACKUP_RELATION_INVALID', 'O item substituto possui um pai incompatível.');
    }
  }
  for (const row of envelope.dietItemSnapshots) requireReference(itemsById, row.dietMealItemId, 'dietItemSnapshots.dietMealItemId');

  for (const row of envelope.recipeIngredients) {
    const recipe = requireReference(recipesById, row.recipeId, 'recipeIngredients.recipeId');
    if (recipe.accountId !== row.accountId) fail('BACKUP_RELATION_INVALID', 'O ingrediente de receita possui escopo incompatível.');
  }
  for (const row of envelope.readyMealItems) {
    const readyMeal = requireReference(readyMealsById, row.readyMealId, 'readyMealItems.readyMealId');
    if (readyMeal.accountId !== row.accountId) fail('BACKUP_RELATION_INVALID', 'O item de refeição pronta possui escopo incompatível.');
  }
}

export function validateBackupEnvelope(input: unknown, context: BackupValidationContext = {}): BackupEnvelope {
  if (!isRecord(input)) fail('BACKUP_FORMAT_INVALID', 'O backup deve ser um objeto JSON.');
  const hasFavorites = Object.prototype.hasOwnProperty.call(input, 'favorites');
  assertExactKeys(input, hasFavorites ? BACKUP_ENVELOPE_KEYS : BACKUP_ENVELOPE_KEYS.filter((key) => key !== 'favorites'), 'envelope');
  if (input.appId !== BACKUP_APP_ID) fail('BACKUP_APP_MISMATCH', 'O arquivo não pertence a esta aplicação.');
  if (input.formatVersion !== BACKUP_FORMAT_VERSION) fail('BACKUP_VERSION_UNSUPPORTED', 'A versão do formato de backup não é suportada.');
  if (input.schemaVersion !== BACKUP_SCHEMA_VERSION && input.schemaVersion !== LEGACY_BACKUP_SCHEMA_VERSION) fail('BACKUP_VERSION_UNSUPPORTED', 'A versão do schema do backup não é suportada.');
  if (context.schemaVersion && context.schemaVersion !== BACKUP_SCHEMA_VERSION && context.schemaVersion !== LEGACY_BACKUP_SCHEMA_VERSION) fail('BACKUP_VERSION_UNSUPPORTED', 'A versão do schema da sessão não é suportada.');
  if (!isString(input.exportedAt) || Number.isNaN(Date.parse(input.exportedAt))) fail('BACKUP_FORMAT_INVALID', 'A data de exportação do backup é inválida.');
  const favorites = hasFavorites ? input.favorites : [];
  if (!Array.isArray(favorites) || favorites.some((favorite) => !isString(favorite) || favorite.length === 0)) {
    fail('BACKUP_FORMAT_INVALID', 'A coleção favorites deve conter IDs de alimentos válidos.');
  }

  const envelope: BackupEnvelope = {
    appId: BACKUP_APP_ID,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: input.exportedAt,
    favorites,
    account: rows<AccountRow>('account', input.account, input.schemaVersion).map((row) => ({ ...row, phone: row.phone ?? null })),
    objectiveOptions: rows<ObjectiveOptionRow>('objectiveOptions', input.objectiveOptions, input.schemaVersion),
    patients: rows<PatientRow>('patients', input.patients, input.schemaVersion),
    bodyAssessments: rows<BodyAssessmentRow>('bodyAssessments', input.bodyAssessments, input.schemaVersion),
    nextFollowUps: rows<NextFollowUpRow>('nextFollowUps', input.nextFollowUps, input.schemaVersion),
    dietPlans: rows<DietPlanRow>('dietPlans', input.dietPlans, input.schemaVersion),
    dietVariations: rows<DietVariationRow>('dietVariations', input.dietVariations, input.schemaVersion),
    dietVariationDays: rows<DietVariationDayRow>('dietVariationDays', input.dietVariationDays, input.schemaVersion),
    dietMeals: rows<DietMealRow>('dietMeals', input.dietMeals, input.schemaVersion),
    dietMealOptions: rows<DietMealOptionRow>('dietMealOptions', input.dietMealOptions, input.schemaVersion),
    dietMealItems: rows<DietMealItemRow>('dietMealItems', input.dietMealItems, input.schemaVersion),
    dietItemSnapshots: rows<DietItemSnapshotRow>('dietItemSnapshots', input.dietItemSnapshots, input.schemaVersion),
    foodCatalogItems: rows<FoodCatalogItemRow>('foodCatalogItems', input.foodCatalogItems, input.schemaVersion),
    recipes: rows<RecipeRow>('recipes', input.recipes, input.schemaVersion),
    recipeIngredients: rows<RecipeIngredientRow>('recipeIngredients', input.recipeIngredients, input.schemaVersion),
    readyMeals: rows<ReadyMealRow>('readyMeals', input.readyMeals, input.schemaVersion),
    readyMealItems: rows<ReadyMealItemRow>('readyMealItems', input.readyMealItems, input.schemaVersion),
  };
  validateRelations(envelope, context.accountId);
  return envelope;
}

export function parseBackupEnvelope(serialized: string, context: BackupValidationContext = {}): BackupEnvelope {
  if (!isString(serialized) || serialized.trim() === '') fail('BACKUP_FORMAT_INVALID', 'O arquivo de backup está vazio.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch (cause) {
    fail('BACKUP_FORMAT_INVALID', 'O arquivo de backup não contém JSON válido.', cause);
  }
  return validateBackupEnvelope(parsed, context);
}

export interface BackupExportResult {
  fileName: string;
  content: string;
  envelope: BackupEnvelope;
}

export interface BackupApplicationDependencies {
  accountContext: AccountContext;
  repository: BackupRepository;
  draftStore: Pick<DietDraftStore, 'listRecoverableByAccount'>;
}

export interface BackupApplication {
  exportBackup(): Promise<BackupExportResult>;
  validateBackup(serialized: string): Promise<BackupEnvelope>;
  restoreBackup(serialized: string, options?: { confirmed?: boolean }): Promise<void>;
}

function appErrorFromCause(code: BackupErrorCode, message: string, cause: unknown): BackupApplicationError {
  if (cause instanceof BackupApplicationError) return cause;
  if (cause instanceof BackupRepositoryError && cause.code === code) return new BackupApplicationError(code, message, { cause });
  return new BackupApplicationError(code, message, { cause });
}

function exportFileName(exportedAt: string): string {
  const datePart = exportedAt.slice(0, 10) || 'local';
  return `nutridiet-backup-${datePart}.nutridiet`;
}

export function createBackupApplication(dependencies: BackupApplicationDependencies): BackupApplication {
  const getValidationContext = async (): Promise<{ accountId: string; schemaVersion: string }> => {
    const active = await dependencies.accountContext.requireActive();
    return { accountId: active.accountId, schemaVersion: BACKUP_SCHEMA_VERSION };
  };

  return {
    exportBackup: async () => {
      try {
        const active = await dependencies.accountContext.requireActive();
        const envelope = await dependencies.repository.readAccountSnapshot(active.accountId);
        const content = JSON.stringify(envelope);
        if (!content) throw new Error('O conteúdo do backup ficou vazio.');
        return { fileName: exportFileName(envelope.exportedAt), content, envelope };
      } catch (cause) {
        throw appErrorFromCause('BACKUP_EXPORT_FAILED', 'O backup não pôde ser concluído. A base local permanece utilizável.', cause);
      }
    },
    validateBackup: async (serialized) => {
      const context = await getValidationContext();
      return parseBackupEnvelope(serialized, context);
    },
    restoreBackup: async (serialized, options = {}) => {
      const context = await getValidationContext();
      const envelope = parseBackupEnvelope(serialized, context);
      const drafts = await dependencies.draftStore.listRecoverableByAccount(context.accountId);
      if (drafts.length > 0) throw new BackupApplicationError('BACKUP_PENDING_EDITS', 'Resolva, salve ou descarte os rascunhos pendentes antes de importar o backup.');
      if (options.confirmed !== true) throw new BackupApplicationError('BACKUP_CANCELLED', 'A importação foi cancelada; a base local não foi alterada.');
      try {
        await dependencies.repository.replaceAccountSnapshot(context.accountId, envelope);
      } catch (cause) {
        throw appErrorFromCause('BACKUP_RESTORE_FAILED', 'A importação falhou; a base anterior foi preservada.', cause);
      }
    },
  };
}
