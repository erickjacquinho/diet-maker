import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PatientInput } from '@/lib/domain/patient';
import type { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { toPatientViewModel } from '@/lib/patientViewModel';
import { buildPatientListRows, filterPatients, type PatientListHistoryInput, type PatientListRow } from '@/lib/patientListView';
import { toLegacyAssessment, toLegacyLastActivity, toLegacyNextEvent, type PatientNextEventType } from '@/lib/application/patients/clinical-ui-adapter';
import { normalizeDateKey } from '@/lib/patientListDateUtils';

export function usePatientsPage() {
  const [patients, setPatients] = useState<ReturnType<typeof toPatientViewModel>[]>([]);
  const [patientHistoryById, setPatientHistoryById] = useState<Record<string, PatientListHistoryInput>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const loadPatients = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    setError(null);
    try {
      const application = await getBrowserPatientApplication();
      const summaries = await application.listActivePatients();
      if (requestId !== latestRequest.current) return;
      const views = summaries.map(({ patient, initials, clinical }) => toPatientViewModel(patient, {
        initials,
        nextEvent: toLegacyNextEvent(clinical?.nextFollowUp ?? null),
        lastActivity: toLegacyLastActivity(clinical?.lastActivity),
      }));
      setPatients(views);
      setPatientHistoryById(Object.fromEntries(summaries.map(({ patient, related, clinical }) => [patient.id, {
        assessments: clinical ? [clinical.latestAssessment, clinical.previousAssessment].filter((assessment): assessment is NonNullable<typeof assessment> => Boolean(assessment)).map(toLegacyAssessment) : [],
        hasAssessment: Boolean(clinical?.assessmentCount || related.assessmentCount),
        hasDiet: clinical?.hasDiet || related.dietCount > 0,
      }])));
    } catch (cause) {
      if (requestId !== latestRequest.current) return;
      const message = (cause as PatientApplicationError)?.message || 'Não foi possível carregar os pacientes.';
      setError(message);
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
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
  const total = filteredPatients.length;

  const createPatient = useCallback(async (input: PatientInput) => {
    const application = await getBrowserPatientApplication();
    const created = await application.createPatient(input);
    await loadPatients();
    return created;
  }, [loadPatients]);

  const updateNextFollowUpDates = useCallback((updates: readonly { patientId: string; dates: Partial<Record<PatientNextEventType, string | null>>; version?: number }[]) => {
    const updatesByPatient = new Map(updates.map((update) => [update.patientId, update]));
    setPatients((current) => current.map((patient) => {
      const update = updatesByPatient.get(patient.id);
      if (!update || !patient.nextEvent) return patient;
      const currentDates = patient.nextEvent.dates ?? Object.fromEntries(
        (Array.isArray(patient.nextEvent.type) ? patient.nextEvent.type : [patient.nextEvent.type])
          .map((type) => [type, patient.nextEvent!.date]),
      ) as Partial<Record<PatientNextEventType, string>>;
      const dates: Partial<Record<PatientNextEventType, string>> = {};
      for (const [type, date] of Object.entries({ ...currentDates, ...update.dates }) as Array<[PatientNextEventType, string | null | undefined]>) {
        const normalizedDate = date ? normalizeDateKey(date) : null;
        if (normalizedDate) dates[type] = normalizedDate;
      }
      const dateEntries = Object.entries(dates) as Array<[PatientNextEventType, string]>;
      if (dateEntries.length === 0) return { ...patient, nextEvent: null };
      const firstDate = dateEntries.map(([, date]) => date).sort()[0];
      const firstTypes = dateEntries.filter(([, date]) => date === firstDate).map(([type]) => type);
      return {
        ...patient,
        nextEvent: {
          ...patient.nextEvent,
          date: firstDate,
          type: firstTypes,
          dates,
          ...(update.version === undefined ? {} : { version: update.version }),
        },
      };
    }));
  }, []);

  return {
    patients,
    filteredPatients,
    rows,
    patientHistoryById,
    searchTerm,
    setSearchTerm,
    total,
    isLoading,
    error,
    retry: loadPatients,
    createPatient,
    updateNextFollowUpDates,
  };
}
