import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PatientInput } from '@/lib/domain/patient';
import type { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { toPatientViewModel } from '@/lib/patientViewModel';
import { buildPatientListRows, filterPatients, type PatientListHistoryInput, type PatientListRow } from '@/lib/patientListView';

export function usePatientsPage() {
  const [patients, setPatients] = useState<ReturnType<typeof toPatientViewModel>[]>([]);
  const [patientHistoryById, setPatientHistoryById] = useState<Record<string, PatientListHistoryInput>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const application = await getBrowserPatientApplication();
      const summaries = await application.listActivePatients();
      const views = summaries.map(({ patient, related }) => toPatientViewModel(patient, {
        initials: summaries.find((summary) => summary.patient.id === patient.id)?.initials,
      }));
      setPatients(views);
      setPatientHistoryById(Object.fromEntries(summaries.map(({ patient, related }) => [patient.id, {
        assessments: [],
        hasAssessment: related.assessmentCount > 0,
        hasDiet: related.dietCount > 0,
      }])));
    } catch (cause) {
      const message = (cause as PatientApplicationError)?.message || 'Não foi possível carregar os pacientes.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const filteredPatients = useMemo(() => filterPatients(patients, searchTerm), [patients, searchTerm]);
  const rows = useMemo<PatientListRow[]>(
    () => buildPatientListRows(filteredPatients, undefined, patientHistoryById),
    [filteredPatients, patientHistoryById],
  );

  const createPatient = useCallback(async (input: PatientInput) => {
    const application = await getBrowserPatientApplication();
    const created = await application.createPatient(input);
    await loadPatients();
    return created;
  }, [loadPatients]);

  return {
    patients,
    filteredPatients,
    rows,
    patientHistoryById,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    retry: loadPatients,
    createPatient,
  };
}
