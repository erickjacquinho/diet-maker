import { nanoid } from 'nanoid';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import { createDecimalString, type AutosaveResult, type DietDraft, type DietEditableDocument, type DietPlan } from '@/lib/domain/diets/diet-model';
import type { Patient } from '@/lib/domain/patient';
import type { DietApplicationDependencies, DraftContext, OpenEditorResult } from './diet-ports';

export type DietDraftCommandDependencies = Pick<DietApplicationDependencies, 'accountContext' | 'patientReader' | 'repository' | 'draftStore'> & {
  now?: () => string;
  idFactory?: () => string;
};

function emptyTargets() {
  return { protein: createDecimalString('0'), carbs: createDecimalString('0'), fat: createDecimalString('0'), energyKcal: createDecimalString('0') };
}

function newDocument(weightKg: number): DietEditableDocument {
  return {
    name: 'Prescrição Alimentar',
    mode: 'SIMPLE',
    weightReferenceKg: createDecimalString(String(weightKg)),
    variations: [{ id: 'variation-simple', position: 0, kind: 'SIMPLE', name: 'Plano diário', inputMode: 'GRAMS', assignedDays: [], targets: emptyTargets(), meals: [] }],
  };
}

function editableFromPlan(plan: DietPlan): DietEditableDocument {
  return {
    name: plan.name,
    mode: plan.mode,
    ...(plan.weightReferenceKg ? { weightReferenceKg: plan.weightReferenceKg } : {}),
    variations: structuredClone(plan.variations),
  };
}

function contextFor(draft: DietDraft): DraftContext {
  return { accountId: draft.accountId, patientId: draft.patientId, routeDietId: draft.routeDietId };
}

export function createDietDraftCommands(dependencies: DietDraftCommandDependencies) {
  const now = dependencies.now ?? (() => new Date().toISOString());
  const idFactory = dependencies.idFactory ?? (() => nanoid(16));

  async function requirePatient(patientId: string): Promise<{ accountId: string; patient: Patient }> {
    const account = await dependencies.accountContext.requireActive();
    const patient = await dependencies.patientReader.getById(account.accountId, patientId);
    if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
    if (patient.archivedAt !== null) throw new DietDomainError('ARCHIVED_PATIENT', 'Paciente arquivado não pode iniciar ou salvar dieta.');
    return { accountId: account.accountId, patient };
  }

  async function openEditor(patientId: string, routeDietId: string): Promise<OpenEditorResult> {
    const { accountId, patient } = await requirePatient(patientId);
    const recovered = await dependencies.draftStore.getByContext(accountId, patientId, routeDietId);
    if (recovered) {
      if (recovered.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'O rascunho foi invalidado pelo arquivamento do paciente.');
      return { draft: recovered, isNew: false };
    }

    let payload: DietEditableDocument;
    let baseDietId: string | undefined;
    let baseDietVersion: number | undefined;
    if (routeDietId === 'nova') {
      payload = newDocument(patient.weightKg);
    } else {
      const plan = await dependencies.repository.getById(accountId, patientId, routeDietId);
      if (!plan) throw new DietDomainError('PATIENT_NOT_FOUND', 'A prescrição não foi encontrada nesta Conta/paciente.');
      if (plan.status !== 'ACTIVE') throw new DietDomainError('READ_ONLY_DIET', 'Prescrições históricas são somente leitura; crie uma cópia para editar.');
      payload = editableFromPlan(plan);
      baseDietId = plan.id;
      baseDietVersion = plan.version;
    }

    const draft: DietDraft = {
      draftId: idFactory(),
      contextKey: `${accountId}|${patientId}|${routeDietId}`,
      accountId,
      patientId,
      routeDietId,
      payloadSchemaVersion: 1,
      draftRevision: 1,
      state: 'EDITABLE',
      ...(baseDietId ? { baseDietId, baseDietVersion } : {}),
      payload,
      createdAt: now(),
      updatedAt: now(),
    };
    return { draft: await dependencies.draftStore.create(draft, contextFor(draft)), isNew: true };
  }

  async function getEditableDraft(draftId: string): Promise<DietDraft> {
    const draft = await dependencies.draftStore.get(draftId);
    if (!draft) throw new DietDomainError('PATIENT_NOT_FOUND', 'Rascunho não encontrado.');
    const { accountId } = await requirePatient(draft.patientId);
    if (draft.accountId !== accountId) throw new DietDomainError('CONTEXT_MISSING', 'O rascunho não pertence à Conta ativa.');
    if (draft.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'O rascunho foi invalidado pelo arquivamento do paciente.');
    return draft;
  }

  async function persistDraft(draftId: string, expectedRevision: number, document: DietEditableDocument): Promise<AutosaveResult> {
    const draft = await getEditableDraft(draftId);
    return dependencies.draftStore.putIfNewer({ ...draft, payload: structuredClone(document), draftRevision: expectedRevision + 1, updatedAt: now() }, expectedRevision);
  }

  async function flushDraft(draftId: string, document: DietEditableDocument, expectedRevision?: number): Promise<AutosaveResult> {
    const draft = await getEditableDraft(draftId);
    return dependencies.draftStore.putIfNewer({ ...draft, payload: structuredClone(document), draftRevision: (expectedRevision ?? draft.draftRevision) + 1, updatedAt: now() }, expectedRevision ?? draft.draftRevision);
  }

  return {
    openEditor,
    autosaveDraft: persistDraft,
    flushDraft,
  };
}

export const openEditor = (dependencies: DietDraftCommandDependencies, patientId: string, routeDietId: string): Promise<OpenEditorResult> => createDietDraftCommands(dependencies).openEditor(patientId, routeDietId);
