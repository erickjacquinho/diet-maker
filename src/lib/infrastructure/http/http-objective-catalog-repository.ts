import type { ObjectiveDto } from '@/lib/contracts/objectives';
import { objectivesApi } from '@/lib/api-client/objectives';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import type { ObjectiveOption } from '@/lib/domain/objective-option';
import type { ObjectiveCatalogRepository } from '@/lib/persistence/objective-catalog-repository';
import { isApiStatus } from './errors';

const toObjective = (dto: ObjectiveDto, accountId: string): ObjectiveOption => ({ ...dto, accountId });

export class HttpObjectiveCatalogRepository implements ObjectiveCatalogRepository {
  async list(accountId: string): Promise<ObjectiveOption[]> {
    try {
      return (await objectivesApi.list()).items.map((dto) => toObjective(dto, accountId));
    } catch (cause) {
      throw new PatientApplicationError('PERSISTENCE_FAILURE', 'Os objetivos não puderam ser carregados.', { cause });
    }
  }

  async addCustom(accountId: string, label: string): Promise<ObjectiveOption> {
    try {
      return toObjective(await objectivesApi.add(label), accountId);
    } catch (cause) {
      if (isApiStatus(cause, 422)) {
        throw new PatientApplicationError('INVALID_FIELD', 'Informe um objetivo válido.', { fieldErrors: { objective: 'Informe um objetivo válido.' }, cause });
      }
      throw new PatientApplicationError('PERSISTENCE_FAILURE', 'O objetivo não pôde ser salvo.', { cause });
    }
  }

  async archiveCustom(_accountId: string, objectiveId: string): Promise<void> {
    try {
      await objectivesApi.archive(objectiveId);
    } catch (cause) {
      if (isApiStatus(cause, 404)) throw new PatientApplicationError('NOT_FOUND', 'Objetivo não encontrado nesta Conta.', { cause });
      if (isApiStatus(cause, 422)) throw new PatientApplicationError('SCOPE_VIOLATION', 'Objetivos padrão não podem ser removidos.', { cause });
      throw new PatientApplicationError('PERSISTENCE_FAILURE', 'O objetivo não pôde ser removido.', { cause });
    }
  }
}
