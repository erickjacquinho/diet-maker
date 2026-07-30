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
  Flame, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Scale,
  Pencil,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { Avatar, EditIconButton, DeleteIconButton, CreateButton, SecondaryActionButton } from '@/components/atoms';
import { ReadOnlyDietModal, AutoKcalSection } from '@/components/molecules';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
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
  Patient,
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

interface BodyAssessment {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercent: number;
  muscleMassKg: number;
  waistCm: number;
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
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isEditAssessmentOpen, setIsEditAssessmentOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<BodyAssessment | null>(null);
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
    if (editingAssessment) {
      setBodyAssessments((prev) =>
        prev.map((a) => (a.id === editingAssessment.id ? editingAssessment : a))
      );
      setIsEditAssessmentOpen(false);
      toast.success('Avaliação física atualizada com sucesso!');
    }
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

  if (!patient) {
    return (
      <div className="p-6 md:p-8 max-w-md mx-auto my-12 text-center">
        <Card className="bg-warm-card border-warm-border rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-warm-inner border border-warm-border flex items-center justify-center mx-auto text-warm-muted">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-black text-base text-warm-charcoal">Paciente Não Encontrado</h3>
            <p className="text-xs text-warm-muted mt-1 leading-relaxed">
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

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/pacientes"
            className="p-2 rounded-xl bg-warm-card border border-warm-border hover:border-warm-charcoal text-warm-muted hover:text-warm-charcoal transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider">Prontuário do Paciente</span>
            <h1 className="font-black text-xl text-warm-charcoal tracking-tight leading-none">{patient.name}</h1>
          </div>
        </div>
      </div>

      {/* 1-COLUMN LAYOUT: INTEGRATED PATIENT HEADER CARD */}
      <Card className="bg-warm-card border-warm-border rounded-2xl p-0 shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-6">
          {/* Row 1: Profile & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-warm-border/70 pb-5">
            <div className="flex items-center space-x-4">
              <Avatar initials={patient.initials} variant="charcoal" size="lg" className="rounded-2xl font-black text-xl shrink-0 h-16 w-16" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="font-black text-lg text-warm-charcoal tracking-tight">{patient.name}</h2>
                  <Badge variant="outline" className="text-[10px] font-bold border-warm-border text-warm-muted">
                    {patient.gender}
                  </Badge>
                </div>
                <div className="text-xs font-medium text-warm-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{patient.age} anos</span>
                  <span>•</span>
                  <span>{patient.heightCm} cm</span>
                  <span>•</span>
                  <span>Objetivo: <strong className="font-bold text-warm-charcoal">{patient.objective || 'Acompanhamento'}</strong></span>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
              <Link href={`/pacientes/${patient.id}/dieta/nova`}>
                <CreateButton>Nova Dieta</CreateButton>
              </Link>

              <SecondaryActionButton icon={<Activity size={14} className="text-warm-emerald" />}>
                Nova Avaliação Física
              </SecondaryActionButton>

              <div className="h-6 w-px bg-warm-border hidden sm:block mx-1" />

              <EditIconButton onClick={handleOpenEditModal} title="Editar Cadastro" />
              <DeleteIconButton onClick={() => setIsDeleteModalOpen(true)} title="Excluir Paciente" />
            </div>
          </div>

          {/* Row 2: Active Target Macros & Current Indicators */}
          <div>
            <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block mb-2.5">
              Metas Manuais & Indicadores Atuais
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl text-center sm:text-left">
                <div className="text-[10px] font-bold text-warm-muted uppercase flex items-center justify-center sm:justify-start space-x-1">
                  <Weight size={12} className="text-warm-charcoal" />
                  <span>Peso Atual</span>
                </div>
                <div className="font-black text-base text-warm-charcoal mt-0.5">{patient.weightKg} kg</div>
              </div>

              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl text-center sm:text-left">
                <div className="text-[10px] font-bold text-warm-muted uppercase flex items-center justify-center sm:justify-start space-x-1">
                  <Flame size={12} className="text-warm-emerald" />
                  <span>Meta Kcal</span>
                </div>
                <div className="font-bold text-base text-warm-muted mt-0.5">{patient.targetKcal} kcal</div>
              </div>

              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl text-center sm:text-left">
                <div className="text-[10px] font-bold text-warm-muted uppercase">Proteína</div>
                <div className="font-black text-base text-blue-600 mt-0.5">{patient.targetProtein}g</div>
                <span className="text-[9px] font-semibold text-warm-muted block">
                  {(patient.targetProtein / (patient.weightKg || 1)).toFixed(1)} g/kg
                </span>
              </div>

              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl text-center sm:text-left">
                <div className="text-[10px] font-bold text-warm-muted uppercase">Carboidratos</div>
                <div className="font-black text-base text-orange-500 mt-0.5">{patient.targetCarbs}g</div>
                <span className="text-[9px] font-semibold text-warm-muted block">
                  {(patient.targetCarbs / (patient.weightKg || 1)).toFixed(1)} g/kg
                </span>
              </div>

              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl text-center sm:text-left col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold text-warm-muted uppercase">Gorduras</div>
                <div className="font-black text-base text-emerald-700 mt-0.5">{patient.targetFats}g</div>
                <span className="text-[9px] font-semibold text-warm-muted block">
                  {(patient.targetFats / (patient.weightKg || 1)).toFixed(1)} g/kg
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1-COLUMN LAYOUT: TABELA UNIFICADA INTELIGENTE POR CONSULTA / DATA */}
      <Card className="bg-warm-card border-warm-border rounded-2xl p-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-warm-border/70 pb-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet size={18} className="text-warm-emerald" />
              <div>
                <h3 className="font-black text-base text-warm-charcoal">Atualizações de Consulta & Histórico Unificado</h3>
                <p className="text-xs text-warm-muted">Tabela combinada com prescrições dietéticas e avaliações físicas por data</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1">
              {consolidatedUpdates.length} consultas registradas
            </Badge>
          </div>

          {consolidatedUpdates.length === 0 ? (
            <div className="p-10 text-center bg-warm-inner border border-warm-border rounded-xl space-y-3">
              <p className="text-xs text-warm-muted">Nenhum histórico registrado para este paciente até o momento.</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href={`/pacientes/${patient.id}/dieta/nova`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-warm-charcoal text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                >
                  <Plus size={14} />
                  <span>Criar Dieta</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-warm-border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-warm-inner border-b border-warm-border text-[11px] font-bold text-warm-muted uppercase tracking-wider">
                    <th className="py-3 px-4">Data / Consulta</th>
                    <th className="py-3 px-4">Tipo de Registro</th>
                    <th className="py-3 px-4">Dados Dietéticos</th>
                    <th className="py-3 px-4">Valores Corporais</th>
                    <th className="py-3 px-4 text-right">Ação / Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border/70">
                  {consolidatedUpdates.map((update) => {
                    const isExpanded = expandedRowDate === update.date;
                    const isActiveDietRow = update.diet?.status === 'Ativa';

                    return (
                      <React.Fragment key={update.date}>
                        <tr 
                          onClick={() => toggleRowExpansion(update.date)}
                          className={`transition-colors cursor-pointer border-l-4 ${
                            isActiveDietRow 
                              ? 'border-l-warm-emerald bg-warm-emerald/[0.04] hover:bg-warm-emerald/[0.08]' 
                              : 'border-l-transparent hover:bg-warm-inner/60'
                          }`}
                        >
                          {/* Col 1: Date */}
                          <td className="py-3.5 px-4 font-bold text-warm-charcoal whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar size={13} className="text-warm-muted" />
                              <span>{update.date}</span>
                            </div>
                          </td>

                          {/* Col 2: Badges */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              {update.diet && (
                                <Badge 
                                  variant="outline" 
                                  className="pointer-events-none bg-warm-card text-warm-charcoal border-warm-border font-semibold text-[10px] tracking-wide px-2 py-0.5 shadow-none"
                                >
                                  Dieta
                                </Badge>
                              )}
                              {update.assessment && (
                                <Badge 
                                  variant="outline" 
                                  className="pointer-events-none bg-warm-card text-warm-charcoal border-warm-border font-semibold text-[10px] tracking-wide px-2 py-0.5 shadow-none"
                                >
                                  Avaliação Física
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Col 3: Dietary Data */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {update.diet ? (
                              <div className="text-xs font-semibold flex items-center space-x-1.5">
                                <span className="text-blue-600 font-bold">{update.diet.proteinG}g</span>
                                <span className="text-warm-muted font-normal">•</span>
                                <span className="text-orange-500 font-bold">{update.diet.carbsG}g</span>
                                <span className="text-warm-muted font-normal">•</span>
                                <span className="text-emerald-700 font-bold">{update.diet.fatsG}g</span>
                                <span className="text-warm-muted font-normal">•</span>
                                <span className="text-warm-muted font-bold">{update.diet.targetKcal} kcal</span>
                              </div>
                            ) : (
                              <span className="text-warm-muted/70 italic text-[11px]">Sem alteração dietética</span>
                            )}
                          </td>

                          {/* Col 4: Body Values */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {update.assessment ? (
                              <div className="text-xs font-bold text-warm-charcoal flex items-center space-x-1.5">
                                <span>{update.assessment.weightKg} kg</span>
                                <span className="text-warm-muted font-normal">•</span>
                                <span>{update.assessment.bodyFatPercent}% BF</span>
                              </div>
                            ) : (
                              <span className="text-warm-muted/70 italic text-[11px]">Sem medição corporal</span>
                            )}
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/pacientes/${patient.id}/consulta/${encodeURIComponent(update.date.replace(/\//g, '-'))}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-warm-inner border border-warm-border text-warm-charcoal font-bold text-[11px] hover:border-warm-charcoal transition-colors"
                              >
                                <span>Abrir</span>
                                <ChevronRight size={12} />
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(update.date);
                                }}
                                className="h-7 w-7 p-0 rounded-lg text-warm-muted hover:text-warm-charcoal"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Accordion Expanded Detail View */}
                        {isExpanded && (
                          <tr className="bg-warm-inner/40">
                            <td colSpan={5} className="p-4 border-t border-b border-warm-border/50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Diet Detail Card */}
                                {update.diet ? (
                                  <div className="p-4 bg-warm-card border border-warm-border rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Utensils size={15} className="text-warm-emerald" />
                                        <span className="font-bold text-warm-charcoal text-xs">{update.diet.name}</span>
                                      </div>
                                      <Badge variant="secondary" className="text-[9px] font-extrabold">
                                        {update.diet.status}
                                      </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">Calorias</span>
                                        <span className="font-black text-xs text-warm-charcoal">{update.diet.targetKcal} kcal</span>
                                      </div>
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">Proteínas</span>
                                        <span className="font-black text-xs text-blue-600">{update.diet.proteinG}g</span>
                                      </div>
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">Carbo</span>
                                        <span className="font-black text-xs text-orange-500">{update.diet.carbsG}g</span>
                                      </div>
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">Gorduras</span>
                                        <span className="font-black text-xs text-emerald-700">{update.diet.fatsG}g</span>
                                      </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReadOnlyDietModal(update.diet!)}
                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-warm-charcoal text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                                      >
                                        <Eye size={14} />
                                        <span>Ver Dieta</span>
                                      </button>
                                      <Link
                                        href={`/pacientes/${patient.id}/dieta/${update.diet.id}`}
                                        title="Editar no Construtor de Dietas"
                                      >
                                        <EditIconButton title="Editar no Construtor de Dietas" />
                                      </Link>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-warm-card/50 border border-dashed border-warm-border rounded-xl flex items-center justify-center text-warm-muted text-xs italic">
                                    Nenhuma prescrição dietética foi criada nesta data.
                                  </div>
                                )}

                                {/* Body Assessment Detail Card */}
                                {update.assessment ? (
                                  <div className="p-4 bg-warm-card border border-warm-border rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Scale size={15} className="text-warm-emerald" />
                                        <span className="font-bold text-warm-charcoal text-xs">Avaliação Física & Valores</span>
                                      </div>
                                      <span className="text-[10px] font-bold text-warm-emerald flex items-center space-x-1">
                                        <TrendingDown size={11} />
                                        <span>Evolução Favorável</span>
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">Peso</span>
                                        <span className="font-black text-xs text-warm-charcoal">{update.assessment.weightKg} kg</span>
                                      </div>
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">% Gordura</span>
                                        <span className="font-black text-xs text-warm-charcoal">{update.assessment.bodyFatPercent}%</span>
                                      </div>
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">Massa Magra</span>
                                        <span className="font-black text-xs text-warm-charcoal">{update.assessment.muscleMassKg} kg</span>
                                      </div>
                                      <div className="p-2 bg-warm-inner rounded-lg">
                                        <span className="text-[9px] font-bold text-warm-muted block uppercase">Cintura</span>
                                        <span className="font-black text-xs text-warm-charcoal">{update.assessment.waistCm} cm</span>
                                      </div>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                      <EditIconButton onClick={() => handleOpenEditAssessment(update.assessment!)} title="Editar Avaliação Física" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-warm-card/50 border border-dashed border-warm-border rounded-xl flex items-center justify-center text-warm-muted text-xs italic">
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
          className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl"
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
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal flex items-center space-x-2">
              <Pencil size={18} className="text-warm-emerald" />
              <span>Editar Dados do Paciente</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted">
              Altere as informações cadastrais e metas do paciente.
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-warm-charcoal block mb-1">Nome Completo do Paciente</label>
                <Input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-warm-inner border-warm-border text-xs text-warm-charcoal font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-warm-muted block mb-1">Idade</label>
                  <Input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: Number(e.target.value) })}
                    className="bg-warm-inner border-warm-border text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-warm-muted block mb-1">Altura (cm)</label>
                  <Input
                    type="number"
                    value={editFormData.heightCm}
                    onChange={(e) => setEditFormData({ ...editFormData, heightCm: Number(e.target.value) })}
                    className="bg-warm-inner border-warm-border text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-warm-muted block mb-1">Peso (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    value={editFormData.weightKg}
                    onChange={(e) => setEditFormData({ ...editFormData, weightKg: Number(e.target.value) })}
                    className="bg-warm-inner border-warm-border text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-warm-muted block mb-1">Gênero</label>
                <Select
                  value={editFormData.gender || 'Masculino'}
                  onValueChange={(val) => setEditFormData({ ...editFormData, gender: val })}
                >
                  <SelectTrigger className="bg-warm-inner border-warm-border text-xs text-warm-charcoal font-semibold h-9 w-full">
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
                <label className="text-xs font-bold text-warm-charcoal block mb-1">Objetivo Clínico / Esportivo</label>
                <div className="flex items-center space-x-1.5">
                  <div className="flex-1 min-w-0">
                    <Select
                      value={editFormData.objective || ''}
                      onValueChange={(val) => setEditFormData({ ...editFormData, objective: val })}
                    >
                      <SelectTrigger className="bg-warm-inner border-warm-border text-xs text-warm-charcoal font-semibold h-9 w-full">
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
                    icon={<Plus size={14} className="text-warm-emerald" />}
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


              <div className="pt-2 flex space-x-2">
                <Button
                  type="button"
                  onClick={handleAttemptCloseEditModal}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Cancelar
                </Button>

                <Button type="submit" variant="emerald" size="sm" className="flex-1 text-xs font-bold">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Discarding Unsaved Edits */}
      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent className="sm:max-w-sm bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-black text-base text-warm-charcoal flex items-center space-x-2">
              <AlertTriangle size={18} className="text-amber-500 shrink-0" />
              <span>Descartar alterações?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted pt-1">
              Você possui alterações não salvas nos dados do paciente. Deseja descartar as alterações e sair?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex space-x-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCancelDiscard}
              className="text-xs font-semibold"
            >
              Não
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDiscard}
              variant="destructive"
              className="text-xs font-bold bg-red-600 text-white hover:bg-red-700"
            >
              Sim, descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Objective Dialog Popup */}
      <Dialog open={isAddObjectiveModalOpen} onOpenChange={setIsAddObjectiveModalOpen}>
        <DialogContent className="sm:max-w-xs bg-warm-card border-warm-border p-5 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-2">
            <DialogTitle className="font-bold text-sm text-warm-charcoal flex items-center space-x-1.5">
              <Plus size={16} className="text-warm-emerald" />
              <span>Novo Objetivo</span>
            </DialogTitle>
            <DialogDescription className="text-[11px] text-warm-muted">
              Digite um novo objetivo clínico ou esportivo para incluir na lista.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddNewObjective} className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-warm-charcoal block mb-1">Descrição do Objetivo</label>
              <Input
                type="text"
                required
                autoFocus
                placeholder="Ex: Preparação para Maratona"
                value={newObjectiveInput}
                onChange={(e) => setNewObjectiveInput(e.target.value)}
                className="bg-warm-inner border-warm-border text-xs text-warm-charcoal font-semibold"
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <Button
                type="button"
                onClick={() => {
                  setNewObjectiveInput('');
                  setIsAddObjectiveModalOpen(false);
                }}
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="emerald"
                size="sm"
                className="flex-1 text-xs font-bold"
              >
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-rose-600 flex items-center space-x-2">
              <AlertTriangle size={20} className="text-rose-600" />
              <span>Confirmar Exclusão de Paciente</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted pt-1">
              Esta ação é permanente e desfaz o cadastro deste paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <p className="text-xs text-warm-charcoal leading-relaxed">
              Tem certeza que deseja excluir o paciente <strong className="font-bold text-black">{patient.name}</strong>?
            </p>
            <p className="text-[11px] text-warm-muted bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800">
              ⚠️ Todos os dados cadastrais, prescrições de dietas e histórico de avaliações físicas associadas a este paciente serão removidos.
            </p>
          </div>

          <div className="flex space-x-2 pt-2 border-t border-warm-border">
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              variant="secondary"
              size="sm"
              className="flex-1 text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeletePatient}
              variant="destructive"
              size="sm"
              className="flex-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Sim, Excluir Paciente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Physical Assessment Dialog */}
      <Dialog open={isEditAssessmentOpen} onOpenChange={setIsEditAssessmentOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-bold text-base text-warm-charcoal flex items-center space-x-2">
              <Scale size={18} className="text-warm-emerald" />
              <span>Editar Avaliação Física</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted">
              Atualize as medições corporais do paciente nesta data.
            </DialogDescription>
          </DialogHeader>

          {editingAssessment && (
            <form onSubmit={handleSaveAssessment} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-warm-muted block mb-1">Peso Corporal (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.weightKg}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, weightKg: Number(e.target.value) })}
                    className="bg-warm-inner border-warm-border text-xs font-bold text-warm-charcoal"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-warm-muted block mb-1">% Gordura Corporal (BF)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.bodyFatPercent}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, bodyFatPercent: Number(e.target.value) })}
                    className="bg-warm-inner border-warm-border text-xs font-bold text-warm-charcoal"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-warm-muted block mb-1">Massa Magra (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.muscleMassKg}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, muscleMassKg: Number(e.target.value) })}
                    className="bg-warm-inner border-warm-border text-xs font-bold text-warm-charcoal"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-warm-muted block mb-1">Cintura (cm)</label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={editingAssessment.waistCm}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, waistCm: Number(e.target.value) })}
                    className="bg-warm-inner border-warm-border text-xs font-bold text-warm-charcoal"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsEditAssessmentOpen(false)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  className="flex-1 text-xs font-bold"
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
