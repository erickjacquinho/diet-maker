import type { PatientDto } from '@/lib/contracts/patients';
import { patientsApi } from '@/lib/api-client/patients';
import type { Patient, PatientInput } from '@/lib/domain/patient';
import type { PageResult } from '@/lib/persistence/page';
import type { PatientPageQuery, PatientRepository } from '@/lib/persistence/patient-repository';
import { isApiStatus, toPatientError } from './errors';

const PAGE_SIZE = 25;

export function toPatient(dto: PatientDto, accountId: string): Patient {
  return { ...dto, accountId } as Patient;
}

/**
 * Browser-side {@link PatientRepository} over `/api/v1/patients`. The account comes from the session on the
 * server, so `accountId` only labels the domain objects. IDs are generated here (UUID) so a retried create is idempotent.
 */
export class HttpPatientRepository implements PatientRepository {
  constructor(private readonly idFactory: () => string = () => crypto.randomUUID()) {}

  async create(accountId: string, input: PatientInput): Promise<Patient> {
    try {
      return toPatient(await patientsApi.create(this.idFactory(), input), accountId);
    } catch (error) {
      throw toPatientError(error, 'create');
    }
  }

  async getById(accountId: string, patientId: string): Promise<Patient | null> {
    try {
      return toPatient(await patientsApi.get(patientId), accountId);
    } catch (error) {
      if (isApiStatus(error, 404)) return null;
      throw toPatientError(error, 'read');
    }
  }

  async listActive(accountId: string): Promise<Patient[]> {
    const items: Patient[] = [];
    for (let pageIndex = 0; ; pageIndex += 1) {
      const page = await this.listActivePage(accountId, { query: '', today: '', pageIndex, pageSize: PAGE_SIZE });
      items.push(...page.items);
      if (items.length >= page.total || page.items.length === 0) return items;
    }
  }

  async listActivePage(accountId: string, query: PatientPageQuery): Promise<PageResult<Patient>> {
    try {
      const page = await patientsApi.search(query.query ?? '', query.pageIndex ?? 0, Math.min(query.pageSize ?? PAGE_SIZE, PAGE_SIZE));
      return { ...page, items: page.items.map((dto) => toPatient(dto, accountId)) };
    } catch (error) {
      throw toPatientError(error, 'read');
    }
  }

  async update(accountId: string, patientId: string, expectedVersion: number, input: PatientInput): Promise<Patient> {
    try {
      return toPatient(await patientsApi.update(patientId, expectedVersion, input), accountId);
    } catch (error) {
      throw toPatientError(error, 'update');
    }
  }

  async archive(accountId: string, patientId: string, expectedVersion: number): Promise<Patient> {
    try {
      return toPatient(await patientsApi.archive(patientId, expectedVersion), accountId);
    } catch (error) {
      throw toPatientError(error, 'archive');
    }
  }

  async restore(accountId: string, patientId: string, expectedVersion: number): Promise<Patient> {
    try {
      return toPatient(await patientsApi.restore(patientId, expectedVersion), accountId);
    } catch (error) {
      throw toPatientError(error, 'restore');
    }
  }
}
