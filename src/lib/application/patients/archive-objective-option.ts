import type { AccountContext } from '@/lib/persistence/account-context';
import type { ObjectiveCatalogRepository } from '@/lib/persistence/objective-catalog-repository';

export async function archiveObjectiveOption(
  dependencies: { accountContext: AccountContext; objectiveCatalogRepository: ObjectiveCatalogRepository },
  objectiveId: string,
): Promise<void> {
  const account = await dependencies.accountContext.requireActive();
  await dependencies.objectiveCatalogRepository.archiveCustom(account.accountId, objectiveId);
}
