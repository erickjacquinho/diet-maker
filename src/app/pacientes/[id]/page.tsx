'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Utensils, 
  Activity, 
  Calendar, 
  Weight, 
  Mars,
  Venus,
  Scale,
  Ruler,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import {
  Avatar,
  EditIconButton,
  DeleteIconButton,
  CreateButton,
  SecondaryActionButton,
  Surface,
} from '@/components/atoms';
import {
  EditAssessmentModal,
  ReadOnlyDietModal,
  EditPatientModal,
  NextEventModal,
  AddObjectiveModal,
  DeletePatientModal,
  MetricBox,
  PageContextHeader,
} from '@/components/molecules';
import {
  MetricBoxGroup,
  PatientConsultationHistoryTable,
  type ConsolidatedConsultationUpdate,
} from '@/components/organisms';
import { textStyle } from '@/design-system';
import { calculatePresetCalories } from '@/lib/presetUtils';
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

export default function PatientDetailPage() {
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

  const handleOpenReadOnlyDietModal = (diet: HistoricalDiet) => {
    setSelectedReadOnlyDiet(diet);
    setIsReadOnlyDietModalOpen(true);
  };

  const handleOpenEditAssessment = (assessment: BodyAssessment) => {
    setEditingAssessment({ ...assessment });
    setAssessmentMode('edit');
    setIsEditAssessmentOpen(true);
  };

  const handleSaveAssessment = (assessment: BodyAssessment) => {
    if (editingAssessment && patient) {
      const updatedAssessments = savePatientAssessmentToStorage(patient.id, assessment);
      setBodyAssessments(updatedAssessments);
      setIsEditAssessmentOpen(false);
      toast.success('Avaliação física atualizada com sucesso!');
    }
  };

  const handleSaveNextEvent = (nextEvent: PatientNextEvent) => {
    if (!patient) return;

    const saved = updatePatientInStorage({
      ...patient,
      nextEvent,
    });
    setPatient(saved);
    setIsNextEventModalOpen(false);
    toast.success('Próximo acompanhamento salvo.');
  };

  const handleClearNextEvent = () => {
    if (!patient) return;

    const saved = updatePatientInStorage({ ...patient, nextEvent: null });
    setPatient(saved);
    setIsNextEventModalOpen(false);
    toast.success('Próximo acompanhamento removido.');
  };

  const [customObjectives, setCustomObjectives] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nutridiet_custom_objectives');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleAddNewObjective = (newObj: string) => {
    if (!customObjectives.includes(newObj) && !DEFAULT_OBJECTIVES.includes(newObj)) {
      const updatedCustom = [...customObjectives, newObj];
      setCustomObjectives(updatedCustom);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutridiet_custom_objectives', JSON.stringify(updatedCustom));
      }
    }

    setObjectiveToApply(newObj);
    setIsAddObjectiveModalOpen(false);
    toast.success(`Objetivo "${newObj}" adicionado e selecionado!`);
  };

  useEffect(() => {
    if (patientId) {
      const found = getPatientById(patientId);
      setPatient(found);
      setBodyAssessments(getPatientAssessmentsFromStorage(patientId));

      if (typeof window !== 'undefined') {
        try {
          interface SavedMealItemRaw {
            name?: string;
            quantityGrams?: number | string;
            protein?: number | string;
            carbs?: number | string;
            fats?: number | string;
          }

          interface SavedMealRaw {
            name?: string;
            time?: string;
            items?: SavedMealItemRaw[];
          }

          interface SavedDietRaw {
            id: string;
            name?: string;
            updatedAt?: string;
            createdAt?: string;
            simpleTargetKcal?: number | string;
            simpleTargetProtein?: number | string;
            simpleTargetCarbs?: number | string;
            simpleTargetFats?: number | string;
            simpleMeals?: SavedMealRaw[];
          }

          const savedDietsRaw = localStorage.getItem(`nutridiet_diets_${patientId}`);
          if (savedDietsRaw) {
            const savedDiets: SavedDietRaw[] = JSON.parse(savedDietsRaw);
            const mapped: HistoricalDiet[] = savedDiets.map((d) => {
              const simpleMeals = d.simpleMeals || [];
              const meals = simpleMeals.map((m) => {
                const items = m.items || [];
                const p = Math.round(items.reduce((acc, i) => acc + (Number(i.protein) || 0), 0) * 10) / 10;
                const c = Math.round(items.reduce((acc, i) => acc + (Number(i.carbs) || 0), 0) * 10) / 10;
                const f = Math.round(items.reduce((acc, i) => acc + (Number(i.fats) || 0), 0) * 10) / 10;
                const kcal = calculatePresetCalories(p, c, f);
                const itemsSummary = items.length > 0 
                  ? items.map((i) => `${i.name || 'Alimento'} (${i.quantityGrams || 0}g)`).join(', ')
                  : undefined;

                return {
                  name: m.name || 'Refeição',
                  time: m.time || '00:00',
                  kcal,
                  proteinG: p,
                  carbsG: c,
                  fatsG: f,
                  itemsSummary,
                };
              });

              const totalProteinG = Math.round(meals.reduce((acc, m) => acc + m.proteinG, 0) * 10) / 10;
              const totalCarbsG = Math.round(meals.reduce((acc, m) => acc + m.carbsG, 0) * 10) / 10;
              const totalFatsG = Math.round(meals.reduce((acc, m) => acc + m.fatsG, 0) * 10) / 10;
              const totalKcal = calculatePresetCalories(totalProteinG, totalCarbsG, totalFatsG);

              return {
                id: d.id,
                name: d.name || 'Prescrição Alimentar',
                date: d.updatedAt || d.createdAt || new Date().toLocaleDateString('pt-BR'),
                targetKcal: totalKcal || Number(d.simpleTargetKcal) || 0,
                proteinG: totalProteinG || Number(d.simpleTargetProtein) || 0,
                carbsG: totalCarbsG || Number(d.simpleTargetCarbs) || 0,
                fatsG: totalFatsG || Number(d.simpleTargetFats) || 0,
                status: 'Ativa',
                meals,
              };
            });
            setDietHistory(mapped);
          }
        } catch {
          setDietHistory([]);
        }
      }
    }
  }, [patientId]);

  // Consolidate updates by date for the unified table view
  const consolidatedUpdates: ConsolidatedConsultationUpdate[] = useMemo(() => {
    const mapByDate = new Map<string, ConsolidatedConsultationUpdate>();

    dietHistory.forEach((diet) => {
      const key = diet.date;
      const existing = mapByDate.get(key);
      mapByDate.set(key, { date: existing?.date ?? diet.date, diet, assessment: existing?.assessment });
    });

    bodyAssessments.forEach((assess) => {
      const key = assess.date;
      const existing = mapByDate.get(key);
      mapByDate.set(key, { date: existing?.date ?? assess.date, diet: existing?.diet, assessment: assess });
    });

    return Array.from(mapByDate.values());
  }, [dietHistory, bodyAssessments]);

  const handleOpenEditModal = () => {
    if (patient) setIsEditModalOpen(true);
  };

  const handleSaveEdit = (patientDraft: Patient) => {
    const saved = updatePatientInStorage(patientDraft);
    setPatient(saved);
    setIsEditModalOpen(false);
  };

  const handleDeletePatient = () => {
    if (patient) {
      deletePatientFromStorage(patient.id);
      setIsDeleteModalOpen(false);
      router.push('/pacientes');
    }
  };

  const latestAssessment = useMemo(() => {
    return selectLatestAssessment(bodyAssessments);
  }, [bodyAssessments]);

  const activePlan = useMemo(() => selectActivePlan(dietHistory), [dietHistory]);

  if (!patient) {
    return (
      <div className="p-6 max-w-md mx-auto my-12 text-center">
        <Surface variant="default" density="compact" className="p-8 flex flex-col gap-4">
          <div className="size-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
            <AlertTriangle size={24} className="text-warning" />
          </div>
          <div>
            <h3 className={textStyle('card-title')}>Paciente Não Encontrado</h3>
            <p className={`mt-1 ${textStyle('body-secondary')}`}>
              O paciente solicitado não existe ou foi removido do sistema.
            </p>
          </div>
          <Link href="/pacientes" className="inline-block pt-2">
            <SecondaryActionButton icon={<ArrowLeft size={14} />}>
              Voltar para Pacientes
            </SecondaryActionButton>
          </Link>
        </Surface>
      </div>
    );
  }

  const normalizedGender = patient.gender.trim().toLocaleLowerCase('pt-BR');
  const GenderIcon = normalizedGender === 'feminino' || normalizedGender === 'female'
    ? Venus
    : normalizedGender === 'masculino' || normalizedGender === 'male'
      ? Mars
      : null;
  const nextEventSummary = buildNextEventSummary(patient.nextEvent);
  const whatsappUrl = getWhatsappUrl(patient.whatsapp);

  const handleOpenWhatsapp = () => {
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto gap-6">
      <PageContextHeader
        title="Perfil do paciente"
        backHref="/pacientes"
        backLabel="Voltar para Pacientes"
        breadcrumbs={[{ label: 'Pacientes', href: '/pacientes' }, { label: patient.name }]}
      />

      {/* Patient summary */}
      <Surface variant="default" density="compact" className="p-6 flex flex-col gap-6">
        {/* Row 1: Profile & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-divider pb-5">
          <div className="flex items-center gap-4">
            <Avatar initials={patient.initials} variant="charcoal" size="lg" className="shrink-0" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={textStyle('subsection-title')}>{patient.name}</h2>
                {GenderIcon && (
                  <span
                    role="img"
                    aria-label={patient.gender}
                    title={patient.gender}
                    className="flex items-center justify-center text-text-muted"
                  >
                    <GenderIcon size={14} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-control bg-surface-subtle border border-border-subtle ${textStyle('caption-strong')}`}>
                  {patient.objective || 'Acompanhamento'}
                </span>
              </div>
              <div className={`flex items-center gap-2 ${textStyle('caption')}`} aria-label="Dados cadastrais">
                <span aria-label={`Idade: ${patient.age} anos`} className="font-semibold text-text-primary">
                  {patient.age} anos
                </span>
                <span aria-hidden="true">·</span>
                <span aria-label={`Altura: ${patient.heightCm} centímetros`} className="font-semibold text-text-primary">
                  {patient.heightCm} cm
                </span>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <Link href={`/pacientes/${patient.id}/dieta/nova`}>
              <CreateButton>Nova Dieta</CreateButton>
            </Link>

            <SecondaryActionButton
              icon={<Activity size={14} className="text-success" />}
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setAssessmentMode('create');
                setEditingAssessment({
                  id: `assessment-${Date.now()}`,
                  date: today,
                  weightKg: patient.weightKg,
                  bodyFatPercent: Number.NaN,
                  muscleMassKg: Number.NaN,
                  waistCm: Number.NaN,
                });
                setIsEditAssessmentOpen(true);
              }}
            >
              Nova Avaliação Física
            </SecondaryActionButton>

            <SecondaryActionButton
              type="button"
              icon={<MessageCircle size={14} className="text-success" />}
              disabled={!whatsappUrl}
              title={whatsappUrl ? 'Abrir conversa no WhatsApp' : 'Cadastre um WhatsApp para entrar em contato'}
              aria-label={whatsappUrl ? 'Abrir conversa no WhatsApp' : 'WhatsApp indisponível: cadastre um número'}
              onClick={handleOpenWhatsapp}
            >
              WhatsApp
            </SecondaryActionButton>

            <EditIconButton onClick={handleOpenEditModal} title="Editar Cadastro" variant="secondary" />
            <DeleteIconButton
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir Paciente"
              variant="destructive-outline"
            />
          </div>
        </div>

        {/* Current follow-up indicators */}
        <section className="flex flex-col gap-3" aria-labelledby="current-indicators-title">
          <div>
            <h3 id="current-indicators-title" className={textStyle('subsection-title')}>
              Indicadores atuais
            </h3>
            <p className={textStyle('caption')}>
              Medições que acompanham a evolução do paciente.
            </p>
          </div>

          <MetricBoxGroup
            items={[
              {
                icon: <Weight size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />,
                label: "Peso atual",
                value: latestAssessment && latestAssessment.weightKg > 0 ? `${latestAssessment.weightKg} kg` : 'Sem avaliação',
                tone: latestAssessment && latestAssessment.weightKg > 0 ? 'default' : 'muted',
              },
              {
                icon: <Activity size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />,
                label: "% de gordura",
                value: latestAssessment && latestAssessment.bodyFatPercent > 0 ? `${latestAssessment.bodyFatPercent}%` : 'Sem avaliação',
                tone: latestAssessment && latestAssessment.bodyFatPercent > 0 ? 'default' : 'muted',
              },
              {
                icon: <Scale size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />,
                label: "Massa magra",
                value: latestAssessment && latestAssessment.muscleMassKg > 0 ? `${latestAssessment.muscleMassKg} kg` : 'Sem avaliação',
                tone: latestAssessment && latestAssessment.muscleMassKg > 0 ? 'default' : 'muted',
              },
              {
                icon: <Ruler size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />,
                label: "Cintura",
                value: latestAssessment && latestAssessment.waistCm > 0 ? `${latestAssessment.waistCm} cm` : 'Sem avaliação',
                tone: latestAssessment && latestAssessment.waistCm > 0 ? 'default' : 'muted',
              },
            ]}
          />

          <div className="grid grid-cols-3 gap-3">
            <MetricBox
              size="standard"
              layout="split"
              surface="raised"
              icon={<Calendar size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />}
              label="Última consulta"
              value={patient.lastConsultation || 'Não informada'}
            />
            <Surface
              variant="subtle"
              density="compact"
              className="col-span-2 flex h-full items-center justify-between gap-3 border-border-divider px-3 py-3"
              aria-label="Próximo acompanhamento"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Calendar size={12} strokeWidth={1.75} className={patient.nextEvent ? 'text-primary' : 'text-warning'} aria-hidden="true" />
                <div className="flex min-w-0 items-center gap-2">
                  <span className={textStyle('body-small-strong')}>
                    Próximo acompanhamento
                  </span>
                  <span className={`truncate ${textStyle('caption')}`}>
                    {nextEventSummary
                      ? `${nextEventSummary.date} · ${nextEventSummary.label}`
                      : 'Sem próximo evento'}
                  </span>
                </div>
              </div>
              <SecondaryActionButton
                type="button"
                onClick={() => setIsNextEventModalOpen(true)}
              >
                {patient.nextEvent ? 'Reagendar' : 'Definir acompanhamento'}
              </SecondaryActionButton>
            </Surface>
          </div>
        </section>
      </Surface>

      {/* Current plan and consultation history */}
      <Surface variant="default" density="compact" className="p-6 flex flex-col gap-6">
        <section aria-labelledby="current-plan-title" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <h2 id="current-plan-title" className={textStyle('section-title')}>
                Plano alimentar atual
              </h2>
              {activePlan && (
                <span className={`text-success px-2 py-0.5 bg-success-soft rounded-control ${textStyle('caption-strong')}`}>
                  Plano vigente
                </span>
              )}
            </div>
            <p className={textStyle('caption')}>
              {activePlan
                ? `Resumo da dieta registrada em ${activePlan.date}.`
                : 'Nenhuma dieta ativa está vinculada a este paciente.'}
            </p>
          </div>

          {activePlan && (
            <div className="flex flex-col gap-2 border-t border-border-subtle pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className={`truncate ${textStyle('body-small-strong')}`}>{activePlan.name}</p>
                  <p className={textStyle('caption')}>Atualizado em {activePlan.date}</p>
                </div>
                <Link href={`/pacientes/${patient.id}/dieta/${activePlan.dietId}`}>
                  <SecondaryActionButton>Abrir dieta</SecondaryActionButton>
                </Link>
              </div>
              <p className={textStyle('body-secondary')} aria-label="Resumo de metas da dieta vigente">
                {activePlan.targetKcal > 0 ? `${activePlan.targetKcal} kcal` : 'Kcal sem definição'}
                {' · '}
                {activePlan.proteinG > 0 ? `${activePlan.proteinG}g P` : 'P sem definição'}
                {' · '}
                {activePlan.carbsG > 0 ? `${activePlan.carbsG}g C` : 'C sem definição'}
                {' · '}
                {activePlan.fatsG > 0 ? `${activePlan.fatsG}g G` : 'G sem definição'}
              </p>
            </div>
          )}
        </section>

        {/* Organism: Consultation History Table */}
        <PatientConsultationHistoryTable
          patientId={patient.id}
          updates={consolidatedUpdates}
          onOpenReadOnlyDiet={handleOpenReadOnlyDietModal}
          onOpenEditAssessment={handleOpenEditAssessment}
        />
      </Surface>

      {/* Extracted Molecules: Dialogs */}
      <NextEventModal
        open={isNextEventModalOpen}
        nextEvent={patient.nextEvent ?? null}
        onOpenChange={setIsNextEventModalOpen}
        onSave={handleSaveNextEvent}
        onClear={handleClearNextEvent}
      />

      <EditPatientModal
        open={isEditModalOpen}
        patient={patient}
        objectives={customObjectives}
        objectiveToApply={objectiveToApply}
        onOpenChange={setIsEditModalOpen}
        onSave={handleSaveEdit}
        onRequestAddObjective={() => setIsAddObjectiveModalOpen(true)}
      />

      <AddObjectiveModal
        open={isAddObjectiveModalOpen}
        onOpenChange={setIsAddObjectiveModalOpen}
        onAddObjective={handleAddNewObjective}
      />

      <DeletePatientModal
        open={isDeleteModalOpen}
        patientName={patient.name}
        onOpenChange={setIsDeleteModalOpen}
        onConfirmDelete={handleDeletePatient}
      />

      <EditAssessmentModal
        open={isEditAssessmentOpen}
        patient={patient}
        assessment={editingAssessment}
        mode={assessmentMode}
        onOpenChange={setIsEditAssessmentOpen}
        onSave={handleSaveAssessment}
      />

      <ReadOnlyDietModal
        isOpen={isReadOnlyDietModalOpen}
        onClose={() => setIsReadOnlyDietModalOpen(false)}
        diet={selectedReadOnlyDiet}
        patientName={patient?.name}
      />
    </div>
  );
}
