import type {
  AutosaveResult,
  ConfirmActiveResult,
  DietDraft,
  DietEditableDocument,
  DietPlan,
  DietVariation,
  DiscardResult,
} from '@/lib/domain/diets/diet-model';
import type { LibraryDietSourceReader } from './library-insertion';

export interface DraftContext {
  accountId: string;
  patientId: string;
  routeDietId: string;
}

export interface ConfirmActiveCommand {
  accountId: string;
  patientId: string;
  targetDietId: string;
  baseDietId?: string;
  baseDietVersion?: number;
  draftId: string;
  confirmedDraftRevision: number;
  plan: DietPlan;
}

export interface DietRepository {
  getById(accountId: string, patientId: string, dietId: string): Promise<DietPlan | null>;
  listConfirmed(accountId: string, patientId: string): Promise<DietPlan[]>;
  countConfirmed(accountId: string, patientId: string): Promise<number>;
  confirmActive(command: ConfirmActiveCommand): Promise<ConfirmActiveResult>;
}

export interface DietDraftStore {
  create(document: DietDraft, context: DraftContext): Promise<DietDraft>;
  getByContext(accountId: string, patientId: string, routeDietId: string): Promise<DietDraft | null>;
  get(draftId: string): Promise<DietDraft | null>;
  putIfNewer(draft: DietDraft, expectedPreviousRevision: number): Promise<AutosaveResult>;
  reserveTargetId(draftId: string, expectedRevision: number, targetDietId: string): Promise<DietDraft | null>;
  removeIfRevision(draftId: string, expectedRevision: number): Promise<boolean>;
  invalidateByPatient(accountId: string, patientId: string): Promise<number>;
  listRecoverableByPatient(accountId: string, patientId: string): Promise<DietDraft[]>;
}

export interface DietHistoryRow {
  id: string;
  version: number;
  name: string;
  mode: DietPlan['mode'];
  status: DietPlan['status'];
  activatedAt: string;
  mealCount: number;
  canEdit: boolean;
  canOpenReadOnly: boolean;
  canUseAsSource: boolean;
  canDelete: false;
  plan: DietPlan;
}

export interface PatientDietSummary {
  current: DietHistoryRow | null;
  history: DietHistoryRow[];
  confirmedCount: number;
  recoverableDraft: DietDraft | null;
}

export interface PreviousDietSource {
  plan: DietPlan;
  activeVariation: DietVariation | null;
}

export interface PatientDietReader {
  getPatientDietSummary(accountId: string, patientId: string): Promise<PatientDietSummary>;
  listHistory(accountId: string, patientId: string): Promise<DietHistoryRow[]>;
  listPreviousSources(accountId: string, patientId: string): Promise<PreviousDietSource[]>;
  getSnapshot(accountId: string, patientId: string, dietId: string): Promise<DietPlan | null>;
  countConfirmed(accountId: string, patientId: string): Promise<number>;
}

export interface DietApplicationDependencies {
  accountContext: import('@/lib/persistence/account-context').AccountContext;
  patientReader: { getById(accountId: string, patientId: string): Promise<import('@/lib/domain/patient').Patient | null> };
  repository: DietRepository;
  draftStore: DietDraftStore;
  dietReader: PatientDietReader;
  now?: () => string;
  idFactory?: () => string;
  librarySourceReader?: LibraryDietSourceReader;
}

export interface OpenEditorResult {
  draft: DietDraft;
  isNew: boolean;
}

export interface DietApplication {
  openEditor(patientId: string, routeDietId: string): Promise<OpenEditorResult>;
  autosaveDraft(draftId: string, expectedRevision: number, document: DietEditableDocument): Promise<AutosaveResult>;
  flushDraft(draftId: string, document: DietEditableDocument): Promise<AutosaveResult>;
  discardDraft(draftId: string, expectedRevision: number): Promise<DiscardResult>;
  listPreviousDietSources(patientId: string): Promise<PreviousDietSource[]>;
  pullTargets(draftId: string, sourceDietId: string, sourceVariationId: string, targetVariationId: string): Promise<DietDraft>;
  pullCompleteDiet(draftId: string, sourceDietId: string): Promise<DietDraft>;
  saveDietAsActive(draftId: string, expectedRevision: number): Promise<import('@/lib/domain/diets/diet-model').SaveOutcome>;
  reconcileUnknownSave(draftId: string): Promise<{ status: 'COMMITTED' | 'NOT_COMMITTED' | 'REVIEW_REQUIRED'; planId?: string; version?: number }>;
  getPatientDietSummary(patientId: string): Promise<PatientDietSummary>;
  getDietSnapshot(patientId: string, dietId: string): Promise<DietPlan | null>;
  invalidatePatientDrafts(patientId: string): Promise<number>;
  insertRecipeIntoDietDraft(command: import('./library-insertion').RecipeInsertionCommand): Promise<DietDraft>;
  insertReadyMealIntoDietDraft(command: import('./library-insertion').ReadyMealInsertionCommand): Promise<DietDraft>;
}
