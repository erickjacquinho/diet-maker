import { getPatientInitials, type Patient } from '@/lib/domain/patient';
import type { ObjectiveCatalogRepository } from '@/lib/persistence/objective-catalog-repository';
import type {
  PatientProfile,
  PatientProfileReader as PatientProfileReaderPort,
  PatientListSummary,
} from '@/lib/persistence/patient-profile-reader';
import type { PatientRepository } from '@/lib/persistence/patient-repository';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import { latestAssessments } from '@/lib/domain/clinical';
import type { PatientActivity, PatientClinicalProfile, PatientClinicalSummary } from '@/lib/persistence/patient-profile-reader';

interface RelatedCounts {
  dietCount: number;
  assessmentCount: number;
  lastActivity?: PatientActivity | null;
}

interface ClinicalReaderOptions {
  clinicalRepository?: ClinicalRepository;
  listRelatedCounts?: (accountId: string, patientIds: readonly string[]) => Promise<Record<string, RelatedCounts>>;
}

function buildClinicalSummary(
  assessments: readonly import('@/lib/domain/clinical').BodyAssessment[],
  nextFollowUp: import('@/lib/domain/clinical').NextFollowUp | null,
  related: RelatedCounts,
  assessmentCount = assessments.length,
): PatientClinicalSummary {
  const { latestAssessment, previousAssessment } = latestAssessments(assessments);
  const assessmentActivity = latestAssessment
    ? { eventDate: latestAssessment.clinicalDate, confirmedAt: latestAssessment.updatedAt, type: 'assessment' as const, sourceId: latestAssessment.id }
    : null;
  const lastActivity = [assessmentActivity, related.lastActivity ?? null]
    .filter((activity): activity is PatientActivity => activity !== null)
    .sort((left, right) => right.eventDate.localeCompare(left.eventDate) || right.confirmedAt.localeCompare(left.confirmedAt) || left.type.localeCompare(right.type) || left.sourceId.localeCompare(right.sourceId))[0] ?? null;
  return {
    assessmentCount: Math.max(assessmentCount, related.assessmentCount),
    latestAssessment,
    previousAssessment,
    nextFollowUp,
    lastActivity,
    hasDiet: related.dietCount > 0,
    dietCount: related.dietCount,
  };
}

async function readClinicalProfile(
  accountId: string,
  patientId: string,
  related: RelatedCounts,
  clinicalRepository?: ClinicalRepository,
): Promise<PatientClinicalProfile | undefined> {
  if (!clinicalRepository) return undefined;
  const assessmentSummary = clinicalRepository.listAssessmentSummaries
    ? clinicalRepository.listAssessmentSummaries(accountId, [patientId]).then((summaries) => summaries[patientId] ?? { assessments: [], count: 0 })
    : clinicalRepository.listAssessments(accountId, patientId).then((assessments) => ({ assessments, count: assessments.length }));
  const [summary, nextFollowUp] = await Promise.all([
    assessmentSummary,
    clinicalRepository.getNextFollowUp(accountId, patientId),
  ]);
  return { assessments: summary.assessments, ...buildClinicalSummary(summary.assessments, nextFollowUp, related, summary.count) };
}

export function createPatientProfileReader(
  patientRepository: PatientRepository,
  objectiveCatalogRepository: ObjectiveCatalogRepository,
  relatedCounts: (accountId: string, patientId: string) => Promise<RelatedCounts> = async () => ({ dietCount: 0, assessmentCount: 0 }),
  options: ClinicalReaderOptions = {},
): PatientProfileReaderPort {
  const toSummary = async (
    accountId: string,
    patient: NonNullable<Awaited<ReturnType<PatientRepository['getById']>>>,
    clinical?: PatientClinicalSummary,
    relatedOverride?: RelatedCounts,
  ): Promise<PatientListSummary> => {
    const related = relatedOverride ?? await relatedCounts(accountId, patient.id);
    return {
      patient,
      initials: getPatientInitials(patient.name),
      related: { dietCount: related.dietCount, assessmentCount: clinical?.assessmentCount ?? related.assessmentCount },
      clinical,
    };
  };

  const readSummaries = async (
    accountId: string,
    patients: Patient[],
  ): Promise<PatientListSummary[]> => {
    if (!options.clinicalRepository) return Promise.all(patients.map((patient) => toSummary(accountId, patient)));
    const patientIds = patients.map((patient) => patient.id);
    if (options.listRelatedCounts && options.clinicalRepository.listAssessmentSummaries) {
      const [assessmentMap, followUpMap, relatedMap] = await Promise.all([
        options.clinicalRepository.listAssessmentSummaries(accountId, patientIds),
        options.clinicalRepository.listNextFollowUps(accountId, patientIds),
        options.listRelatedCounts(accountId, patientIds),
      ]);
      return Promise.all(patients.map((patient) => {
        const assessment = assessmentMap[patient.id];
        const related = { ...relatedMap[patient.id], assessmentCount: assessment.count };
        const clinical = buildClinicalSummary(assessment.assessments, followUpMap[patient.id] ?? null, related);
        return toSummary(accountId, patient, clinical, related);
      }));
    }
    const [assessmentMap, followUpMap, relatedValues] = await Promise.all([
      options.clinicalRepository.listAssessmentsByPatients(accountId, patientIds),
      options.clinicalRepository.listNextFollowUps(accountId, patientIds),
      Promise.all(patients.map((patient) => relatedCounts(accountId, patient.id))),
    ]);
    return Promise.all(patients.map((patient, index) => {
      const related = relatedValues[index];
      const clinical = buildClinicalSummary(assessmentMap[patient.id] ?? [], followUpMap[patient.id] ?? null, related);
      return toSummary(accountId, patient, clinical, related);
    }));
  };

  return {
    getProfile: async (accountId, patientId): Promise<PatientProfile | null> => {
      const patient = await patientRepository.getById(accountId, patientId);
      if (!patient) return null;
      const [objectives, related] = await Promise.all([
        objectiveCatalogRepository.list(accountId),
        relatedCounts(accountId, patient.id),
      ]);
      const clinical = await readClinicalProfile(accountId, patient.id, related, options.clinicalRepository);
      return {
        patient,
        initials: getPatientInitials(patient.name),
        availableObjectives: objectives.filter((objective) => objective.archivedAt === null).map((objective) => objective.label),
        related: { dietCount: related.dietCount, assessmentCount: clinical?.assessmentCount ?? related.assessmentCount },
        clinical,
      };
    },
    listActiveSummaries: async (accountId) => readSummaries(accountId, await patientRepository.listActive(accountId)),
    listActiveSummaryPage: async (accountId, query) => {
      const page = await patientRepository.listActivePage(accountId, query);
      return { ...page, items: await readSummaries(accountId, page.items) };
    },
  };
}
