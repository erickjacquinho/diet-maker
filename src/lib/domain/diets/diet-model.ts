export type DecimalString = string & { readonly __decimalString: unique symbol };

const DECIMAL_STRING_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

export function isDecimalString(value: string): value is DecimalString {
  return DECIMAL_STRING_PATTERN.test(value);
}

export function createDecimalString(value: string): DecimalString {
  if (!isDecimalString(value)) {
    throw new Error(`Valor decimal inválido: ${value}`);
  }
  return value;
}

export type DietMode = 'SIMPLE' | 'CARB_CYCLING';
export type DietPlanStatus = 'ACTIVE' | 'SNAPSHOT';
export type DietDraftState = 'EDITABLE' | 'INVALIDATED_BY_PATIENT_ARCHIVE';
export type DietItemRole = 'PRIMARY' | 'SUBSTITUTE';
export type NutritionSourceType = 'SYSTEM_TACO' | 'ACCOUNT_CUSTOM' | 'RECIPE' | 'READY_MEAL';
export type MeasurementBasis = 'PER_100G' | 'PER_100ML' | 'PER_UNIT';
export type FoodState = 'RAW' | 'COOKED' | 'PREPARED' | 'AS_SOLD';
export type EnergySource = 'REFERENCE' | 'CALCULATED_449';
export type DietUnit = 'g' | 'ml' | 'unit';
export type DietDayCode = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type DietVariationKind = 'SIMPLE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ZERO' | 'CUSTOM';
export type DietInputMode = 'GRAMS' | 'G_PER_KG' | 'PERCENTAGE' | 'DELTA_BASE';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface NutritionValues {
  protein: DecimalString;
  carbs: DecimalString;
  fat: DecimalString;
  fiber: DecimalString;
  energyKcal?: DecimalString;
}

export interface NutritionSnapshot {
  sourceType: NutritionSourceType;
  sourceId: string;
  sourceVersion: string;
  displayName: string;
  description: string;
  measurementBasis: MeasurementBasis;
  foodState: FoodState;
  referenceQuantity: DecimalString;
  referenceUnit: DietUnit;
  referenceNutrients: NutritionValues;
  prescribedQuantity: DecimalString;
  prescribedUnit: DietUnit;
  prescribedNutrients: NutritionValues;
  energySource: EnergySource;
  calculationVersion: string;
  conversionSnapshot: JsonValue;
  compositionSnapshot: JsonValue;
}

export interface DietItem {
  id: string;
  position: number;
  role: DietItemRole;
  parentItemId?: string;
  name: string;
  snapshot: NutritionSnapshot;
}

export interface DietMealOption {
  id: string;
  position: number;
  label: string;
  countsTowardTotals: boolean;
  items: DietItem[];
}

export interface DietMeal {
  id: string;
  position: number;
  name: string;
  time?: string;
  options: DietMealOption[];
}

export interface DietTargets {
  protein: DecimalString;
  carbs: DecimalString;
  fat: DecimalString;
  energyKcal: DecimalString;
}

export interface DietGPerKg {
  protein: DecimalString;
  carbs: DecimalString;
  fat: DecimalString;
}

export interface DietVariation {
  id: string;
  position: number;
  kind: DietVariationKind;
  name: string;
  inputMode: DietInputMode;
  assignedDays: DietDayCode[];
  targets: DietTargets;
  gPerKg?: DietGPerKg;
  meals: DietMeal[];
}

export interface DietEditableDocument {
  name: string;
  mode: DietMode;
  weightReferenceKg?: DecimalString;
  variations: DietVariation[];
}

export interface DietDraft {
  draftId: string;
  contextKey: string;
  accountId: string;
  patientId: string;
  routeDietId: 'nova' | string;
  payloadSchemaVersion: number;
  draftRevision: number;
  state: DietDraftState;
  baseDietId?: string;
  baseDietVersion?: number;
  targetDietId?: string;
  payload: DietEditableDocument;
  createdAt: string;
  updatedAt: string;
}

export interface DietPlan {
  id: string;
  accountId: string;
  patientId: string;
  name: string;
  mode: DietMode;
  status: DietPlanStatus;
  version: number;
  weightReferenceKg?: DecimalString;
  createdAt: string;
  updatedAt: string;
  activatedAt: string;
  supersededAt: string | null;
  variations: DietVariation[];
}

export interface ConfirmActiveResult {
  status: 'COMMITTED_NEW' | 'COMMITTED_UPDATE' | 'ALREADY_COMMITTED';
  planId: string;
  version: number;
}

export interface SaveOutcome {
  status: 'ROLLED_BACK' | 'VERSION_CONFLICT' | 'RESULT_UNKNOWN' | 'COMMITTED' | 'CLEANUP_PENDING';
  draftId: string;
  message: string;
  planId?: string;
  version?: number;
}

export interface AutosaveSavedResult {
  status: 'SAVED';
  revision: number;
  updatedAt: string;
}

export interface AutosaveSupersededResult {
  status: 'SUPERSEDED';
  currentRevision: number;
}

export interface AutosaveInvalidatedResult {
  status: 'INVALIDATED';
}

export type AutosaveResult = AutosaveSavedResult | AutosaveSupersededResult | AutosaveInvalidatedResult;

export type DiscardResult = 'REMOVED' | 'ALREADY_REMOVED' | 'SUPERSEDED_REVISION';
