import {
  isDecimalString,
  type DecimalString,
  type DietDayCode,
  type DietDraft,
  type DietEditableDocument,
  type DietGPerKg,
  type DietInputMode,
  type DietItem,
  type DietItemRole,
  type DietMeal,
  type DietMealOption,
  type DietMode,
  type DietPlan,
  type DietTargets,
  type DietUnit,
  type DietVariation,
  type DietVariationKind,
  type EnergySource,
  type FoodState,
  type JsonValue,
  type MeasurementBasis,
  type NutritionSnapshot,
  type NutritionSourceType,
  type NutritionValues,
} from '@/lib/domain/diets/diet-model';

/** Wire contracts for `/api/v1/patients/:id/diets` and `/diet-drafts`. Shared by browser and server. */

export type DietPlanDto = Omit<DietPlan, 'accountId'>;
export type DietDraftDto = Omit<DietDraft, 'accountId' | 'contextKey' | 'draftId'> & { draftId: string };

export interface ConfirmDietRequest {
  /** Client-generated ID of the diet being confirmed (stable across retries). */
  dietId: string;
  baseDietId?: string;
  baseDietVersion?: number;
  /** Route of the draft to discard when the confirmation commits. */
  draftRouteId?: string;
  document: DietEditableDocument;
}

export interface PutDietDraftRequest {
  draftId: string;
  draftRevision: number;
  payloadSchemaVersion: number;
  baseDietId?: string;
  baseDietVersion?: number;
  targetDietId?: string;
  payload: DietEditableDocument;
}

const idPattern = /^[A-Za-z0-9_-]{1,100}$/;
const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function record(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object.');
  const source = value as Record<string, unknown>;
  for (const key of Object.keys(source)) if (!allowed.includes(key)) throw new TypeError('Unknown field.');
  return source;
}

function text(value: unknown, max = 200): string {
  if (typeof value !== 'string' || value.length > max) throw new TypeError('Invalid text.');
  return value;
}

function optionalText(value: unknown, max = 200): string | undefined {
  return value === undefined || value === null ? undefined : text(value, max);
}

function id(value: unknown): string {
  if (typeof value !== 'string' || !idPattern.test(value)) throw new TypeError('Invalid id.');
  return value;
}

function integer(value: unknown, min = 0, max = 1_000_000): number {
  if (!Number.isSafeInteger(value) || (value as number) < min || (value as number) > max) throw new TypeError('Invalid integer.');
  return value as number;
}

function decimal(value: unknown): DecimalString {
  if (typeof value !== 'string' || value.length > 40 || !isDecimalString(value)) throw new TypeError('Invalid decimal.');
  return value;
}

function oneOf<T extends string>(value: unknown, options: readonly T[]): T {
  if (typeof value !== 'string' || !options.includes(value as T)) throw new TypeError('Invalid option.');
  return value as T;
}

function list<T>(value: unknown, parse: (item: unknown) => T, max: number): T[] {
  if (!Array.isArray(value) || value.length > max) throw new TypeError('Invalid list.');
  return value.map(parse);
}

function json(value: unknown, depth = 0): JsonValue {
  if (depth > 8) throw new TypeError('JSON too deep.');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.slice(0, 200).map((entry) => json(entry, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 200).map(([key, entry]) => [key, json(entry, depth + 1)]));
  }
  throw new TypeError('Invalid JSON.');
}

const units: readonly DietUnit[] = ['g', 'ml', 'unit'];

function nutrition(value: unknown): NutritionValues {
  const v = record(value, ['protein', 'carbs', 'fat', 'fiber', 'energyKcal']);
  return {
    protein: decimal(v.protein), carbs: decimal(v.carbs), fat: decimal(v.fat), fiber: decimal(v.fiber),
    ...(v.energyKcal === undefined || v.energyKcal === null ? {} : { energyKcal: decimal(v.energyKcal) }),
  };
}

function snapshot(value: unknown): NutritionSnapshot {
  const v = record(value, [
    'sourceType', 'sourceId', 'sourceVersion', 'displayName', 'description', 'measurementBasis', 'foodState',
    'referenceQuantity', 'referenceUnit', 'referenceNutrients', 'prescribedQuantity', 'prescribedUnit',
    'prescribedNutrients', 'energySource', 'calculationVersion', 'conversionSnapshot', 'compositionSnapshot',
  ]);
  return {
    sourceType: oneOf<NutritionSourceType>(v.sourceType, ['SYSTEM_TACO', 'ACCOUNT_CUSTOM', 'RECIPE', 'READY_MEAL']),
    sourceId: text(v.sourceId, 100), sourceVersion: text(v.sourceVersion, 100),
    displayName: text(v.displayName), description: text(v.description, 1000),
    measurementBasis: oneOf<MeasurementBasis>(v.measurementBasis, ['PER_100G', 'PER_100ML', 'PER_UNIT']),
    foodState: oneOf<FoodState>(v.foodState, ['RAW', 'COOKED', 'PREPARED', 'AS_SOLD']),
    referenceQuantity: decimal(v.referenceQuantity), referenceUnit: oneOf(v.referenceUnit, units),
    referenceNutrients: nutrition(v.referenceNutrients),
    prescribedQuantity: decimal(v.prescribedQuantity), prescribedUnit: oneOf(v.prescribedUnit, units),
    prescribedNutrients: nutrition(v.prescribedNutrients),
    energySource: oneOf<EnergySource>(v.energySource, ['REFERENCE', 'CALCULATED_449']),
    calculationVersion: text(v.calculationVersion, 100),
    conversionSnapshot: json(v.conversionSnapshot), compositionSnapshot: json(v.compositionSnapshot),
  };
}

function item(value: unknown): DietItem {
  const v = record(value, ['id', 'position', 'role', 'parentItemId', 'name', 'snapshot']);
  return {
    id: id(v.id), position: integer(v.position, 0, 1000), role: oneOf<DietItemRole>(v.role, ['PRIMARY', 'SUBSTITUTE']),
    ...(v.parentItemId === undefined || v.parentItemId === null ? {} : { parentItemId: id(v.parentItemId) }),
    name: text(v.name), snapshot: snapshot(v.snapshot),
  };
}

function option(value: unknown): DietMealOption {
  const v = record(value, ['id', 'position', 'label', 'countsTowardTotals', 'items']);
  if (typeof v.countsTowardTotals !== 'boolean') throw new TypeError('Invalid flag.');
  return {
    id: id(v.id), position: integer(v.position, 0, 100), label: text(v.label, 100),
    countsTowardTotals: v.countsTowardTotals, items: list(v.items, item, 100),
  };
}

function meal(value: unknown): DietMeal {
  const v = record(value, ['id', 'position', 'name', 'time', 'options']);
  const time = optionalText(v.time, 20);
  return { id: id(v.id), position: integer(v.position, 0, 100), name: text(v.name, 100), ...(time === undefined ? {} : { time }), options: list(v.options, option, 20) };
}

function targets(value: unknown): DietTargets {
  const v = record(value, ['protein', 'carbs', 'fat', 'energyKcal']);
  return { protein: decimal(v.protein), carbs: decimal(v.carbs), fat: decimal(v.fat), energyKcal: decimal(v.energyKcal) };
}

function gPerKg(value: unknown): DietGPerKg {
  const v = record(value, ['protein', 'carbs', 'fat']);
  return { protein: decimal(v.protein), carbs: decimal(v.carbs), fat: decimal(v.fat) };
}

const dayCodes: readonly DietDayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function variation(value: unknown): DietVariation {
  const v = record(value, ['id', 'position', 'kind', 'name', 'inputMode', 'assignedDays', 'targets', 'gPerKg', 'meals']);
  return {
    id: id(v.id), position: integer(v.position, 0, 50),
    kind: oneOf<DietVariationKind>(v.kind, ['SIMPLE', 'HIGH', 'MEDIUM', 'LOW', 'ZERO', 'CUSTOM']),
    name: text(v.name, 100),
    inputMode: oneOf<DietInputMode>(v.inputMode, ['GRAMS', 'G_PER_KG', 'PERCENTAGE', 'DELTA_BASE']),
    assignedDays: list((v.assignedDays), (day) => oneOf(day, dayCodes), 7),
    targets: targets(v.targets),
    ...(v.gPerKg === undefined || v.gPerKg === null ? {} : { gPerKg: gPerKg(v.gPerKg) }),
    meals: list(v.meals, meal, 30),
  };
}

export function parseDietDocument(value: unknown): DietEditableDocument {
  const v = record(value, ['name', 'mode', 'weightReferenceKg', 'variations']);
  return {
    name: text(v.name, 200), mode: oneOf<DietMode>(v.mode, ['SIMPLE', 'CARB_CYCLING']),
    ...(v.weightReferenceKg === undefined || v.weightReferenceKg === null ? {} : { weightReferenceKg: decimal(v.weightReferenceKg) }),
    variations: list(v.variations, variation, 10),
  };
}

export function parseConfirmDietRequest(value: unknown): ConfirmDietRequest {
  const v = record(value, ['dietId', 'baseDietId', 'baseDietVersion', 'draftRouteId', 'document']);
  if (typeof v.dietId !== 'string' || !uuidPattern.test(v.dietId)) throw new TypeError('Invalid id.');
  const baseDietId = v.baseDietId === undefined || v.baseDietId === null ? undefined : String(v.baseDietId);
  if (baseDietId !== undefined && !uuidPattern.test(baseDietId)) throw new TypeError('Invalid id.');
  if ((baseDietId === undefined) !== (v.baseDietVersion === undefined || v.baseDietVersion === null)) throw new TypeError('Base requires id and version.');
  return {
    dietId: v.dietId.toLowerCase(),
    ...(baseDietId === undefined ? {} : { baseDietId: baseDietId.toLowerCase(), baseDietVersion: integer(v.baseDietVersion, 1, 1_000_000) }),
    ...(v.draftRouteId === undefined || v.draftRouteId === null ? {} : { draftRouteId: routeId(v.draftRouteId) }),
    document: parseDietDocument(v.document),
  };
}

export function routeId(value: unknown): string {
  if (value === 'nova') return 'nova';
  if (typeof value !== 'string' || !uuidPattern.test(value)) throw new TypeError('Invalid route id.');
  return value.toLowerCase();
}

export function parsePutDietDraftRequest(value: unknown): PutDietDraftRequest {
  const v = record(value, ['draftId', 'draftRevision', 'payloadSchemaVersion', 'baseDietId', 'baseDietVersion', 'targetDietId', 'payload']);
  const optionalUuid = (entry: unknown) => {
    if (entry === undefined || entry === null) return undefined;
    if (typeof entry !== 'string' || !uuidPattern.test(entry)) throw new TypeError('Invalid id.');
    return entry.toLowerCase();
  };
  const baseDietId = optionalUuid(v.baseDietId);
  const targetDietId = optionalUuid(v.targetDietId);
  return {
    draftId: id(v.draftId), draftRevision: integer(v.draftRevision, 1), payloadSchemaVersion: integer(v.payloadSchemaVersion, 1, 100),
    ...(baseDietId === undefined ? {} : { baseDietId, baseDietVersion: integer(v.baseDietVersion, 1) }),
    ...(targetDietId === undefined ? {} : { targetDietId }),
    payload: parseDietDocument(v.payload),
  };
}

/** Output allowlist: rebuilds the plan from public fields only, whatever the handler returned. */
export function parseDietPlanDto(value: unknown): DietPlanDto {
  const p = record(value, ['id', 'accountId', 'patientId', 'name', 'mode', 'status', 'version', 'weightReferenceKg', 'createdAt', 'updatedAt', 'activatedAt', 'supersededAt', 'variations']);
  const document = parseDietDocument({ name: p.name, mode: p.mode, weightReferenceKg: p.weightReferenceKg, variations: p.variations });
  return {
    id: String(p.id), patientId: String(p.patientId), name: document.name, mode: document.mode,
    status: p.status === 'SNAPSHOT' ? 'SNAPSHOT' : 'ACTIVE', version: Number(p.version),
    ...(document.weightReferenceKg === undefined ? {} : { weightReferenceKg: document.weightReferenceKg }),
    createdAt: String(p.createdAt), updatedAt: String(p.updatedAt), activatedAt: String(p.activatedAt),
    supersededAt: p.supersededAt === null || p.supersededAt === undefined ? null : String(p.supersededAt),
    variations: document.variations,
  };
}

export function parseDietPlanListDto(value: unknown): { items: DietPlanDto[] } {
  const v = record(value, ['items']);
  return { items: list(v.items, parseDietPlanDto, 200) };
}

export function parseConfirmDietResultDto(value: unknown) {
  const v = record(value, ['status', 'planId', 'version']);
  return {
    status: oneOf(v.status, ['COMMITTED_NEW', 'COMMITTED_UPDATE', 'ALREADY_COMMITTED'] as const),
    planId: String(v.planId), version: integer(v.version, 1),
  };
}

export type AutosaveResultDto =
  | { status: 'SAVED'; revision: number; updatedAt: string }
  | { status: 'SUPERSEDED'; currentRevision: number }
  | { status: 'INVALIDATED' };

export function parseAutosaveResultDto(value: unknown): AutosaveResultDto {
  const v = record(value, ['status', 'revision', 'updatedAt', 'currentRevision']);
  if (v.status === 'SAVED') return { status: 'SAVED', revision: integer(v.revision, 1), updatedAt: String(v.updatedAt) };
  if (v.status === 'SUPERSEDED') return { status: 'SUPERSEDED', currentRevision: integer(v.currentRevision, 1) };
  return { status: 'INVALIDATED' };
}

export function parseOptionalDietDraftDto(value: unknown): { draft: DietDraftDto | null } {
  const v = record(value, ['draft']);
  if (v.draft === null) return { draft: null };
  const d = record(v.draft, ['draftId', 'patientId', 'routeDietId', 'payloadSchemaVersion', 'draftRevision', 'state', 'baseDietId', 'baseDietVersion', 'targetDietId', 'payload', 'createdAt', 'updatedAt', 'accountId', 'contextKey']);
  return {
    draft: {
      draftId: String(d.draftId), patientId: String(d.patientId), routeDietId: String(d.routeDietId),
      payloadSchemaVersion: Number(d.payloadSchemaVersion), draftRevision: Number(d.draftRevision),
      state: d.state === 'INVALIDATED_BY_PATIENT_ARCHIVE' ? 'INVALIDATED_BY_PATIENT_ARCHIVE' : 'EDITABLE',
      ...(d.baseDietId == null ? {} : { baseDietId: String(d.baseDietId), baseDietVersion: Number(d.baseDietVersion) }),
      ...(d.targetDietId == null ? {} : { targetDietId: String(d.targetDietId) }),
      payload: parseDietDocument(d.payload), createdAt: String(d.createdAt), updatedAt: String(d.updatedAt),
    },
  };
}
