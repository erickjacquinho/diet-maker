import type { AccountContext } from '@/lib/persistence/account-context';
import type { PatientListSummary, PatientProfileReader } from '@/lib/persistence/patient-profile-reader';
import { getTodayDateKey } from '@/lib/patientListDateUtils';
import { normalizePageRequest, type PageRequest, type PageResult } from '@/lib/persistence/page';

export interface PatientListPageRequest extends PageRequest {
  query?: string;
}

export async function listActivePatients(
  dependencies: { accountContext: AccountContext; patientProfileReader: PatientProfileReader },
  query = '',
): Promise<PatientListSummary[]> {
  const account = await dependencies.accountContext.requireActive();
  const summaries = await dependencies.patientProfileReader.listActiveSummaries(account.accountId);
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  if (!normalizedQuery) return summaries;
  return summaries.filter(({ patient }) => [patient.name, patient.currentObjective ?? ''].some((value) => value.toLocaleLowerCase('pt-BR').includes(normalizedQuery)));
}

export async function listActivePatientsPage(
  dependencies: { accountContext: AccountContext; patientProfileReader: PatientProfileReader },
  request: PatientListPageRequest = {},
): Promise<PageResult<PatientListSummary>> {
  const account = await dependencies.accountContext.requireActive();
  const page = normalizePageRequest(request);
  return dependencies.patientProfileReader.listActiveSummaryPage(account.accountId, {
    ...page,
    query: request.query?.trim().toLocaleLowerCase('pt-BR') ?? '',
    today: getTodayDateKey(),
  });
}
