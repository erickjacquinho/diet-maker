import { nanoid } from 'nanoid';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DietDraft, DietEditableDocument, DietItem, DietPlan } from '@/lib/domain/diets/diet-model';
import type { DietApplicationDependencies, PreviousDietSource } from './diet-ports';

export function createDietCopyCommands(dependencies: DietApplicationDependencies) {
  const now = dependencies.now ?? (() => new Date().toISOString());
  const makeId = dependencies.idFactory ?? (() => nanoid(12));

  async function draftFor(draftId: string): Promise<DietDraft> {
    const account = await dependencies.accountContext.requireActive();
    const draft = await dependencies.draftStore.get(draftId);
    if (!draft || draft.accountId !== account.accountId) throw new DietDomainError('CONTEXT_MISSING', 'Rascunho não pertence à Conta ativa.');
    const patient = await dependencies.patientReader.getById(account.accountId, draft.patientId);
    if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
    if (patient.archivedAt !== null) throw new DietDomainError('ARCHIVED_PATIENT', 'Paciente arquivado não pode receber cópia.');
    if (draft.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'Rascunho invalidado.');
    return draft;
  }

  async function sourceFor(patientId: string, sourceDietId: string): Promise<PreviousDietSource> {
    const sources = await listPreviousDietSources(patientId);
    const source = sources.find((candidate) => candidate.plan.id === sourceDietId);
    if (!source) throw new DietDomainError('CONTEXT_MISSING', 'A prescrição de origem não está disponível neste contexto.');
    return source;
  }

  async function persist(draft: DietDraft, payload: DietEditableDocument): Promise<DietDraft> {
    const next = { ...draft, payload: structuredClone(payload), draftRevision: draft.draftRevision + 1, updatedAt: now() };
    const saved = await dependencies.draftStore.putIfNewer(next, draft.draftRevision);
    if (saved.status !== 'SAVED') throw new DietDomainError(saved.status === 'INVALIDATED' ? 'ARCHIVED_PATIENT' : 'VERSION_CONFLICT', 'O rascunho mudou antes da cópia.');
    const result = await dependencies.draftStore.get(draft.draftId);
    if (!result) throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'A cópia não pôde ser reaberta após persistência.');
    return result;
  }

  function copiedDocument(source: DietPlan): DietEditableDocument {
    const variationIds = new Map<string, string>();
    const mealIds = new Map<string, string>();
    const optionIds = new Map<string, string>();
    const itemIds = new Map<string, string>();
    const variations = source.variations.map((variation) => {
      variationIds.set(variation.id, makeId());
      return { ...variation, id: variationIds.get(variation.id)!, meals: variation.meals.map((meal) => {
        mealIds.set(meal.id, makeId());
        return { ...meal, id: mealIds.get(meal.id)!, options: meal.options.map((option) => {
          optionIds.set(option.id, makeId());
          return { ...option, id: optionIds.get(option.id)!, items: option.items.map((item) => {
            itemIds.set(item.id, makeId());
            return { ...item, id: itemIds.get(item.id)!, parentItemId: item.parentItemId ? (itemIds.get(item.parentItemId) ?? makeId()) : undefined };
          }) };
        }) };
      }) };
    });
    return { name: source.name, mode: source.mode, ...(source.weightReferenceKg ? { weightReferenceKg: source.weightReferenceKg } : {}), variations: variations.map((variation) => ({ ...variation, meals: variation.meals.map((meal) => ({ ...meal, options: meal.options.map((option) => ({ ...option, items: option.items.map((item: DietItem) => ({ ...item, parentItemId: item.parentItemId ? itemIds.get(item.parentItemId) : undefined })) })) })) })) };
  }

  async function listPreviousDietSources(patientId: string): Promise<PreviousDietSource[]> {
    const account = await dependencies.accountContext.requireActive();
    const patient = await dependencies.patientReader.getById(account.accountId, patientId);
    if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
    if (patient.archivedAt !== null) throw new DietDomainError('ARCHIVED_PATIENT', 'Paciente arquivado não pode consultar fontes.');
    return dependencies.dietReader.listPreviousSources(account.accountId, patientId);
  }

  return {
    listPreviousDietSources,
    async pullTargets(draftId: string, sourceDietId: string, sourceVariationId: string, targetVariationId: string) {
      const draft = await draftFor(draftId);
      const source = await sourceFor(draft.patientId, sourceDietId);
      const sourceVariation = source.plan.variations.find((variation) => variation.id === sourceVariationId);
      const target = draft.payload.variations.find((variation) => variation.id === targetVariationId);
      if (!sourceVariation || !target) throw new DietDomainError('INVALID_DIET', 'Variação de origem ou destino não encontrada.');
      return persist(draft, { ...draft.payload, variations: draft.payload.variations.map((variation) => variation.id === targetVariationId ? { ...variation, targets: structuredClone(sourceVariation.targets) } : variation) });
    },
    async pullCompleteDiet(draftId: string, sourceDietId: string) {
      const draft = await draftFor(draftId);
      const source = await sourceFor(draft.patientId, sourceDietId);
      return persist(draft, copiedDocument(source.plan));
    },
  };
}
