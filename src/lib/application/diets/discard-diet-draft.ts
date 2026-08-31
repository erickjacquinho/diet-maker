import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DiscardResult } from '@/lib/domain/diets/diet-model';
import type { DietApplicationDependencies } from './diet-ports';

export async function discardDietDraft(dependencies: DietApplicationDependencies, draftId: string, expectedRevision: number): Promise<DiscardResult> {
  const account = await dependencies.accountContext.requireActive();
  const draft = await dependencies.draftStore.get(draftId);
  if (!draft) return 'ALREADY_REMOVED';
  if (draft.accountId !== account.accountId) throw new DietDomainError('CONTEXT_MISSING', 'Rascunho não pertence à Conta ativa.');
  const patient = await dependencies.patientReader.getById(account.accountId, draft.patientId);
  if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
  if (draft.draftRevision !== expectedRevision) return 'SUPERSEDED_REVISION';
  const removed = await dependencies.draftStore.removeIfRevision(draftId, expectedRevision);
  return removed ? 'REMOVED' : 'SUPERSEDED_REVISION';
}
