import { dietsApi } from '@/lib/api-client/diets';
import type { DietDraftDto } from '@/lib/contracts/diets';
import type { DietDraftStore, DraftContext } from '@/lib/application/diets/diet-ports';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { AutosaveResult, DietDraft } from '@/lib/domain/diets/diet-model';
import { isApiStatus } from './errors';
import { toDietError } from './http-diet-repository';

interface Location {
  accountId: string;
  patientId: string;
  routeDietId: string;
}

/**
 * Browser-side {@link DietDraftStore} over `/api/v1/patients/:id/diet-drafts/:route`. The server keys drafts by
 * patient and route, while the application also addresses them by `draftId`, so this store remembers where every
 * draft it has seen lives. A `draftId` it has never seen (for example from another tab) reads as absent.
 */
export class HttpDietDraftStore implements DietDraftStore {
  private readonly locations = new Map<string, Location>();

  private remember(dto: DietDraftDto, accountId: string): DietDraft {
    this.locations.set(dto.draftId, { accountId, patientId: dto.patientId, routeDietId: dto.routeDietId });
    return { ...dto, accountId, contextKey: `${accountId}|${dto.patientId}|${dto.routeDietId}` };
  }

  private async fetch(location: Location): Promise<DietDraft | null> {
    try {
      const { draft } = await dietsApi.getDraft(location.patientId, location.routeDietId);
      return draft ? this.remember(draft, location.accountId) : null;
    } catch (error) {
      if (isApiStatus(error, 404)) return null;
      throw toDietError(error, 'O rascunho não pôde ser lido.');
    }
  }

  private async put(location: Location, draft: DietDraft, revision: number): Promise<AutosaveResult> {
    try {
      const result = await dietsApi.putDraft(location.patientId, location.routeDietId, {
        draftId: draft.draftId, draftRevision: revision, payloadSchemaVersion: draft.payloadSchemaVersion,
        ...(draft.baseDietId ? { baseDietId: draft.baseDietId, baseDietVersion: draft.baseDietVersion } : {}),
        ...(draft.targetDietId ? { targetDietId: draft.targetDietId } : {}),
        payload: draft.payload,
      } as Parameters<typeof dietsApi.putDraft>[2]);
      return result;
    } catch (error) {
      throw toDietError(error, 'O rascunho não pôde ser salvo.');
    }
  }

  async create(document: DietDraft, context: DraftContext): Promise<DietDraft> {
    const location: Location = { accountId: context.accountId, patientId: context.patientId, routeDietId: context.routeDietId };
    if (await this.fetch(location)) throw new DietDomainError('VERSION_CONFLICT', 'Já existe um rascunho para este contexto.');
    const result = await this.put(location, document, document.draftRevision);
    if (result.status !== 'SAVED') throw new DietDomainError('VERSION_CONFLICT', 'O rascunho não pôde ser criado.');
    this.locations.set(document.draftId, location);
    return (await this.fetch(location)) ?? { ...document, ...location, contextKey: `${location.accountId}|${location.patientId}|${location.routeDietId}`, state: 'EDITABLE' };
  }

  getByContext(accountId: string, patientId: string, routeDietId: string): Promise<DietDraft | null> {
    return this.fetch({ accountId, patientId, routeDietId });
  }

  async get(draftId: string): Promise<DietDraft | null> {
    const location = this.locations.get(draftId);
    if (!location) return null;
    const draft = await this.fetch(location);
    return draft && draft.draftId === draftId ? draft : null;
  }

  async putIfNewer(draft: DietDraft, expectedPreviousRevision: number): Promise<AutosaveResult> {
    const location = this.locations.get(draft.draftId);
    if (!location) return { status: 'SUPERSEDED', currentRevision: 0 };
    // Same contract as the local store: the saved revision is always the previous one plus one.
    return this.put(location, draft, expectedPreviousRevision + 1);
  }

  async reserveTargetId(draftId: string, expectedRevision: number, targetDietId: string): Promise<DietDraft | null> {
    const current = await this.get(draftId);
    if (!current) return null;
    if (current.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'O rascunho foi invalidado pelo arquivamento do paciente.');
    if (current.draftRevision !== expectedRevision) throw new DietDomainError('VERSION_CONFLICT', 'O rascunho foi alterado antes da reserva da identidade.');
    if (current.targetDietId && current.targetDietId !== targetDietId) throw new DietDomainError('VERSION_CONFLICT', 'A identidade da dieta já foi reservada para este rascunho.');
    const location = this.locations.get(draftId)!;
    const result = await this.put(location, { ...current, targetDietId }, current.draftRevision);
    if (result.status !== 'SAVED') throw new DietDomainError('VERSION_CONFLICT', 'O rascunho foi alterado antes da reserva da identidade.');
    return { ...current, targetDietId };
  }

  async removeIfRevision(draftId: string, expectedRevision: number): Promise<boolean> {
    const current = await this.get(draftId);
    const location = this.locations.get(draftId);
    if (!current || !location || current.draftRevision !== expectedRevision) return false;
    try {
      await dietsApi.discardDraft(location.patientId, location.routeDietId);
    } catch (error) {
      throw toDietError(error, 'O rascunho não pôde ser descartado.');
    }
    this.locations.delete(draftId);
    return true;
  }

  /** The server invalidates a patient's open drafts in the same transaction that archives the patient. */
  async invalidateByPatient(): Promise<number> {
    return 0;
  }

  async listRecoverableByPatient(accountId: string, patientId: string): Promise<DietDraft[]> {
    try {
      return (await dietsApi.listPatientDrafts(patientId)).drafts.map((dto) => this.remember(dto, accountId));
    } catch (error) {
      throw toDietError(error, 'Os rascunhos não puderam ser lidos.');
    }
  }

  async listRecoverableByAccount(accountId: string): Promise<DietDraft[]> {
    try {
      return (await dietsApi.listAccountDrafts()).drafts.map((dto) => this.remember(dto, accountId));
    } catch (error) {
      throw toDietError(error, 'Os rascunhos não puderam ser lidos.');
    }
  }
}
