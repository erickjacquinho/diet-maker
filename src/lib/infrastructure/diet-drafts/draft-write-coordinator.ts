import type { AutosaveResult, DietDraft, DietEditableDocument } from '@/lib/domain/diets/diet-model';
import type { DietDraftStore } from '@/lib/application/diets/diet-ports';

export type DraftWriteStatus = 'pending' | 'saving' | 'persisted' | 'error';

export interface DraftWriteState {
  status: DraftWriteStatus;
  revision: number;
  error?: unknown;
}

export class DraftWriteCoordinator {
  private readonly tokens = new Map<string, number>();
  private readonly pending = new Map<string, Promise<AutosaveResult>>();
  private readonly invalidated = new Set<string>();

  constructor(private readonly store: DietDraftStore) {}

  async write(draft: DietDraft, document: DietEditableDocument, expectedRevision: number): Promise<AutosaveResult> {
    if (this.invalidated.has(draft.draftId)) return { status: 'INVALIDATED' };
    const token = (this.tokens.get(draft.draftId) ?? 0) + 1;
    this.tokens.set(draft.draftId, token);
    const nextDraft = { ...draft, payload: structuredClone(document), draftRevision: expectedRevision + 1 };
    const operation = this.store.putIfNewer(nextDraft, expectedRevision);
    this.pending.set(draft.draftId, operation);
    try {
      const result = await operation;
      if (this.tokens.get(draft.draftId) !== token) return { status: 'SUPERSEDED', currentRevision: result.status === 'SAVED' ? result.revision : result.status === 'SUPERSEDED' ? result.currentRevision : expectedRevision };
      return result;
    } finally {
      if (this.pending.get(draft.draftId) === operation) this.pending.delete(draft.draftId);
    }
  }

  async flush(draft: DietDraft, document: DietEditableDocument, expectedRevision: number): Promise<AutosaveResult> {
    const current = this.pending.get(draft.draftId);
    if (current) await current;
    const latest = await this.store.get(draft.draftId);
    if (!latest) return { status: 'SUPERSEDED', currentRevision: expectedRevision };
    return this.write(latest, document, latest.draftRevision);
  }

  invalidate(draftId: string): void {
    this.invalidated.add(draftId);
    this.tokens.set(draftId, (this.tokens.get(draftId) ?? 0) + 1);
  }
}
