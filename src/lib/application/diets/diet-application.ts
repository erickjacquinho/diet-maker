import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { DietApplication, DietApplicationDependencies } from './diet-ports';
import { createDietDraftCommands } from './diet-draft-commands';
import { createDietCopyCommands } from './diet-copy-commands';
import { discardDietDraft } from './discard-diet-draft';
import { reconcileUnknownSave, saveDietAsActive } from './save-diet-as-active';
import { insertReadyMealIntoDietDraft, insertRecipeIntoDietDraft } from './library-insertion';
import { toDietHistoryViews } from './diet-history-view';
import { normalizePageRequest, type PageRequest, type PageResult } from '@/lib/persistence/page';
import type { HistoricalDiet } from '@/lib/patientsStoreTypes';

export function createDietApplication(dependencies: DietApplicationDependencies): DietApplication {
  const drafts = createDietDraftCommands(dependencies);
  const copies = createDietCopyCommands(dependencies);
  const runConfirmed = <T>(operation: () => Promise<T>): Promise<T> => (
    dependencies.confirmedOperation ? dependencies.confirmedOperation.run(operation) : operation()
  );
  return {
    openEditor: drafts.openEditor,
    autosaveDraft: drafts.autosaveDraft,
    flushDraft: (draftId, document) => drafts.flushDraft(draftId, document),
    discardDraft: (draftId, expectedRevision) => discardDietDraft(dependencies, draftId, expectedRevision),
    listPreviousDietSources: copies.listPreviousDietSources,
    pullTargets: copies.pullTargets,
    pullCompleteDiet: copies.pullCompleteDiet,
    saveDietAsActive: (draftId, expectedRevision) => runConfirmed(() => saveDietAsActive(dependencies, draftId, expectedRevision)),
    reconcileUnknownSave: (draftId) => reconcileUnknownSave(dependencies, draftId),
    async getPatientDietSummary(patientId) {
      const account = await dependencies.accountContext.requireActive();
      const patient = await dependencies.patientReader.getById(account.accountId, patientId);
      if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
      const summary = await dependencies.dietReader.getPatientDietSummary(account.accountId, patientId);
      const recoverable = (await dependencies.draftStore.listRecoverableByPatient(account.accountId, patientId))[0] ?? null;
      return { ...summary, recoverableDraft: recoverable };
    },
    async listDietHistoryViews(patientId) {
      const account = await dependencies.accountContext.requireActive();
      const patient = await dependencies.patientReader.getById(account.accountId, patientId);
      if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
      if (dependencies.historyViewReader) return dependencies.historyViewReader.listHistoryViews(account.accountId, patientId);
      return toDietHistoryViews(await dependencies.dietReader.getPatientDietSummary(account.accountId, patientId));
    },
    async listDietHistoryViewsPage(patientId: string, request: PageRequest = {}): Promise<PageResult<HistoricalDiet>> {
      const account = await dependencies.accountContext.requireActive();
      const patient = await dependencies.patientReader.getById(account.accountId, patientId);
      if (!patient) throw new DietDomainError('PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
      if (dependencies.historyViewReader) return dependencies.historyViewReader.listHistoryViewsPage(account.accountId, patientId, request);
      const page = normalizePageRequest(request);
      const all = toDietHistoryViews(await dependencies.dietReader.getPatientDietSummary(account.accountId, patientId));
      return { ...page, total: all.length, items: all.slice(page.pageIndex * page.pageSize, (page.pageIndex + 1) * page.pageSize) };
    },
    getDietSnapshot: async (patientId, dietId) => {
      const account = await dependencies.accountContext.requireActive();
      return dependencies.dietReader.getSnapshot(account.accountId, patientId, dietId);
    },
    invalidatePatientDrafts: async (patientId) => {
      const account = await dependencies.accountContext.requireActive();
      return dependencies.draftStore.invalidateByPatient(account.accountId, patientId);
    },
    insertRecipeIntoDietDraft: async (command) => {
      if (!dependencies.librarySourceReader) throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'A biblioteca não está disponível neste runtime.');
      return insertRecipeIntoDietDraft({ accountContext: dependencies.accountContext, draftStore: dependencies.draftStore, sourceReader: dependencies.librarySourceReader, idFactory: dependencies.idFactory, now: dependencies.now }, command);
    },
    insertReadyMealIntoDietDraft: async (command) => {
      if (!dependencies.librarySourceReader) throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'A biblioteca não está disponível neste runtime.');
      return insertReadyMealIntoDietDraft({ accountContext: dependencies.accountContext, draftStore: dependencies.draftStore, sourceReader: dependencies.librarySourceReader, idFactory: dependencies.idFactory, now: dependencies.now }, command);
    },
  };
}
