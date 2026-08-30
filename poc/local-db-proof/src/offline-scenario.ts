import { PocError, type DietMealItem } from './contracts';
import { closeDatabase, openDatabase, type DatabaseHandle } from './db/client';
import { createDatabaseRepository, type DatabaseRepository } from './db/repositories';
import { createPortableSample, importSample, serializeSample } from './portability/sample-transfer';
import { SingleTabLock } from './locking/single-tab-lock';

let resourcesPrepared = false;

export interface OfflineScenarioResult {
  nextHandle: DatabaseHandle;
  nextRepository: DatabaseRepository;
  dietCount: number;
  roundTripPreserved: boolean;
}

export function prepareOfflineResources(): void {
  resourcesPrepared = true;
}

export function areOfflineResourcesPrepared(): boolean {
  return resourcesPrepared;
}

export async function runOfflineScenario(
  handle: DatabaseHandle,
  repository: DatabaseRepository,
): Promise<OfflineScenarioResult> {
  if (!resourcesPrepared) {
    throw new PocError(
      'OFFLINE_RESOURCE_NOT_READY',
      'offline-scenario',
      'Os recursos da PoC ainda não foram preparados; offline não foi declarado.',
    );
  }

  const offlinePlan = {
    id: 'diet-offline-proof',
    accountId: 'account-alpha',
    patientId: 'patient-ana',
    status: 'ACTIVE' as const,
    version: 99,
    createdAt: '2026-08-30T09:30:00.000Z',
    updatedAt: '2026-08-30T09:30:00.000Z',
  };
  const offlineItem: DietMealItem = {
    id: 'item-offline-oats',
    mealId: 'meal-offline-breakfast',
    sourceKind: 'TACO',
    sourceId: 'taco-oats',
    quantityG: 50,
    energyKcal: 194,
    proteinG: 8.4,
    carbsG: 32.9,
    fatG: 3.5,
  };
  await repository.saveDiet({
    plan: offlinePlan,
    meals: [{
      id: 'meal-offline-breakfast',
      dietPlanId: offlinePlan.id,
      position: 0,
      name: 'Café da manhã offline',
      items: [offlineItem],
    }],
  });

  const saved = await repository.readConfirmed('account-alpha');
  const serialized = serializeSample(createPortableSample(saved, 'account-alpha'));
  await importSample(repository, serialized);
  const beforeReopen = await repository.readConfirmed('account-alpha');
  const dataDir = handle.client.dataDir;
  if (!dataDir) {
    throw new PocError('PERSISTENCE_UNCONFIRMED', 'offline-reopen', 'A base offline não expõe um diretório persistente.');
  }

  await closeDatabase(handle);
  const nextHandle = await openDatabase({
    mode: 'browser-persistent',
    dataDir,
    lock: new SingleTabLock(),
  });
  const nextRepository = createDatabaseRepository(nextHandle);
  const afterReopen = await nextRepository.readConfirmed('account-alpha');

  return {
    nextHandle,
    nextRepository,
    dietCount: afterReopen.dietPlans.length,
    roundTripPreserved: afterReopen.dietMealItems.some((item) => item.id === offlineItem.id)
      && afterReopen.dietPlans.length === beforeReopen.dietPlans.length,
  };
}
