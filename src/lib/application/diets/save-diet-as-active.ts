import { nanoid } from 'nanoid';
import { DietDomainError, isDietDomainError } from '@/lib/domain/diets/diet-errors';
import { validateDietForConfirmation } from '@/lib/domain/diets/diet-validation';
import type { DietDraft, DietPlan, SaveOutcome } from '@/lib/domain/diets/diet-model';
import type { DietApplicationDependencies, ConfirmActiveCommand } from './diet-ports';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'A prescrição não pôde ser confirmada.';
}

async function loadDraft(dependencies: DietApplicationDependencies, draftId: string): Promise<DietDraft> {
  const account = await dependencies.accountContext.requireActive();
  const draft = await dependencies.draftStore.get(draftId);
  if (!draft || draft.accountId !== account.accountId) throw new DietDomainError('CONTEXT_MISSING', 'Rascunho não encontrado no contexto ativo.');
  const patient = await dependencies.patientReader.getById(account.accountId, draft.patientId);
  if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
  if (patient.archivedAt !== null) throw new DietDomainError('ARCHIVED_PATIENT', 'Paciente arquivado não pode receber uma prescrição.');
  return draft;
}

function planFromDraft(draft: DietDraft, targetDietId: string, now: string, version: number): DietPlan {
  return {
    id: targetDietId,
    accountId: draft.accountId,
    patientId: draft.patientId,
    name: draft.payload.name,
    mode: draft.payload.mode,
    status: 'ACTIVE',
    version,
    ...(draft.payload.weightReferenceKg ? { weightReferenceKg: draft.payload.weightReferenceKg } : {}),
    createdAt: now,
    updatedAt: now,
    activatedAt: now,
    supersededAt: null,
    variations: structuredClone(draft.payload.variations),
  };
}

export async function saveDietAsActive(dependencies: DietApplicationDependencies, draftId: string, expectedRevision: number): Promise<SaveOutcome> {
  let draft: DietDraft;
  try {
    draft = await loadDraft(dependencies, draftId);
    if (draft.state !== 'EDITABLE') return { status: 'ROLLED_BACK', draftId, message: 'O rascunho foi invalidado.' };
    if (draft.draftRevision !== expectedRevision) return { status: 'VERSION_CONFLICT', draftId, message: 'A edição mudou antes do salvamento.' };
    validateDietForConfirmation(draft.payload);

    const isUpdate = Boolean(draft.baseDietId);
    const targetDietId = isUpdate ? draft.baseDietId! : draft.targetDietId ?? dependencies.idFactory?.() ?? nanoid(16);
    if (!isUpdate && !draft.targetDietId) {
      const reserved = await dependencies.draftStore.reserveTargetId(draftId, expectedRevision, targetDietId);
      if (!reserved) return { status: 'ROLLED_BACK', draftId, message: 'O rascunho foi removido antes do salvamento.' };
      draft = reserved;
    }
    const version = isUpdate ? (draft.baseDietVersion ?? 0) + 1 : 1;
    const plan = planFromDraft(draft, isUpdate ? draft.baseDietId! : targetDietId, dependencies.now?.() ?? new Date().toISOString(), version);
    const command: ConfirmActiveCommand = {
      accountId: draft.accountId, patientId: draft.patientId, targetDietId: plan.id, baseDietId: draft.baseDietId, baseDietVersion: draft.baseDietVersion,
      draftId, confirmedDraftRevision: expectedRevision, plan,
    };
    const committed = await dependencies.repository.confirmActive(command);
    const removed = await dependencies.draftStore.removeIfRevision(draftId, expectedRevision);
    if (!removed) return { status: 'CLEANUP_PENDING', draftId, planId: committed.planId, version: committed.version, message: 'Prescrição salva; a limpeza do rascunho ficou pendente.' };
    return { status: 'COMMITTED', draftId, planId: committed.planId, version: committed.version, message: 'Prescrição confirmada.' };
  } catch (error) {
    if (isDietDomainError(error) && error.code === 'VERSION_CONFLICT') return { status: 'VERSION_CONFLICT', draftId, message: errorMessage(error) };
    if (isDietDomainError(error) && error.code === 'RESULT_UNKNOWN') return { status: 'RESULT_UNKNOWN', draftId, message: errorMessage(error) };
    return { status: 'ROLLED_BACK', draftId, message: errorMessage(error) };
  }
}

export async function reconcileUnknownSave(dependencies: DietApplicationDependencies, draftId: string): Promise<{ status: 'COMMITTED' | 'NOT_COMMITTED' | 'REVIEW_REQUIRED'; planId?: string; version?: number }> {
  const draft = await loadDraft(dependencies, draftId);
  const identity = draft.baseDietId ?? draft.targetDietId;
  if (!identity) return { status: 'REVIEW_REQUIRED' };
  try {
    const plan = await dependencies.repository.getById(draft.accountId, draft.patientId, identity);
    if (!plan) return { status: 'NOT_COMMITTED' };
    if (!draft.baseDietId || plan.version === (draft.baseDietVersion ?? 0) + 1) return { status: 'COMMITTED', planId: plan.id, version: plan.version };
    if (plan.version === draft.baseDietVersion) return { status: 'NOT_COMMITTED' };
    return { status: 'REVIEW_REQUIRED', planId: plan.id, version: plan.version };
  } catch {
    return { status: 'REVIEW_REQUIRED' };
  }
}
