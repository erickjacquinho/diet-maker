'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Utensils, 
  Activity, 
  Calendar, 
  Weight, 
  Mars,
  Venus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Scale,
  Ruler,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { Avatar, EditIconButton, DeleteIconButton, CreateButton, SecondaryActionButton, IconButton } from '@/components/atoms';
import { EditAssessmentModal, ReadOnlyDietModal, MetricBox, DatePickerField, PageContextHeader } from '@/components/molecules';
import { EditPatientModal } from '@/components/molecules/EditPatientModal';
import { MetricBoxGroup } from '@/components/organisms';
import { textStyle } from '@/design-system';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  getPatientById, 
  updatePatientInStorage, 
  deletePatientFromStorage, 
  getPatientAssessmentsFromStorage,
  savePatientAssessmentToStorage,
  Patient,
  PatientNextEvent,
  PatientNextEventType,
  BodyAssessment,
  DEFAULT_OBJECTIVES,
} from '@/lib/patientsStore';
import {
  buildNextEventSummary,
  normalizePatientDateKey,
  selectActivePlan,
  selectLatestAssessment,
} from '@/lib/patientProfileSelectors';
import { getWhatsappUrl } from '@/lib/whatsapp';


interface HistoricalDiet {
  id: string;
  name: string;
  date: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  status: 'Ativa' | 'Histórica';
}

interface ConsolidatedUpdate {
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);

  const [dietHistory, setDietHistory] = useState<HistoricalDiet[]>([]);
  const [bodyAssessments, setBodyAssessments] = useState<BodyAssessment[]>([]);

  // Expanded Row State for Accordion in Unified Table
  const [expandedRowDate, setExpandedRowDate] = useState<string | null>(null);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditAssessmentOpen, setIsEditAssessmentOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<BodyAssessment | null>(null);
  const [assessmentMode, setAssessmentMode] = useState<'create' | 'edit'>('edit');
  const [isNextEventModalOpen, setIsNextEventModalOpen] = useState(false);
  const [nextEventDraft, setNextEventDraft] = useState<PatientNextEvent>({
    date: '',
    type: 'assessment-update',
  });
  const [isAddObjectiveModalOpen, setIsAddObjectiveModalOpen] = useState(false);
  const [newObjectiveInput, setNewObjectiveInput] = useState('');
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

  const handleOpenNextEventModal = () => {
    if (!patient) return;

    setNextEventDraft(patient.nextEvent
      ? { ...patient.nextEvent }
      : { date: '', type: 'assessment-update' });
    setIsNextEventModalOpen(true);
  };

  const handleSaveNextEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !nextEventDraft.date) return;

    const saved = updatePatientInStorage({
      ...patient,
      nextEvent: { ...nextEventDraft },
    });
    setPatient(saved);
    setNextEventDraft({ ...saved.nextEvent! });
    setIsNextEventModalOpen(false);
    toast.success('Próximo acompanhamento salvo.');
  };

  const handleClearNextEvent = () => {
    if (!patient) return;

    const saved = updatePatientInStorage({ ...patient, nextEvent: null });
    setPatient(saved);
    setNextEventDraft({ date: '', type: 'assessment-update' });
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

  const handleAddNewObjective = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newObjectiveInput.trim();
    if (!trimmed) return;

    if (!customObjectives.includes(trimmed) && !DEFAULT_OBJECTIVES.includes(trimmed)) {
      const updatedCustom = [...customObjectives, trimmed];
      setCustomObjectives(updatedCustom);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutridiet_custom_objectives', JSON.stringify(updatedCustom));
      }
    }

    setObjectiveToApply(trimmed);
    setNewObjectiveInput('');
    setIsAddObjectiveModalOpen(false);
    toast.success(`Objetivo "${trimmed}" adicionado e selecionado!`);
  };

  useEffect(() => {
    if (patientId) {
      const found = getPatientById(patientId);
      setPatient(found);
      setBodyAssessments(getPatientAssessmentsFromStorage(patientId));
      setNextEventDraft(found?.nextEvent ?? { date: '', type: 'assessment-update' });

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
  const consolidatedUpdates: ConsolidatedUpdate[] = useMemo(() => {
    const mapByDate = new Map<string, ConsolidatedUpdate>();

    dietHistory.forEach((diet) => {
      const key = normalizePatientDateKey(diet.date) ?? diet.date;
      const existing = mapByDate.get(key);
      mapByDate.set(key, { date: existing?.date ?? diet.date, diet, assessment: existing?.assessment });
    });

    bodyAssessments.forEach((assess) => {
      const key = normalizePatientDateKey(assess.date) ?? assess.date;
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

  const toggleRowExpansion = (date: string) => {
    setExpandedRowDate(expandedRowDate === date ? null : date);
  };

  const latestAssessment = useMemo(() => {
    return selectLatestAssessment(bodyAssessments);
  }, [bodyAssessments]);

  const activePlan = useMemo(() => selectActivePlan(dietHistory), [dietHistory]);

  if (!patient) {
    return (
      <div className="p-6 max-w-md mx-auto my-12 text-center">
        <Card className="bg-surface border-border-subtle rounded-surface p-8 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
            <AlertTriangle size={24} className="text-warning" />
          </div>
          <div>
            <h3 className="font-bold text-style-body text-text-primary">Paciente Não Encontrado</h3>
            <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
              O paciente solicitado não existe ou foi removido do sistema.
            </p>
          </div>
          <Link href="/pacientes" className="inline-block pt-2">
            <SecondaryActionButton icon={<ArrowLeft size={14} />}>
              Voltar para Pacientes
            </SecondaryActionButton>
          </Link>
        </Card>
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

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto gap-6">
      <PageContextHeader
        title="Perfil do paciente"
        backHref="/pacientes"
        backLabel="Voltar para Pacientes"
        breadcrumbs={[{ label: 'Pacientes', href: '/pacientes' }, { label: patient.name }]}
      />

      {/* Patient summary */}
      <Card className="bg-surface border-border-subtle rounded-surface p-0 overflow-hidden">
        <CardContent className="p-6 flex flex-col gap-6">
          {/* Row 1: Profile & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-divider pb-5">
            <div className="flex items-center gap-4">
              <Avatar initials={patient.initials} variant="charcoal" size="lg" className="rounded-surface font-bold text-style-subsection-title shrink-0 h-16 w-16" />
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-style-body-large text-text-primary tracking-tight">{patient.name}</h2>
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
                  <Badge variant="secondary" className="text-style-legal font-semibold whitespace-nowrap">
                    {patient.objective || 'Acompanhamento'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-style-legal text-text-muted" aria-label="Dados cadastrais">
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
                aria-label={whatsappUrl ? 'Abrir conversa no WhatsApp' : 'WhatsApp indisponÃ­vel: cadastre um nÃºmero'}
                onClick={() => {
                  if (whatsappUrl) {
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                WhatsApp
              </SecondaryActionButton>

              <div className="h-6 w-px bg-border-subtle hidden mx-1" />

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
              <h3 id="current-indicators-title" className="text-style-body-small font-semibold text-text-primary">
                Indicadores atuais
              </h3>
              <p className="text-style-legal text-text-muted">
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
              <section
                className="col-span-2 flex h-full items-center justify-between gap-3 rounded-control border border-border-divider bg-surface-subtle px-3 py-3"
                aria-label="Próximo acompanhamento"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Calendar size={12} strokeWidth={1.75} className={patient.nextEvent ? 'text-primary' : 'text-warning'} aria-hidden="true" />
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-style-legal font-semibold text-text-primary whitespace-nowrap">
                      Próximo acompanhamento
                    </span>
                    <span className="text-style-legal text-text-secondary truncate">
                      {nextEventSummary
                        ? `${nextEventSummary.date} · ${nextEventSummary.label}`
                        : 'Sem próximo evento'}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="compact"
                  onClick={handleOpenNextEventModal}
                  className="shrink-0 whitespace-nowrap"
                >
                  {patient.nextEvent ? 'Reagendar' : 'Definir acompanhamento'}
                </Button>
              </section>
            </div>
          </section>

        </CardContent>
      </Card>

      {/* Current plan and consultation history */}
      <Card className="bg-surface border-border-subtle rounded-surface p-0">
        <CardContent className="p-6 flex flex-col gap-6">
          <section aria-labelledby="current-plan-title" className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <h2 id="current-plan-title" className="text-style-section-title font-bold tracking-tight text-text-primary">
                Plano alimentar atual
              </h2>
              {activePlan && (
                <Badge variant="secondary" className="text-style-legal font-semibold text-success whitespace-nowrap">
                  Plano vigente
                </Badge>
              )}
            </div>
            <p className="text-style-legal text-text-muted">
              {activePlan
                ? `Resumo da dieta registrada em ${activePlan.date}.`
                : 'Nenhuma dieta ativa está vinculada a este paciente.'}
            </p>
          </div>

          {activePlan && (
            <div className="flex flex-col gap-2 border-t border-border-subtle pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-style-body-small font-semibold text-text-primary truncate">{activePlan.name}</p>
                  <p className="text-style-legal text-text-muted">Atualizado em {activePlan.date}</p>
                </div>
                <Button asChild variant="secondary" size="compact" className="shrink-0">
                  <Link href={`/pacientes/${patient.id}/dieta/${activePlan.dietId}`}>Abrir dieta</Link>
                </Button>
              </div>
              <p className="text-style-legal text-text-secondary" aria-label="Resumo de metas da dieta vigente">
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
          <section
            role="region"
            aria-labelledby="consultation-history-title"
            className="flex flex-col gap-4 border-t border-border-divider pt-6"
          >
            <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-text-secondary" />
              <div>
                <h2 id="consultation-history-title" className="font-bold text-style-body text-text-primary">Histórico de consultas</h2>
                <p className="text-style-legal text-text-muted">Dietas e avaliações físicas organizadas por data</p>
              </div>
            </div>
            <span className="text-style-legal text-text-muted whitespace-nowrap">
              {consolidatedUpdates.length === 1
                ? '1 consulta'
                : `${consolidatedUpdates.length} consultas`}
            </span>
          </div>

          {consolidatedUpdates.length === 0 ? (
            <p className="py-2 text-style-legal text-text-muted">
              Nenhum histórico registrado para este paciente até o momento.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border-subtle rounded-surface">
              <table aria-label="Histórico de consultas por data" className="w-full text-left text-style-legal border-collapse">
                <caption className="sr-only">Histórico de consultas por data</caption>
                <thead>
                  <tr className="bg-surface-subtle border-b border-border-subtle text-style-legal font-bold text-text-muted tracking-overline">
                    <th className="py-3 px-4">Data / Consulta</th>
                    <th className="py-3 px-4">Tipo de Registro</th>
                    <th className="py-3 px-4">Dados Dietéticos</th>
                    <th className="py-3 px-4">Valores Corporais</th>
                    <th className="py-3 px-4 text-right">Ação / Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/70">
                  {consolidatedUpdates.map((update) => {
                    const isExpanded = expandedRowDate === update.date;
                    const isActiveDietRow = update.diet?.status === 'Ativa';

                    return (
                      <React.Fragment key={update.date}>
                        <tr
                          className={`transition-colors border-l-4 ${
                            isActiveDietRow 
                              ? 'border-l-success bg-success/[0.04] hover:bg-success/[0.08]' 
                              : 'border-l-transparent hover:bg-surface-hover'
                          }`}
                        >
                          {/* Col 1: Date */}
                          <td className="py-3.5 px-4 font-bold text-text-primary whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-text-muted" />
                              <span>{update.date}</span>
                            </div>
                          </td>

                          {/* Col 2: Badges */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {update.diet && (
                                <Badge 
                                  variant="outline" 
                                  className="pointer-events-none bg-surface text-text-primary border-border-subtle font-semibold text-style-legal tracking-label px-2 py-0.5 shadow-none"
                                >
                                  Dieta
                                </Badge>
                              )}
                              {update.assessment && (
                                <Badge 
                                  variant="outline" 
                                  className="pointer-events-none bg-surface text-text-primary border-border-subtle font-semibold text-style-legal tracking-label px-2 py-0.5 shadow-none"
                                >
                                  Avaliação Física
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Col 3: Dietary Data */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {update.diet ? (
                              <div className="text-style-legal font-semibold flex items-center gap-1.5">
                                <span className="text-macro-protein font-bold">{update.diet.proteinG}g</span>
                                <span className="text-text-muted font-normal">•</span>
                                <span className="text-macro-carbohydrate font-bold">{update.diet.carbsG}g</span>
                                <span className="text-text-muted font-normal">•</span>
                                <span className="text-macro-fat font-bold">{update.diet.fatsG}g</span>
                                <span className="text-text-muted font-normal">•</span>
                                <span className="text-text-muted font-bold">{update.diet.targetKcal} kcal</span>
                              </div>
                            ) : (
                              <span className="text-text-muted/70 italic text-style-legal">Sem alteração dietética</span>
                            )}
                          </td>

                          {/* Col 4: Body Values */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {update.assessment ? (
                              <div className="text-style-legal font-bold text-text-primary flex items-center gap-1.5">
                                <span>{update.assessment.weightKg} kg</span>
                                <span className="text-text-muted font-normal">•</span>
                                <span>{update.assessment.bodyFatPercent}% BF</span>
                              </div>
                            ) : (
                              <span className="text-text-muted/70 italic text-style-legal">Sem medição corporal</span>
                            )}
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild variant="secondary" size="compact" onClick={(e) => e.stopPropagation()}>
                                <Link
                                  href={`/pacientes/${patient.id}/consulta/${encodeURIComponent(update.date.replace(/\//g, '-'))}`}
                                >
                                  <span>Abrir</span>
                                  <ChevronRight size={12} />
                                </Link>
                              </Button>
                              <IconButton
                                aria-label={isExpanded ? 'Recolher consulta' : 'Expandir consulta'}
                                aria-expanded={isExpanded}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(update.date);
                                }}
                                className="h-7 w-7 rounded-control text-text-muted hover:text-text-primary"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </IconButton>
                            </div>
                          </td>
                        </tr>

                        {/* Accordion Expanded Detail View */}
                        {isExpanded && (
                          <tr className="bg-surface-subtle/40">
                            <td colSpan={5} className="p-4 border-t border-b border-border-subtle/50">
                              <div className="grid grid-cols-1 gap-4">
                                {/* Diet Detail Card */}
                                {update.diet ? (
                                  <div className="p-4 bg-surface border border-border-subtle rounded-surface flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Utensils size={15} className="text-success" />
                                        <span className="font-bold text-text-primary text-style-legal">{update.diet.name}</span>
                                      </div>
                                      <Badge variant="secondary" className="text-style-legal font-bold">
                                        {update.diet.status}
                                      </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                      <MetricBox size="compact" label="Calorias" value={`${update.diet.targetKcal} kcal`} />
                                      <MetricBox size="compact" tone="protein" label="Proteínas" value={`${update.diet.proteinG}g`} />
                                      <MetricBox size="compact" tone="carbohydrate" label="Carbo" value={`${update.diet.carbsG}g`} />
                                      <MetricBox size="compact" tone="fat" label="Gorduras" value={`${update.diet.fatsG}g`} />
                                    </div>

                                    <div className="pt-2 flex items-center justify-between">
                                      <Button type="button" variant="primary" size="compact" onClick={() => handleOpenReadOnlyDietModal(update.diet!)}
                                      >
                                        <Eye size={14} />
                                        <span>Ver Dieta</span>
                                      </Button>
                                      <Link
                                        href={`/pacientes/${patient.id}/dieta/${update.diet.id}`}
                                        title="Editar no Construtor de Dietas"
                                      >
                                        <EditIconButton title="Editar no Construtor de Dietas" />
                                      </Link>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-surface/50 border border-dashed border-border-subtle rounded-surface flex items-center justify-center text-text-muted text-style-legal italic">
                                    Nenhuma prescrição dietética foi criada nesta data.
                                  </div>
                                )}

                                {/* Body Assessment Detail Card */}
                                {update.assessment ? (
                                  <div className="p-4 bg-surface border border-border-subtle rounded-surface flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Scale size={15} className="text-success" />
                                        <span className="font-bold text-text-primary text-style-legal">Avaliação Física & Valores</span>
                                      </div>
                                      <span className="text-style-legal font-bold text-success flex items-center gap-1">
                                        <TrendingDown size={11} />
                                        <span>Evolução Favorável</span>
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                      <MetricBox size="compact" label="Peso" value={`${update.assessment.weightKg} kg`} />
                                      <MetricBox size="compact" label="% Gordura" value={`${update.assessment.bodyFatPercent}%`} />
                                      <MetricBox size="compact" label="Massa Magra" value={`${update.assessment.muscleMassKg} kg`} />
                                      <MetricBox size="compact" label="Cintura" value={`${update.assessment.waistCm} cm`} />
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                      <EditIconButton onClick={() => handleOpenEditAssessment(update.assessment!)} title="Editar Avaliação Física" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-surface/50 border border-dashed border-border-subtle rounded-surface flex items-center justify-center text-text-muted text-style-legal italic">
                                    Nenhuma avaliação física foi realizada nesta data.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          </section>
        </CardContent>
      </Card>

      {/* Next event dialog */}
      <Dialog open={isNextEventModalOpen} onOpenChange={setIsNextEventModalOpen}>
        <DialogContent>
          <DialogHeader className="border-b border-border-divider pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Calendar strokeWidth={1.75} className="size-4 text-primary" aria-hidden="true" />
              <span>{patient.nextEvent ? 'Reagendar acompanhamento' : 'Definir próximo acompanhamento'}</span>
            </DialogTitle>
            <DialogDescription>
              Escolha a data e o tipo da próxima atualização deste paciente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNextEvent} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <DatePickerField
                id="next-event-date"
                label="Data"
                required
                value={nextEventDraft.date}
                onValueChange={(value) => setNextEventDraft((current) => ({ ...current, date: value }))}
              />

              <div className="flex flex-col gap-2">
                <label htmlFor="next-event-type" className={textStyle('field-label')}>
                  Tipo
                </label>
                <Select
                  value={nextEventDraft.type}
                  onValueChange={(value: PatientNextEventType) => setNextEventDraft((current) => ({ ...current, type: value }))}
                >
                  <SelectTrigger id="next-event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="!z-modal">
                    <SelectGroup>
                      <SelectItem value="assessment-update">Atualização de avaliação</SelectItem>
                      <SelectItem value="diet-update">Atualização de dieta</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="items-center">
              {patient.nextEvent && (
                <Button type="button" variant="quiet" size="standard" onClick={handleClearNextEvent} className="mr-auto">
                  Remover data
                </Button>
              )}
              <Button type="button" variant="secondary" size="standard" onClick={() => setIsNextEventModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="standard">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <EditPatientModal
        open={isEditModalOpen}
        patient={patient}
        objectives={customObjectives}
        objectiveToApply={objectiveToApply}
        onOpenChange={setIsEditModalOpen}
        onSave={handleSaveEdit}
        onRequestAddObjective={() => setIsAddObjectiveModalOpen(true)}
      />
      {/* Add Custom Objective Dialog Popup */}
      <Dialog open={isAddObjectiveModalOpen} onOpenChange={setIsAddObjectiveModalOpen}>
        <DialogContent className="bg-surface border-border-subtle p-5 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-2">
            <DialogTitle className="font-bold text-style-body-small text-text-primary flex items-center gap-1.5">
              <Plus size={16} className="text-success" />
              <span>Novo Objetivo</span>
            </DialogTitle>
            <DialogDescription className="text-style-legal text-text-muted">
              Digite um novo objetivo clínico ou esportivo para incluir na lista.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddNewObjective} className="flex flex-col gap-3 pt-2">
            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Descrição do Objetivo</label>
              <Input
                type="text"
                required
                autoFocus
                placeholder="Ex: Preparação para Maratona"
                value={newObjectiveInput}
                onChange={(e) => setNewObjectiveInput(e.target.value)}
                className="bg-surface-subtle border-border-subtle text-style-legal text-text-primary font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                onClick={() => {
                  setNewObjectiveInput('');
                  setIsAddObjectiveModalOpen(false);
                }}
                  variant="secondary"
                  size="compact"
                  className="flex-1 text-style-legal"
                >
                  Cancelar
                </Button>
              <Button
                type="submit"
                variant="primary"
                size="compact"
                className="flex-1 text-style-legal font-bold"
              >
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-error flex items-center gap-2">
              <AlertTriangle size={20} className="text-error" />
              <span>Confirmar Exclusão de Paciente</span>
            </DialogTitle>
            <DialogDescription className="text-style-legal text-text-muted pt-1">
              Esta ação é permanente e desfaz o cadastro deste paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 flex flex-col gap-2">
            <p className="text-style-legal text-text-primary leading-relaxed">
              Tem certeza que deseja excluir o paciente <strong className="font-bold text-text-primary">{patient.name}</strong>?
            </p>
            <p className="text-style-legal text-text-muted bg-error-soft border border-error-border rounded-surface p-3 text-error">
              ⚠️ Todos os dados cadastrais, prescrições de dietas e histórico de avaliações físicas associadas a este paciente serão removidos.
            </p>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              variant="secondary"
              size="compact"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeletePatient}
              variant="destructive"
              size="compact"
              className="flex-1"
            >
              Sim, Excluir Paciente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <EditAssessmentModal
        open={isEditAssessmentOpen}
        patient={patient}
        assessment={editingAssessment}
        mode={assessmentMode}
        onOpenChange={setIsEditAssessmentOpen}
        onSave={handleSaveAssessment}
      />

      {/* Read-Only Diet View Modal */}
      <ReadOnlyDietModal
        isOpen={isReadOnlyDietModalOpen}
        onClose={() => setIsReadOnlyDietModalOpen(false)}
        diet={selectedReadOnlyDiet}
        patientName={patient?.name}
      />
    </div>
  );
}
