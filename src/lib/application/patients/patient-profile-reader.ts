import { getPatientInitials } from '@/lib/domain/patient';
import type { ObjectiveCatalogRepository } from '@/lib/persistence/objective-catalog-repository';
import type {
  PatientProfile,
  PatientProfileReader as PatientProfileReaderPort,
  PatientListSummary,
} from '@/lib/persistence/patient-profile-reader';
import type { PatientRepository } from '@/lib/persistence/patient-repository';

export function createPatientProfileReader(
  patientRepository: PatientRepository,
  objectiveCatalogRepository: ObjectiveCatalogRepository,
  relatedCounts: (accountId: string, patientId: string) => Promise<{ dietCount: number; assessmentCount: number }> = async () => ({ dietCount: 0, assessmentCount: 0 }),
): PatientProfileReaderPort {
  const toSummary = async (accountId: string, patient: NonNullable<Awaited<ReturnType<PatientRepository['getById']>>>): Promise<PatientListSummary> => ({
    patient,
    initials: getPatientInitials(patient.name),
    related: await relatedCounts(accountId, patient.id),
  });

  return {
    getProfile: async (accountId, patientId): Promise<PatientProfile | null> => {
      const patient = await patientRepository.getById(accountId, patientId);
      if (!patient) return null;
      const [objectives, related] = await Promise.all([
        objectiveCatalogRepository.list(accountId),
        relatedCounts(accountId, patient.id),
      ]);
      return {
        patient,
        initials: getPatientInitials(patient.name),
        availableObjectives: objectives.filter((objective) => objective.archivedAt === null).map((objective) => objective.label),
        related,
      };
    },
    listActiveSummaries: async (accountId) => {
      const patients = await patientRepository.listActive(accountId);
      return Promise.all(patients.map((patient) => toSummary(accountId, patient)));
    },
  };
}
