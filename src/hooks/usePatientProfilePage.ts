import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { toPatientInput, toPatientViewModel, type PatientViewModel } from '@/lib/patientViewModel';
import {
  PatientNextEvent,
  BodyAssessment,
  HistoricalDiet,
} from '@/lib/patientRelatedRecords';
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
  const [patient, setPatient] = useState<PatientViewModel | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [dietHistory, setDietHistory] = useState<HistoricalDiet[]>([]);
  const [bodyAssessments, setBodyAssessments] = useState<BodyAssessment[]>([]);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteDietModalOpen, setIsDeleteDietModalOpen] = useState(false);
  const [dietToDelete, setDietToDelete] = useState<HistoricalDiet | null>(null);
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

  const handleOpenDeleteDietModal = useCallback((diet: HistoricalDiet) => {
    setDietToDelete(diet);
    setIsDeleteDietModalOpen(true);
  }, []);

  const handleOpenEditAssessment = useCallback((assessment: BodyAssessment) => {
    setEditingAssessment({ ...assessment });
    setAssessmentMode('edit');
    setIsEditAssessmentOpen(true);
  }, []);

  const activePlan = useMemo(() => selectActivePlan(dietHistory), [dietHistory]);
  const latestAssessment = useMemo(() => selectLatestAssessment(bodyAssessments), [bodyAssessments]);
  const nextEventSummary = useMemo(() => buildNextEventSummary(patient?.nextEvent), [patient?.nextEvent]);
  const whatsappContact = patient?.whatsapp ?? patient?.phone;
  const whatsappUrl = useMemo(() => getWhatsappUrl(whatsappContact), [whatsappContact]);

  const handleOpenCreateAssessment = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    setEditingAssessment({
      id: `asm-${Date.now()}`,
      date: todayStr,
      weightKg: latestAssessment?.weightKg ?? 70,
      bodyFatPercent: latestAssessment?.bodyFatPercent ?? 15,
      muscleMassKg: latestAssessment?.muscleMassKg ?? 30,
      fatMassKg: latestAssessment?.fatMassKg ?? 10,
      waistCm: latestAssessment?.waistCm ?? 80,
      neckCm: latestAssessment?.neckCm ?? 38,
      scapulaCm: latestAssessment?.scapulaCm ?? 15,
      bustCm: latestAssessment?.bustCm ?? 95,
      leftArmCm: latestAssessment?.leftArmCm ?? 30,
      rightArmCm: latestAssessment?.rightArmCm ?? 30,
      abdomenCm: latestAssessment?.abdomenCm ?? 82,
      hipCm: latestAssessment?.hipCm ?? 95,
      leftProximalThighCm: latestAssessment?.leftProximalThighCm ?? 50,
      rightProximalThighCm: latestAssessment?.rightProximalThighCm ?? 50,
      leftDistalThighCm: latestAssessment?.leftDistalThighCm ?? 45,
      rightDistalThighCm: latestAssessment?.rightDistalThighCm ?? 45,
      leftCalfCm: latestAssessment?.leftCalfCm ?? 35,
      rightCalfCm: latestAssessment?.rightCalfCm ?? 35,
    });
    setAssessmentMode('create');
    setIsEditAssessmentOpen(true);
  }, [latestAssessment]);

  const handleSaveAssessment = useCallback((assessment: BodyAssessment) => {
    void assessment;
    toast.info('A persistência de avaliações físicas será habilitada na etapa clínica correspondente.');
  }, []);

  const handleSaveNextEvent = useCallback((nextEvent: PatientNextEvent) => {
    void nextEvent;
    setIsNextEventModalOpen(false);
    toast.info('A persistência de acompanhamentos será habilitada na etapa clínica correspondente.');
  }, []);

  const handleClearNextEvent = useCallback(() => {
    setIsNextEventModalOpen(false);
    toast.info('A persistência de acompanhamentos será habilitada na etapa clínica correspondente.');
  }, []);

  const [availableObjectives, setAvailableObjectives] = useState<string[]>([]);

  const handleAddCustomObjective = useCallback(async (newObjective: string) => {
    try {
      const application = await getBrowserPatientApplication();
      const option = await application.addObjectiveOption(newObjective);
      setAvailableObjectives((previous) => Array.from(new Set([...previous, option.label])));
      setObjectiveToApply(option.label);
      toast.success('Novo objetivo cadastrado!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível cadastrar o objetivo.');
      throw error;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!patientId) return undefined;
    setIsProfileLoading(true);
    setProfileError(null);
    void getBrowserPatientApplication().then(async (application) => {
      const profile = await application.getPatientProfile(patientId);
      if (cancelled) return;
      const view = toPatientViewModel(profile.patient, { initials: profile.initials });
      setPatient(view);
      setAvailableObjectives(profile.availableObjectives);
      // Diets and assessments belong to later SDDs. Keep the read sections
      // available without consulting legacy test storage or inventing a
      // second source of truth for these relations.
      setDietHistory([]);
      setBodyAssessments([]);
    }).catch((error: unknown) => {
      if (cancelled) return;
      setPatient(null);
      setProfileError(error instanceof PatientApplicationError ? error.message : 'Não foi possível carregar o perfil do paciente.');
    }).finally(() => {
      if (!cancelled) setIsProfileLoading(false);
    });
    return () => { cancelled = true; };
  }, [patientId]);

  const handleSavePatient = useCallback(async (updatedPatient: PatientViewModel) => {
    if (!updatedPatient.version) throw new Error('A versão do paciente não está disponível para atualização.');
    const application = await getBrowserPatientApplication();
    const saved = await application.updatePatient(updatedPatient.id, updatedPatient.version, toPatientInput(updatedPatient));
    setPatient(toPatientViewModel(saved, { maritalStatus: updatedPatient.maritalStatus }));
    setIsEditModalOpen(false);
    toast.success('Dados do paciente atualizados!');
  }, []);

  const handleDeletePatient = useCallback(async () => {
    if (!patient || !patient.version) return;
    const application = await getBrowserPatientApplication();
    await application.archivePatient(patient.id, patient.version);
    toast.success('Paciente arquivado; histórico preservado.');
    router.push('/pacientes');
  }, [patient, router]);

  const handleDeleteDiet = useCallback(() => {
    void dietToDelete;
    toast.info('Dietas pertencem à etapa clínica correspondente e não podem ser removidas aqui.');
  }, [dietToDelete]);

  return {
    patientId,
    patient,
    profileError,
    isProfileLoading,
    dietHistory,
    bodyAssessments,
    activePlan,
    latestAssessment,
    nextEventSummary,
    whatsappUrl,
    availableObjectives,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleteDietModalOpen,
    setIsDeleteDietModalOpen,
    dietToDelete,
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
    handleOpenDeleteDietModal,
    handleOpenEditAssessment,
    handleOpenCreateAssessment,
    handleSaveAssessment,
    handleSaveNextEvent,
    handleClearNextEvent,
    handleAddCustomObjective,
    handleSavePatient,
    handleDeletePatient,
    handleDeleteDiet,
    router,
  };
}
