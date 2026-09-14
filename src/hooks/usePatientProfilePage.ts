import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getBrowserDietApplication, getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { toPatientInput, toPatientViewModel, type PatientViewModel } from '@/lib/patientViewModel';
import {
  type BodyAssessment,
  type HistoricalDiet,
  type PatientNextEvent,
  toAssessmentInput,
  toLegacyAssessment,
  toLegacyLastActivity,
  toLegacyNextEvent,
  toNextFollowUpInput,
} from '@/lib/application/patients/clinical-ui-adapter';
import {
  buildNextEventSummary,
  selectCurrentActivePlan,
  selectLatestAssessment,
} from '@/lib/patientProfileSelectors';
import { getWhatsappUrl } from '@/lib/whatsapp';
import type { DietPlan } from '@/lib/domain/diets/diet-model';
import { toDietHistoryViews } from '@/lib/application/diets/diet-history-view';

export function usePatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const [patient, setPatient] = useState<PatientViewModel | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [confirmedPlans, setConfirmedPlans] = useState<HistoricalDiet[]>([]);
  const [canonicalDietPlans, setCanonicalDietPlans] = useState<Map<string, DietPlan>>(new Map());
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
  const [selectedReadOnlyDiet, setSelectedReadOnlyDiet] = useState<DietPlan | null>(null);
  const [isReadOnlyDietModalOpen, setIsReadOnlyDietModalOpen] = useState(false);

  const handleOpenReadOnlyDietModal = useCallback((diet: HistoricalDiet) => {
    setSelectedReadOnlyDiet(canonicalDietPlans.get(diet.id) ?? null);
    setIsReadOnlyDietModalOpen(true);
  }, [canonicalDietPlans]);

  const handleOpenEditAssessment = useCallback((assessment: BodyAssessment) => {
    setEditingAssessment({ ...assessment });
    setAssessmentMode('edit');
    setIsEditAssessmentOpen(true);
  }, []);

  const loadProfile = useCallback(async () => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const application = await getBrowserPatientApplication();
      const [profile, dietApplication] = await Promise.all([
        application.getPatientProfile(patientId),
        getBrowserDietApplication(),
      ]);
      const dietSummary = await dietApplication.getPatientDietSummary(patientId);
      const assessments = (profile.clinical?.assessments ?? []).map(toLegacyAssessment);
      const view = toPatientViewModel(profile.patient, {
        initials: profile.initials,
        nextEvent: toLegacyNextEvent(profile.clinical?.nextFollowUp ?? null),
        lastActivity: toLegacyLastActivity(profile.clinical?.lastActivity),
        bodyAssessments: assessments,
      });
      setPatient(view);
      setAvailableObjectives(profile.availableObjectives);
      const rows = [dietSummary.current, ...dietSummary.history].filter((row): row is NonNullable<typeof row> => Boolean(row));
      setCanonicalDietPlans(new Map(rows.map((row) => [row.id, row.plan])));
      setConfirmedPlans(toDietHistoryViews(dietSummary));
      setBodyAssessments(assessments);
    } catch (error: unknown) {
      setPatient(null);
      setProfileError(error instanceof PatientApplicationError ? error.message : 'Não foi possível carregar o perfil do paciente.');
      throw error;
    } finally {
      setIsProfileLoading(false);
    }
  }, [patientId]);

  const activePlan = useMemo(() => selectCurrentActivePlan(confirmedPlans), [confirmedPlans]);
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

  const handleSaveAssessment = useCallback(async (assessment: BodyAssessment) => {
    const application = await getBrowserPatientApplication();
    if (assessmentMode === 'create') {
      await application.createAssessment(patientId, toAssessmentInput(assessment));
    } else {
      if (assessment.version === undefined) throw new Error('A versão da avaliação não está disponível para atualização.');
      await application.updateAssessment(patientId, assessment.id, assessment.version, toAssessmentInput(assessment));
    }
    setIsEditAssessmentOpen(false);
    toast.success(assessmentMode === 'create' ? 'Avaliação física criada com sucesso!' : 'Avaliação física atualizada com sucesso!');
    await loadProfile();
  }, [assessmentMode, loadProfile, patientId]);

  const handleSaveNextEvent = useCallback(async (nextEvent: PatientNextEvent) => {
    const application = await getBrowserPatientApplication();
    const current = await application.getNextFollowUp(patientId);
    await application.setNextFollowUp(patientId, current?.version ?? null, toNextFollowUpInput(nextEvent));
    toast.success('Próximo acompanhamento salvo.');
    await loadProfile();
  }, [loadProfile, patientId]);

  const handleClearNextEvent = useCallback(async () => {
    const application = await getBrowserPatientApplication();
    const current = await application.getNextFollowUp(patientId);
    if (!current) return;
    await application.clearNextFollowUp(patientId, current.version);
    toast.success('Próximo acompanhamento removido.');
    await loadProfile();
  }, [loadProfile, patientId]);

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
    if (!patientId) return undefined;
    let cancelled = false;
    void loadProfile().catch(() => {
      if (cancelled) return;
    });
    return () => { cancelled = true; };
  }, [loadProfile, patientId]);

  const handleSavePatient = useCallback(async (updatedPatient: PatientViewModel) => {
    if (!updatedPatient.version) throw new Error('A versão do paciente não está disponível para atualização.');
    const application = await getBrowserPatientApplication();
    await application.updatePatient(updatedPatient.id, updatedPatient.version, toPatientInput(updatedPatient));
    setIsEditModalOpen(false);
    toast.success('Dados do paciente atualizados!');
    await loadProfile();
  }, [loadProfile]);

  const handleDeletePatient = useCallback(async () => {
    if (!patient || !patient.version) return;
    const application = await getBrowserPatientApplication();
    await application.archivePatient(patient.id, patient.version);
    toast.success('Paciente arquivado; histórico preservado.');
    router.push('/pacientes');
  }, [patient, router]);

  return {
    patientId,
    patient,
    profileError,
    isProfileLoading,
    confirmedPlans,
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
    handleOpenCreateAssessment,
    handleSaveAssessment,
    handleSaveNextEvent,
    handleClearNextEvent,
    handleAddCustomObjective,
    handleSavePatient,
    handleDeletePatient,
    router,
  };
}
