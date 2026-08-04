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
  Flame, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Scale,
  Ruler,
  Pencil,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { Avatar, EditIconButton, DeleteIconButton, CreateButton, SecondaryActionButton, IconButton } from '@/components/atoms';
import { ReadOnlyDietModal, AutoKcalSection, MetricBox, DatePickerField } from '@/components/molecules';
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

function toComparableDate(value: string): string {
  const normalized = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) return normalized.slice(0, 10);

  const [day, month, year] = normalized.split(/[/-]/);
  if (day && month && year?.length === 4) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return normalized;
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
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isEditAssessmentOpen, setIsEditAssessmentOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<BodyAssessment | null>(null);
  const [isNextEventModalOpen, setIsNextEventModalOpen] = useState(false);
  const [nextEventDraft, setNextEventDraft] = useState<PatientNextEvent>({
    date: '',
    type: 'assessment-update',
  });
  const [isAddObjectiveModalOpen, setIsAddObjectiveModalOpen] = useState(false);
  const [newObjectiveInput, setNewObjectiveInput] = useState('');
  const [editFormData, setEditFormData] = useState<Patient | null>(null);

  // Read-Only Diet Modal state
  const [selectedReadOnlyDiet, setSelectedReadOnlyDiet] = useState<HistoricalDiet | null>(null);
  const [isReadOnlyDietModalOpen, setIsReadOnlyDietModalOpen] = useState(false);

  const handleOpenReadOnlyDietModal = (diet: HistoricalDiet) => {
    setSelectedReadOnlyDiet(diet);
    setIsReadOnlyDietModalOpen(true);
  };

  const handleOpenEditAssessment = (assessment: BodyAssessment) => {
    setEditingAssessment({ ...assessment });
    setIsEditAssessmentOpen(true);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssessment && patient) {
      const updatedAssessments = savePatientAssessmentToStorage(patient.id, editingAssessment);
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

  const availableObjectives = useMemo(() => {
    const currentObj = editFormData?.objective;
    const list = [...DEFAULT_OBJECTIVES, ...customObjectives];
    if (currentObj && !list.includes(currentObj)) {
      list.push(currentObj);
    }
    return Array.from(new Set(list.filter(Boolean)));
  }, [customObjectives, editFormData?.objective]);

  const hasUnsavedChanges = useMemo(() => {
    if (!editFormData || !patient) return false;
    return (
      editFormData.name !== patient.name ||
      editFormData.age !== patient.age ||
      editFormData.heightCm !== patient.heightCm ||
      editFormData.weightKg !== patient.weightKg ||
      (editFormData.gender || 'Masculino') !== (patient.gender || 'Masculino') ||
      (editFormData.objective || '') !== (patient.objective || '') ||
      editFormData.targetKcal !== patient.targetKcal ||
      editFormData.targetProtein !== patient.targetProtein ||
      editFormData.targetCarbs !== patient.targetCarbs ||
      editFormData.targetFats !== patient.targetFats
    );
  }, [editFormData, patient]);

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

    if (editFormData) {
      setEditFormData({ ...editFormData, objective: trimmed });
    }

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
    const mapByDate = new Map<string, { diet?: HistoricalDiet; assessment?: BodyAssessment }>();

    dietHistory.forEach((diet) => {
      const existing = mapByDate.get(diet.date) || {};
      mapByDate.set(diet.date, { ...existing, diet });
    });

    bodyAssessments.forEach((assess) => {
      const existing = mapByDate.get(assess.date) || {};
      mapByDate.set(assess.date, { ...existing, assessment: assess });
    });

    return Array.from(mapByDate.entries()).map(([date, data]) => ({
      date,
      diet: data.diet,
      assessment: data.assessment,
    }));
  }, [dietHistory, bodyAssessments]);

  const handleOpenEditModal = () => {
    if (patient) {
      setEditFormData({ ...patient });
      setIsEditModalOpen(true);
      setIsDiscardConfirmOpen(false);
    }
  };

  const handleAttemptCloseEditModal = () => {
    if (hasUnsavedChanges) {
      setIsDiscardConfirmOpen(true);
    } else {
      setIsEditModalOpen(false);
    }
  };

  const handleConfirmDiscard = () => {
    setIsDiscardConfirmOpen(false);
    setIsEditModalOpen(false);
    if (patient) {
      setEditFormData({ ...patient });
    }
  };

  const handleCancelDiscard = () => {
    setIsDiscardConfirmOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editFormData.name.trim()) return;

    const calculatedKcal = calculatePresetCalories(
      Number(editFormData.targetProtein),
      Number(editFormData.targetCarbs),
      Number(editFormData.targetFats)
    );

    const updatedData = {
      ...editFormData,
      targetKcal: calculatedKcal,
    };

    const saved = updatePatientInStorage(updatedData);
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
    return bodyAssessments.reduce<BodyAssessment | null>((latest, assessment) => {
      if (!latest) return assessment;
      return toComparableDate(assessment.date) > toComparableDate(latest.date) ? assessment : latest;
    }, null);
  }, [bodyAssessments]);

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

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto gap-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/pacientes"
            className="p-2 rounded-surface bg-surface border border-border-subtle hover:border-text-primary text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-style-legal font-bold text-text-muted tracking-overline">Pacientes / Perfil</span>
            <h1 className="font-bold text-style-subsection-title text-text-primary tracking-tight leading-none">Perfil do paciente</h1>
          </div>
        </div>
      </div>

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
                  setEditingAssessment({
                    id: `assessment-${Date.now()}`,
                    date: today,
                    weightKg: patient.weightKg,
                    bodyFatPercent: 0,
                    muscleMassKg: 0,
                    waistCm: 0,
                  });
                  setIsEditAssessmentOpen(true);
                }}
              >
                Nova Avaliação Física
              </SecondaryActionButton>

              <div className="h-6 w-px bg-border-subtle hidden mx-1" />

              <EditIconButton onClick={handleOpenEditModal} title="Editar Cadastro" />
              <DeleteIconButton onClick={() => setIsDeleteModalOpen(true)} title="Excluir Paciente" />
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

            <div className="grid grid-cols-4 divide-x divide-border-divider overflow-hidden rounded-control border border-border-divider bg-surface">
              <MetricBox
                size="standard"
                layout="split"
                surface="inline"
                icon={<Weight size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />}
                label="Peso atual"
                value={latestAssessment && latestAssessment.weightKg > 0 ? `${latestAssessment.weightKg} kg` : `${patient.weightKg} kg`}
                className="min-w-0 px-3 py-3"
              />
              <MetricBox
                size="standard"
                layout="split"
                surface="inline"
                icon={<Activity size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />}
                label="% de gordura"
                value={latestAssessment && latestAssessment.bodyFatPercent > 0 ? `${latestAssessment.bodyFatPercent}%` : 'Sem avaliação'}
                tone={latestAssessment && latestAssessment.bodyFatPercent > 0 ? 'default' : 'muted'}
                className="min-w-0 px-3 py-3"
              />
              <MetricBox
                size="standard"
                layout="split"
                surface="inline"
                icon={<Scale size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />}
                label="Massa magra"
                value={latestAssessment && latestAssessment.muscleMassKg > 0 ? `${latestAssessment.muscleMassKg} kg` : 'Sem avaliação'}
                tone={latestAssessment && latestAssessment.muscleMassKg > 0 ? 'default' : 'muted'}
                className="min-w-0 px-3 py-3"
              />
              <MetricBox
                size="standard"
                layout="split"
                surface="inline"
                icon={<Ruler size={12} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />}
                label="Cintura"
                value={latestAssessment && latestAssessment.waistCm > 0 ? `${latestAssessment.waistCm} cm` : 'Sem avaliação'}
                tone={latestAssessment && latestAssessment.waistCm > 0 ? 'default' : 'muted'}
                className="min-w-0 px-3 py-3"
              />
            </div>

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
                      {patient.nextEvent
                        ? `${patient.nextEvent.date.split('-').reverse().join('/')} · ${patient.nextEvent.type === 'diet-update' ? 'Atualização de dieta' : 'Atualização de avaliação'}`
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

      {/* Current nutrition targets */}
      <Card className="bg-surface border-border-subtle rounded-surface p-0">
        <CardContent className="p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-style-section-title font-bold tracking-tight text-text-primary">
              Metas nutricionais atuais
            </h2>
            <p className="text-style-legal text-text-muted mt-1 mb-3">
              Metas manuais usadas para orientar a prescrição diária.
            </p>
            <div className="grid grid-cols-4 gap-3">
              <MetricBox
                size="large"
                tone="muted"
                icon={<Flame size={12} className="text-success" />}
                label="Meta Kcal"
                value={`${patient.targetKcal} kcal`}
              />

              <MetricBox
                size="large"
                tone="protein"
                label="Proteína"
                value={`${patient.targetProtein}g`}
                caption={`${(patient.targetProtein / (patient.weightKg || 1)).toFixed(1)} g/kg`}
              />

              <MetricBox
                size="large"
                tone="carbohydrate"
                label="Carboidratos"
                value={`${patient.targetCarbs}g`}
                caption={`${(patient.targetCarbs / (patient.weightKg || 1)).toFixed(1)} g/kg`}
              />

              <MetricBox
                size="large"
                tone="fat"
                label="Gorduras"
                value={`${patient.targetFats}g`}
                caption={`${(patient.targetFats / (patient.weightKg || 1)).toFixed(1)} g/kg`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation history */}
      <Card className="bg-surface border-border-subtle rounded-surface p-0">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-divider pb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-success" />
              <div>
                <h2 className="font-bold text-style-body text-text-primary">Histórico de consultas</h2>
                <p className="text-style-legal text-text-muted">Dietas e avaliações físicas organizadas por data</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-style-legal font-bold px-2.5 py-1">
              {consolidatedUpdates.length === 1
                ? '1 consulta registrada'
                : `${consolidatedUpdates.length} consultas registradas`}
            </Badge>
          </div>

          {consolidatedUpdates.length === 0 ? (
            <div className="p-10 text-center bg-surface-subtle border border-border-subtle rounded-surface flex flex-col gap-3">
              <p className="text-style-legal text-text-muted">Nenhum histórico registrado para este paciente até o momento.</p>
              <div className="flex justify-center gap-3">
                <Button asChild variant="primary" size="standard">
                  <Link href={`/pacientes/${patient.id}/dieta/nova`}>
                    <Plus size={14} />
                    <span>Criar Dieta</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border-subtle rounded-surface">
              <table className="w-full text-left text-style-legal border-collapse">
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
                          onClick={() => toggleRowExpansion(update.date)}
                          className={`transition-colors cursor-pointer border-l-4 ${
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
        </CardContent>
      </Card>

      {/* Next event dialog */}
      <Dialog open={isNextEventModalOpen} onOpenChange={setIsNextEventModalOpen}>
        <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="flex items-center gap-2 font-bold text-style-body text-text-primary">
              <Calendar size={16} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
              <span>{patient.nextEvent ? 'Reagendar acompanhamento' : 'Definir próximo acompanhamento'}</span>
            </DialogTitle>
            <DialogDescription className="text-style-legal text-text-muted">
              Escolha a data e o tipo da próxima atualização deste paciente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNextEvent} className="flex flex-col gap-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <DatePickerField
                id="next-event-date"
                label="Data"
                required
                value={nextEventDraft.date}
                onValueChange={(value) => setNextEventDraft((current) => ({ ...current, date: value }))}
              />

              <div className="flex flex-col gap-1">
                <label htmlFor="next-event-type" className="text-style-legal font-semibold text-text-secondary">
                  Tipo
                </label>
                <Select
                  value={nextEventDraft.type}
                  onValueChange={(value: PatientNextEventType) => setNextEventDraft((current) => ({ ...current, type: value }))}
                >
                  <SelectTrigger id="next-event-type" className="h-10 bg-surface border-border-subtle text-style-legal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="assessment-update">Atualização de avaliação</SelectItem>
                      <SelectItem value="diet-update">Atualização de dieta</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex items-center gap-2 pt-2">
              {patient.nextEvent && (
                <Button type="button" variant="quiet" size="compact" onClick={handleClearNextEvent} className="mr-auto">
                  Remover data
                </Button>
              )}
              <Button type="button" variant="secondary" size="compact" onClick={() => setIsNextEventModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="compact">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (hasUnsavedChanges) {
              setIsDiscardConfirmOpen(true);
              return;
            }
          }
          setIsEditModalOpen(open);
        }}
      >
        <DialogContent
          className="bg-surface border-border-subtle p-6 rounded-surface"
          onPointerDownOutside={(e) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              setIsDiscardConfirmOpen(true);
            }
          }}
          onEscapeKeyDown={(e) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              setIsDiscardConfirmOpen(true);
            }
          }}
        >
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
              <Pencil size={18} className="text-success" />
              <span>Editar Dados do Paciente</span>
            </DialogTitle>
            <DialogDescription className="text-style-legal text-text-muted">
              Altere as informações cadastrais e metas do paciente.
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 pt-2">
              <div>
                <label className="text-style-legal font-bold text-text-primary block mb-1">Nome Completo do Paciente</label>
                <Input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-surface-subtle border-border-subtle text-style-legal text-text-primary font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-style-legal font-semibold text-text-muted block mb-1">Idade</label>
                  <Input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: Number(e.target.value) })}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold"
                  />
                </div>
                <div>
                  <label className="text-style-legal font-semibold text-text-muted block mb-1">Altura (cm)</label>
                  <Input
                    type="number"
                    value={editFormData.heightCm}
                    onChange={(e) => setEditFormData({ ...editFormData, heightCm: Number(e.target.value) })}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold"
                  />
                </div>
                <div>
                  <label className="text-style-legal font-semibold text-text-muted block mb-1">Peso (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    value={editFormData.weightKg}
                    onChange={(e) => setEditFormData({ ...editFormData, weightKg: Number(e.target.value) })}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-style-legal font-semibold text-text-muted block mb-1">Gênero</label>
                <Select
                  value={editFormData.gender || 'Masculino'}
                  onValueChange={(val) => setEditFormData({ ...editFormData, gender: val })}
                >
                  <SelectTrigger className="bg-surface-subtle border-border-subtle text-style-legal text-text-primary font-semibold h-9 w-full">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    {editFormData.gender && !['Masculino', 'Feminino'].includes(editFormData.gender) && (
                      <SelectItem value={editFormData.gender}>{editFormData.gender}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-style-legal font-bold text-text-primary block mb-1">Objetivo Clínico / Esportivo</label>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 min-w-0">
                    <Select
                      value={editFormData.objective || ''}
                      onValueChange={(val) => setEditFormData({ ...editFormData, objective: val })}
                    >
                      <SelectTrigger className="bg-surface-subtle border-border-subtle text-style-legal text-text-primary font-semibold h-9 w-full">
                        <SelectValue placeholder="Selecione o objetivo" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {availableObjectives.map((obj) => (
                          <SelectItem key={obj} value={obj}>
                            {obj}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SecondaryActionButton
                    type="button"
                    onClick={() => setIsAddObjectiveModalOpen(true)}
                    icon={<Plus size={14} className="text-success" />}
                    className="h-9 px-2.5 shrink-0"
                    title="Adicionar Novo Objetivo"
                  >
                    Novo
                  </SecondaryActionButton>
                </div>
              </div>

              <AutoKcalSection
                title="Metas & Cálculo Calórico"
                proteinG={editFormData.targetProtein}
                carbsG={editFormData.targetCarbs}
                fatsG={editFormData.targetFats}
                onProteinChange={(val) => setEditFormData({ ...editFormData, targetProtein: val })}
                onCarbsChange={(val) => setEditFormData({ ...editFormData, targetCarbs: val })}
                onFatsChange={(val) => setEditFormData({ ...editFormData, targetFats: val })}
              />


              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  onClick={handleAttemptCloseEditModal}
                  variant="secondary"
                  size="compact"
                  className="flex-1 text-style-legal"
                >
                  Cancelar
                </Button>

                <Button type="submit" variant="primary" size="compact" className="flex-1 text-style-legal font-bold">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Discarding Unsaved Edits */}
      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning shrink-0" />
              <span>Descartar alterações?</span>
            </DialogTitle>
            <DialogDescription className="text-style-legal text-text-muted pt-1">
              Você possui alterações não salvas nos dados do paciente. Deseja descartar as alterações e sair?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              size="compact"
              onClick={handleCancelDiscard}
            >
              Não
            </Button>
            <Button
              type="button"
              size="compact"
              onClick={handleConfirmDiscard}
              variant="destructive"
            >
              Sim, descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Tem certeza que deseja excluir o paciente <strong className="font-bold text-black">{patient.name}</strong>?
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
      {/* Edit Physical Assessment Dialog */}
      <Dialog open={isEditAssessmentOpen} onOpenChange={setIsEditAssessmentOpen}>
        <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
              <Scale size={18} className="text-success" />
              <span>Editar Avaliação Física</span>
            </DialogTitle>
            <DialogDescription className="text-style-legal text-text-muted">
              Atualize as medições corporais do paciente nesta data.
            </DialogDescription>
          </DialogHeader>

          {editingAssessment && (
            <form onSubmit={handleSaveAssessment} className="flex flex-col gap-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-style-legal font-semibold text-text-muted block mb-1">Peso Corporal (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.weightKg}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, weightKg: Number(e.target.value) })}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-style-legal font-semibold text-text-muted block mb-1">% Gordura Corporal (BF)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.bodyFatPercent}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, bodyFatPercent: Number(e.target.value) })}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-style-legal font-semibold text-text-muted block mb-1">Massa Magra (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.muscleMassKg}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, muscleMassKg: Number(e.target.value) })}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-style-legal font-semibold text-text-muted block mb-1">Cintura (cm)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.waistCm}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, waistCm: Number(e.target.value) })}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold text-text-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsEditAssessmentOpen(false)}
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
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
