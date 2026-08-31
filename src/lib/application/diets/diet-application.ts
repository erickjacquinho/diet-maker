import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DietApplication, DietApplicationDependencies } from './diet-ports';
import { createDietDraftCommands } from './diet-draft-commands';
import { createDietCopyCommands } from './diet-copy-commands';
import { discardDietDraft } from './discard-diet-draft';
import { reconcileUnknownSave, saveDietAsActive } from './save-diet-as-active';

export function createDietApplication(dependencies: DietApplicationDependencies): DietApplication {
  const drafts = createDietDraftCommands(dependencies);
  const copies = createDietCopyCommands(dependencies);
  return {
    openEditor: drafts.openEditor,
    autosaveDraft: drafts.autosaveDraft,
    flushDraft: (draftId, document) => drafts.flushDraft(draftId, document),
    discardDraft: (draftId, expectedRevision) => discardDietDraft(dependencies, draftId, expectedRevision),
    listPreviousDietSources: copies.listPreviousDietSources,
    pullTargets: copies.pullTargets,
    pullCompleteDiet: copies.pullCompleteDiet,
    saveDietAsActive: (draftId, expectedRevision) => saveDietAsActive(dependencies, draftId, expectedRevision),
    reconcileUnknownSave: (draftId) => reconcileUnknownSave(dependencies, draftId),
    async getPatientDietSummary(patientId) {
      const account = await dependencies.accountContext.requireActive();
      const patient = await dependencies.patientReader.getById(account.accountId, patientId);
      if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
      const summary = await dependencies.dietReader.getPatientDietSummary(account.accountId, patientId);
      const recoverable = (await dependencies.draftStore.listRecoverableByPatient(account.accountId, patientId))[0] ?? null;
      return { ...summary, recoverableDraft: recoverable };
    },
    getDietSnapshot: async (patientId, dietId) => {
      const account = await dependencies.accountContext.requireActive();
      return dependencies.dietReader.getSnapshot(account.accountId, patientId, dietId);
    },
    invalidatePatientDrafts: async (patientId) => {
      const account = await dependencies.accountContext.requireActive();
      return dependencies.draftStore.invalidateByPatient(account.accountId, patientId);
    },
  };
}
