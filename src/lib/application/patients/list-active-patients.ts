import type { AccountContext } from '@/lib/persistence/account-context';
import type { PatientListSummary, PatientProfileReader } from '@/lib/persistence/patient-profile-reader';

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
