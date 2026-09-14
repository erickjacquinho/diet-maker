import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { AutosaveResult, DietDraft } from '@/lib/domain/diets/diet-model';
import type { DietDraftStore, DraftContext } from '@/lib/application/diets/diet-ports';

function contextKey(context: DraftContext): string {
  return `${context.accountId}|${context.patientId}|${context.routeDietId}`;
}
function cloneDraft(draft: DietDraft): DietDraft {
  return structuredClone(draft);
}

/** A tab-scoped draft store. It deliberately has no host persistence boundary. */
export class InMemoryDietDraftStore implements DietDraftStore {
  private readonly drafts = new Map<string, DietDraft>();

  async create(document: DietDraft, context: DraftContext): Promise<DietDraft> {
    const key = contextKey(context);
    if ([...this.drafts.values()].some((draft) => draft.contextKey === key)) {
      throw new DietDomainError('VERSION_CONFLICT', 'Já existe um rascunho para este contexto.');
    }
    const draft = cloneDraft({
      ...document,
      accountId: context.accountId,
      patientId: context.patientId,
      routeDietId: context.routeDietId,
      contextKey: key,
      state: 'EDITABLE',
      updatedAt: document.updatedAt || new Date().toISOString(),
    });
    this.drafts.set(draft.draftId, draft);
    return cloneDraft(draft);
  }

  async getByContext(accountId: string, patientId: string, routeDietId: string): Promise<DietDraft | null> {
    const draft = [...this.drafts.values()].find((candidate) => candidate.contextKey === `${accountId}|${patientId}|${routeDietId}`);
    return draft ? cloneDraft(draft) : null;
  }

  async get(draftId: string): Promise<DietDraft | null> {
    const draft = this.drafts.get(draftId);
    return draft ? cloneDraft(draft) : null;
  }

  async putIfNewer(draft: DietDraft, expectedPreviousRevision: number): Promise<AutosaveResult> {
    const current = this.drafts.get(draft.draftId);
    if (!current) return { status: 'SUPERSEDED', currentRevision: 0 };
    if (current.state !== 'EDITABLE') return { status: 'INVALIDATED' };
    if (current.draftRevision !== expectedPreviousRevision || draft.draftRevision <= current.draftRevision) {
      return { status: 'SUPERSEDED', currentRevision: current.draftRevision };
    }
    const next = cloneDraft({ ...draft, contextKey: current.contextKey, draftRevision: current.draftRevision + 1, updatedAt: draft.updatedAt || new Date().toISOString() });
    this.drafts.set(next.draftId, next);
    return { status: 'SAVED', revision: next.draftRevision, updatedAt: next.updatedAt };
  }

  async reserveTargetId(draftId: string, expectedRevision: number, targetDietId: string): Promise<DietDraft | null> {
    const current = this.drafts.get(draftId);
    if (!current) return null;
    if (current.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'O rascunho foi invalidado pelo arquivamento do paciente.');
    if (current.draftRevision !== expectedRevision) throw new DietDomainError('VERSION_CONFLICT', 'O rascunho foi alterado antes da reserva da identidade.');
    if (current.targetDietId && current.targetDietId !== targetDietId) throw new DietDomainError('VERSION_CONFLICT', 'A identidade da dieta já foi reservada para este rascunho.');
    const next = cloneDraft({ ...current, targetDietId });
    this.drafts.set(next.draftId, next);
    return next;
  }

  async removeIfRevision(draftId: string, expectedRevision: number): Promise<boolean> {
    const current = this.drafts.get(draftId);
    if (!current || current.draftRevision !== expectedRevision) return false;
    this.drafts.delete(draftId);
    return true;
  }

  async invalidateByPatient(accountId: string, patientId: string): Promise<number> {
    let count = 0;
    for (const [draftId, draft] of this.drafts) {
      if (draft.accountId === accountId && draft.patientId === patientId && draft.state === 'EDITABLE') {
        this.drafts.set(draftId, cloneDraft({ ...draft, state: 'INVALIDATED_BY_PATIENT_ARCHIVE' }));
        count += 1;
      }
    }
    return count;
  }

  async listRecoverableByPatient(accountId: string, patientId: string): Promise<DietDraft[]> {
    return [...this.drafts.values()]
      .filter((draft) => draft.accountId === accountId && draft.patientId === patientId && draft.state === 'EDITABLE')
      .map(cloneDraft);
  }

  async listRecoverableByAccount(accountId: string): Promise<DietDraft[]> {
    return [...this.drafts.values()]
      .filter((draft) => draft.accountId === accountId && draft.state === 'EDITABLE')
      .map(cloneDraft);
  }
}
