import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getPatientById,
  updatePatientInStorage,
  deletePatientFromStorage,
  getPatientAssessmentsFromStorage,
  savePatientAssessmentToStorage,
  Patient,
  PatientNextEvent,
  BodyAssessment,
  DEFAULT_OBJECTIVES,
  HistoricalDiet,
} from '@/lib/patientsStore';
import {
  buildNextEventSummary,
  selectActivePlan,
  selectLatestAssessment,
} from '@/lib/patientProfileSelectors';
import { getWhatsappUrl } from '@/lib/whatsapp';

export function usePatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);

  const [dietHistory, setDietHistory] = useState<HistoricalDiet[]>([]);
  const [bodyAssessments, setBodyAssessments] = useState<BodyAssessment[]>([]);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditAssessmentOpen, setIsEditAssessmentOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<BodyAssessment | null>(null);
  const [assessmentMode, setAssessmentMode] = useState<'create' | 'edit'>('edit');
  const [isNextEventModalOpen, setIsNextEventModalOpen] = useState(false);
  const [isAddObjectiveModalOpen, setIsAddObjectiveModalOpen] = useState(false);
  const [objectiveToApply, setObjectiveToApply] = useState<string | undefined>();

  // Read-Only Diet Modal state
  const [selectedReadOnlyDiet, setSelectedReadOnlyDiet] = useState<HistoricalDiet | null>(null);
  const [isReadOnlyDietModalOpen, setIsReadOnlyDietModalOpen] = useState(false);

  const handleOpenReadOnlyDietModal = useCallback((diet: HistoricalDiet) => {
    setSelectedReadOnlyDiet(diet);
    setIsReadOnlyDietModalOpen(true);
  }, []);

  const handleOpenEditAssessment = useCallback((assessment: BodyAssessment) => {
    setEditingAssessment({ ...assessment });
    setAssessmentMode('edit');
    setIsEditAssessmentOpen(true);
  }, []);

  const handleSaveAssessment = useCallback((assessment: BodyAssessment) => {
    if (editingAssessment && patient) {
      const updatedAssessments = savePatientAssessmentToStorage(patient.id, assessment);
      setBodyAssessments(updatedAssessments);
      setIsEditAssessmentOpen(false);
      toast.success('Avaliação física atualizada com sucesso!');
    }
  }, [editingAssessment, patient]);

  const handleSaveNextEvent = useCallback((nextEvent: PatientNextEvent) => {
    if (!patient) return;
    const saved = updatePatientInStorage({
      ...patient,
      nextEvent,
    });
    setPatient(saved);
    setIsNextEventModalOpen(false);
    toast.success('Próximo acompanhamento salvo.');
  }, [patient]);

  const handleClearNextEvent = useCallback(() => {
    if (!patient) return;
    const saved = updatePatientInStorage({ ...patient, nextEvent: null });
    setPatient(saved);
    setIsNextEventModalOpen(false);
    toast.success('Próximo acompanhamento removido.');
  }, [patient]);

  const [customObjectives, setCustomObjectives] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('diet_maker_custom_objectives');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const availableObjectives = useMemo(() => {
    const set = new Set([...DEFAULT_OBJECTIVES, ...customObjectives]);
    return Array.from(set);
  }, [customObjectives]);

  const handleAddCustomObjective = useCallback((newObjective: string) => {
    setCustomObjectives((prev) => {
      if (prev.includes(newObjective)) return prev;
      const updated = [...prev, newObjective];
      if (typeof window !== 'undefined') {
        localStorage.setItem('diet_maker_custom_objectives', JSON.stringify(updated));
      }
      return updated;
    });
    toast.success('Novo objetivo cadastrado!');
  }, []);

  useEffect(() => {
    if (patientId) {
      const p = getPatientById(patientId);
      if (p) {
        setPatient(p);
        setDietHistory(p.dietHistory || []);
        const loadedAssessments = getPatientAssessmentsFromStorage(p.id);
        setBodyAssessments(loadedAssessments.length > 0 ? loadedAssessments : p.bodyAssessments || []);
      }
    }
  }, [patientId]);

  const activePlan = useMemo(() => selectActivePlan(dietHistory), [dietHistory]);
  const latestAssessment = useMemo(() => selectLatestAssessment(bodyAssessments), [bodyAssessments]);
  const nextEventSummary = useMemo(() => buildNextEventSummary(patient?.nextEvent), [patient?.nextEvent]);
  const whatsappUrl = useMemo(() => getWhatsappUrl(patient?.phone), [patient?.phone]);

  const handleSavePatient = useCallback((updatedPatient: Patient) => {
    const saved = updatePatientInStorage(updatedPatient);
    setPatient(saved);
    setIsEditModalOpen(false);
    toast.success('Dados do paciente atualizados!');
  }, []);

  const handleDeletePatient = useCallback(() => {
    if (!patient) return;
    deletePatientFromStorage(patient.id);
    toast.success('Paciente excluído com sucesso!');
    router.push('/pacientes');
  }, [patient, router]);

  return {
    patientId,
    patient,
    dietHistory,
    bodyAssessments,
    activePlan,
    latestAssessment,
    nextEventSummary,
    whatsappUrl,
    availableObjectives,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isEditAssessmentOpen,
    setIsEditAssessmentOpen,
    editingAssessment,
    assessmentMode,
    isNextEventModalOpen,
    setIsNextEventModalOpen,
    isAddObjectiveModalOpen,
    setIsAddObjectiveModalOpen,
    objectiveToApply,
    setObjectiveToApply,
    selectedReadOnlyDiet,
    isReadOnlyDietModalOpen,
    setIsReadOnlyDietModalOpen,
    handleOpenReadOnlyDietModal,
    handleOpenEditAssessment,
    handleSaveAssessment,
    handleSaveNextEvent,
    handleClearNextEvent,
    handleAddCustomObjective,
    handleSavePatient,
    handleDeletePatient,
    router,
  };
}
