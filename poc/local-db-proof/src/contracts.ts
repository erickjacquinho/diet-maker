export const FIXTURE_VERSION = 'fixture-v1';
export const SUPPORTED_FORMAT_VERSION = '1.0';
export const INITIAL_SCHEMA_VERSION = '1';
export const SUPPORTED_SCHEMA_VERSION = '2';

export type DietStatus = 'ACTIVE' | 'SNAPSHOT';
export type SourceKind = 'TACO' | 'CUSTOM';
export type PocMode = 'browser-persistent' | 'test-memory';

export type PocErrorCode =
  | 'INITIALIZATION_FAILED'
  | 'PERSISTENCE_UNCONFIRMED'
  | 'MIGRATION_FAILED'
  | 'IMPORT_REJECTED'
  | 'LOCK_UNAVAILABLE'
  | 'SCOPE_VIOLATION'
  | 'INTEGRITY_VIOLATION'
  | 'DRAFT_FAILED'
  | 'OFFLINE_RESOURCE_NOT_READY';

export class PocError extends Error {
  readonly code: PocErrorCode;
  readonly operation: string;
  readonly details?: Record<string, unknown>;

  constructor(
    code: PocErrorCode,
    operation: string,
    message: string,
    details?: Record<string, unknown>,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'PocError';
    this.code = code;
    this.operation = operation;
    this.details = details;
  }
}

export interface Account {
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  accountId: string;
  name: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  accountId: string;
  name: string;
  yieldPortions: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  sourceKind: SourceKind;
  sourceId: string;
  quantityG: number;
}

export interface DietPlan {
  id: string;
  accountId: string;
  patientId: string;
  status: DietStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  fixtureMetadata?: string;
}

export interface DietMeal {
  id: string;
  dietPlanId: string;
  position: number;
  name: string;
}

export interface DietMealItem {
  id: string;
  mealId: string;
  sourceKind: SourceKind;
  sourceId: string;
  quantityG: number;
  energyKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DietDraft {
  draftId: string;
  accountId: string;
  patientId: string;
  targetDietId?: string;
  expectedVersion?: number;
  payload: Record<string, unknown>;
  updatedAt: string;
}

export interface ConfirmedFixture {
  accounts: Account[];
  patients: Patient[];
  recipes: Recipe[];
  recipeIngredients: RecipeIngredient[];
  dietPlans: DietPlan[];
  dietMeals: DietMeal[];
  dietMealItems: DietMealItem[];
}

export interface PortableSample {
  formatVersion: typeof SUPPORTED_FORMAT_VERSION;
  schemaVersion: typeof SUPPORTED_SCHEMA_VERSION;
  exportedAt: string;
  accountId: string;
  records: ConfirmedFixture;
}

export interface Fixture extends ConfirmedFixture {
  version: string;
  drafts: DietDraft[];
}

export interface SaveDietInput {
  plan: DietPlan;
  meals: Array<DietMeal & { items: DietMealItem[] }>;
  failAfter?: 'plan' | 'meal' | 'item';
}

export interface OpenDatabaseResult {
  mode: PocMode;
  schemaVersion: string;
  persistent: boolean;
}

export interface TimingSample {
  openingMs?: number;
  queryMs?: number;
  writeMs?: number;
}

export interface ReportEntry {
  scenario: string;
  status: 'pass' | 'fail' | 'blocked';
  message: string;
  limitation?: string;
  timings?: TimingSample;
}

export interface LocalDatabasePort {
  open(): Promise<OpenDatabaseResult>;
  close(): Promise<void>;
  seedFixture(fixture: Fixture): Promise<void>;
  readConfirmed(accountId: string): Promise<ConfirmedFixture>;
  saveDiet(input: SaveDietInput): Promise<DietPlan>;
  replaceConfirmed(sample: PortableSample): Promise<void>;
}
