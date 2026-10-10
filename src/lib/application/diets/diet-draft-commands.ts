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

function newDocument(weightKg: number | null): DietEditableDocument {
  return {
    name: 'Prescrição Alimentar',
    mode: 'SIMPLE',
    ...(weightKg !== null ? { weightReferenceKg: createDecimalString(String(weightKg)) } : {}),
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
    const plan = routeDietId === 'nova' ? null : await dependencies.repository.getById(accountId, patientId, routeDietId);
    if (routeDietId !== 'nova' && !plan) throw new DietDomainError('PATIENT_NOT_FOUND', 'A prescrição não foi encontrada nesta Conta/paciente.');
    if (plan && plan.status !== 'ACTIVE') throw new DietDomainError('READ_ONLY_DIET', 'Prescrições históricas são somente leitura; crie uma cópia para editar.');

    if (recovered) {
      if (recovered.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'O rascunho foi invalidado pelo arquivamento do paciente.');
      if (plan && recovered.baseDietId === plan.id && recovered.baseDietVersion === plan.version && recovered.payload.mode === plan.mode && recovered.payload.variations.length === plan.variations.length) {
        const hasPrimaryItems = (variations: DietEditableDocument['variations']) => variations.some((variation) =>
          variation.meals.some((meal) => meal.options.some((option) => option.countsTowardTotals && option.items.some((item) => item.role === 'PRIMARY'))),
        );
        const hasDraftItems = hasPrimaryItems(recovered.payload.variations);
        const hasPlanItems = hasPrimaryItems(plan.variations);
        const sameVariations = recovered.payload.variations.every((variation) => plan.variations.some((saved) => saved.id === variation.id));

        if (!hasDraftItems && hasPlanItems && sameVariations) {
          const planVariations = new Map(plan.variations.map((variation) => [variation.id, variation]));
          const payload = {
            ...recovered.payload,
            variations: recovered.payload.variations.map((variation) => {
              const saved = planVariations.get(variation.id);
              return saved ? { ...variation, meals: structuredClone(saved.meals) } : variation;
            }),
          };
          const repairedDraft = { ...recovered, payload, draftRevision: recovered.draftRevision + 1, updatedAt: now() };
          const result = await dependencies.draftStore.putIfNewer(repairedDraft, recovered.draftRevision);
          if (result.status !== 'SAVED') throw new DietDomainError('VERSION_CONFLICT', 'O rascunho mudou durante a recuperação das refeições. Reabra a dieta.');
          return { draft: { ...repairedDraft, draftRevision: result.revision, updatedAt: result.updatedAt }, isNew: false };
        }
      }
      return { draft: recovered, isNew: false };
    }

    let payload: DietEditableDocument;
    let baseDietId: string | undefined;
    let baseDietVersion: number | undefined;
    if (routeDietId === 'nova') {
      payload = newDocument(patient.weightKg);
    } else {
      const activePlan = plan;
      if (!activePlan) throw new DietDomainError('PATIENT_NOT_FOUND', 'A prescrição não foi encontrada nesta Conta/paciente.');
      payload = editableFromPlan(activePlan);
      baseDietId = activePlan.id;
      baseDietVersion = activePlan.version;
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
