import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PatientInput } from '@/lib/domain/patient';
import type { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { toPatientViewModel } from '@/lib/patientViewModel';
import { buildPatientListRow, type PatientListHistoryInput, type PatientListRow } from '@/lib/patientListView';
import { MAX_PAGE_SIZE } from '@/lib/persistence/page';
import { toLegacyAssessment, toLegacyLastActivity, toLegacyNextEvent } from '@/lib/application/patients/clinical-ui-adapter';

export function usePatientsPage() {
  const [patients, setPatients] = useState<ReturnType<typeof toPatientViewModel>[]>([]);
  const [patientHistoryById, setPatientHistoryById] = useState<Record<string, PatientListHistoryInput>>({});
  const [searchTerm, setSearchTermState] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const loadPatients = useCallback(async (request: { query?: string; pageIndex?: number } = {}) => {
    const requestId = ++latestRequest.current;
    const query = request.query ?? searchTerm;
    const requestedPageIndex = request.pageIndex ?? pageIndex;
    setIsLoading(true);
    setError(null);
    try {
      const application = await getBrowserPatientApplication();
      const result = await application.listActivePatientsPage({ query, pageIndex: requestedPageIndex, pageSize: MAX_PAGE_SIZE });
      if (requestId !== latestRequest.current) return;
      const summaries = result.items;
      const views = summaries.map(({ patient, initials, clinical }) => toPatientViewModel(patient, {
        initials,
        nextEvent: toLegacyNextEvent(clinical?.nextFollowUp ?? null),
        lastActivity: toLegacyLastActivity(clinical?.lastActivity),
      }));
      setPatients(views);
      setTotal(result.total);
      setPatientHistoryById(Object.fromEntries(summaries.map(({ patient, related, clinical }) => [patient.id, {
        assessments: clinical ? [clinical.latestAssessment, clinical.previousAssessment].filter((assessment): assessment is NonNullable<typeof assessment> => Boolean(assessment)).map(toLegacyAssessment) : [],
        hasAssessment: Boolean(clinical?.assessmentCount || related.assessmentCount),
        hasDiet: clinical?.hasDiet || related.dietCount > 0,
      }])));
      const lastPageIndex = Math.max(0, Math.ceil(result.total / MAX_PAGE_SIZE) - 1);
      if (requestedPageIndex > lastPageIndex) setPageIndex(lastPageIndex);
    } catch (cause) {
      if (requestId !== latestRequest.current) return;
      const message = (cause as PatientApplicationError)?.message || 'Não foi possível carregar os pacientes.';
      setError(message);
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }, [pageIndex, searchTerm]);

  const setSearchTerm = useCallback((query: string) => {
    setSearchTermState(query);
    setPageIndex(0);
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const rows = useMemo<PatientListRow[]>(
    () => patients.map((patient) => buildPatientListRow(patient, undefined, patientHistoryById)),
    [patients, patientHistoryById],
  );

  const createPatient = useCallback(async (input: PatientInput) => {
    const application = await getBrowserPatientApplication();
    const created = await application.createPatient(input);
    await loadPatients();
    return created;
  }, [loadPatients]);

  return {
    patients,
    filteredPatients: patients,
    rows,
    patientHistoryById,
    searchTerm,
    setSearchTerm,
    total,
    pageIndex,
    setPageIndex,
    isLoading,
    error,
    retry: loadPatients,
    createPatient,
  };
}
