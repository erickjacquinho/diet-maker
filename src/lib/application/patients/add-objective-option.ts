import { normalizeObjectiveLabel, type ObjectiveOption } from '@/lib/domain/objective-option';
import type { AccountContext } from '@/lib/persistence/account-context';
import type { ObjectiveCatalogRepository } from '@/lib/persistence/objective-catalog-repository';
import { PatientApplicationError } from './patient-errors';

export async function addObjectiveOption(
  dependencies: { accountContext: AccountContext; objectiveCatalogRepository: ObjectiveCatalogRepository },
  label: string,
): Promise<ObjectiveOption> {
  const normalized = normalizeObjectiveLabel(label);
  if (!normalized.label) throw new PatientApplicationError('INVALID_FIELD', 'Informe um objetivo.', { fieldErrors: { objective: 'Informe um objetivo.' } });
  const account = await dependencies.accountContext.requireActive();
  return dependencies.objectiveCatalogRepository.addCustom(account.accountId, normalized.label);
}
