import type { ObjectiveOption } from '@/lib/domain/objective-option';

export interface ObjectiveCatalogRepository {
  list(accountId: string): Promise<ObjectiveOption[]>;
  addCustom(accountId: string, label: string): Promise<ObjectiveOption>;
  archiveCustom(accountId: string, objectiveId: string): Promise<void>;
}
