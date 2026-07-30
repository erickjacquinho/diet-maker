'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Utensils,
  Activity,
  Scale,
  Weight,
  Flame,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  CheckCircle2,
  Printer,
  Sparkles,
  ClipboardList,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EditIconButton, CreateButton, SecondaryActionButton } from '@/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getPatientById,
  getConsultationRecord,
  Patient,
  ConsultationRecord,
  BodyAssessment
} from '@/lib/patientsStore';

export default function DedicatedConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const rawDate = params?.date as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState<ConsultationRecord | null>(null);
  const [expandedMealIndexes, setExpandedMealIndexes] = useState<number[]>([]);
  const [isEditAssessmentOpen, setIsEditAssessmentOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<BodyAssessment | null>(null);

  const toggleMealExpansion = (idx: number) => {
    setExpandedMealIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleOpenEditAssessment = () => {
    if (consultation?.assessment) {
      setEditingAssessment({ ...consultation.assessment });
      setIsEditAssessmentOpen(true);
    }
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssessment && consultation) {
      setConsultation({
        ...consultation,
        assessment: { ...editingAssessment },
      });
      setIsEditAssessmentOpen(false);
      toast.success('Avaliação física atualizada com sucesso!');
    }
  };

  useEffect(() => {
    if (patientId && rawDate) {
      const foundPatient = getPatientById(patientId);
      setPatient(foundPatient);

      const rec = getConsultationRecord(patientId, rawDate);
      setConsultation(rec);
    }
  }, [patientId, rawDate]);

  if (!patient || !consultation) {
    return (
      <div className="min-h-screen bg-warm-inner flex items-center justify-center p-6 text-warm-muted text-sm">
        <Card className="bg-warm-card border-warm-border rounded-2xl p-8 max-w-md mx-auto text-center space-y-4 shadow-sm">
          <h3 className="font-black text-base text-warm-charcoal">Registro de Consulta Não Encontrado</h3>
          <p className="text-xs text-warm-muted leading-relaxed">
            Não foi possível localizar o paciente ou o registro desta consulta.
          </p>
          <Link href="/pacientes" className="inline-block pt-2">
            <SecondaryActionButton icon={<ArrowLeft size={14} />}>
              Voltar para Pacientes
            </SecondaryActionButton>
          </Link>
        </Card>
      </div>
    );
  }

  const heightM = patient.heightCm / 100;
  const currentWeight = consultation.assessment?.weightKg || patient.weightKg;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);

  return (
    <div className="min-h-screen bg-warm-inner text-warm-charcoal p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-warm-card border border-warm-border p-4 md:p-5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            href={`/pacientes/${patient.id}`}
            className="p-2 rounded-xl bg-warm-inner border border-warm-border text-warm-muted hover:text-warm-charcoal hover:border-warm-charcoal transition-colors"
            title="Voltar para a Ficha do Paciente"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center space-x-2">
              <Calendar size={15} className="text-warm-emerald" />
              <h1 className="font-black text-lg text-warm-charcoal">
                Registro de Consulta — {consultation.date}
              </h1>
            </div>
            <p className="text-xs text-warm-muted font-medium">
              Paciente: <strong className="text-warm-charcoal font-bold">{patient.name}</strong> • {patient.age} anos • {patient.objective}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SecondaryActionButton
            onClick={() => toast.info('Função de impressão/exportação acionada')}
            icon={<Printer size={14} className="text-warm-muted" />}
          >
            Imprimir Prontuário
          </SecondaryActionButton>

          {consultation.diet && (
            <Link href={`/pacientes/${patient.id}/dieta/${consultation.diet.id}`}>
              <CreateButton icon={<Utensils size={14} />}>
                Abrir no Construtor de Dietas
              </CreateButton>
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Physical Assessment & Dietary Prescription */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Prescrição Dietética da Consulta */}
          {consultation.diet ? (
            <Card className="bg-warm-card border-warm-border shadow-sm rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-warm-border bg-warm-inner/40 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-warm-emerald/10 text-warm-emerald">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-warm-charcoal">{consultation.diet.name}</h2>
                    <span className="text-[11px] text-warm-muted">Prescrição calculada para o ciclo atual</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="bg-warm-card text-warm-charcoal border-warm-border font-semibold text-[10px] px-2.5 py-0.5"
                  >
                    Dieta
                  </Badge>
                  <Link
                    href={`/pacientes/${patient.id}/dieta/${consultation.diet.id}`}
                    title="Editar Dieta"
                  >
                    <EditIconButton title="Editar Dieta" />
                  </Link>
                </div>
              </div>

              <CardContent className="p-5 space-y-5">
                {/* Macro Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">Meta Calórica</span>
                    <span className="font-bold text-sm text-warm-muted">{consultation.diet.targetKcal} kcal</span>
                  </div>
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">Proteínas</span>
                    <span className="font-black text-sm text-blue-600">{consultation.diet.proteinG}g</span>
                  </div>
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">Carboidratos</span>
                    <span className="font-black text-sm text-orange-500">{consultation.diet.carbsG}g</span>
                  </div>
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">Gorduras</span>
                    <span className="font-black text-sm text-emerald-700">{consultation.diet.fatsG}g</span>
                  </div>
                </div>

                {/* Meals Breakdown List */}
                {consultation.diet.meals && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-warm-charcoal uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles size={13} className="text-warm-emerald" />
                      <span>Refeições Programadas da Consulta</span>
                    </h3>

                    <div className="space-y-2">
                      {consultation.diet.meals.map((meal, idx) => {
                        const isExpanded = expandedMealIndexes.includes(idx);
                        return (
                          <div
                            key={idx}
                            className="bg-warm-inner/70 border border-warm-border rounded-xl overflow-hidden transition-all duration-200"
                          >
                            <div
                              onClick={() => toggleMealExpansion(idx)}
                              className="p-3 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-warm-inner transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-warm-charcoal">{meal.name}</span>
                                <span className="text-[10px] font-semibold text-warm-muted bg-warm-card px-2 py-0.5 rounded-md border border-warm-border">
                                  {meal.time}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 text-xs">
                                <div className="text-warm-muted font-medium text-[11px] flex items-center space-x-1.5">
                                  <span className="text-blue-600 font-bold">{meal.proteinG}g</span>
                                  <span>•</span>
                                  <span className="text-orange-500 font-bold">{meal.carbsG}g</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-bold">{meal.fatsG}g</span>
                                </div>
                                <span className="font-semibold text-xs text-warm-muted bg-warm-inner border border-warm-border px-2.5 py-1 rounded-lg">
                                  {meal.kcal} kcal
                                </span>
                                <div className="text-warm-muted hover:text-warm-charcoal transition-colors">
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="px-3.5 pb-3.5 pt-2 border-t border-warm-border/60 bg-warm-card/60 space-y-2">
                                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-warm-muted uppercase tracking-wider">
                                  <Utensils size={12} className="text-warm-emerald" />
                                  <span>Composição e Alimentos da Refeição</span>
                                </div>
                                <p className="text-xs text-warm-charcoal leading-relaxed bg-warm-inner p-2.5 rounded-lg border border-warm-border/70">
                                  {meal.itemsSummary || 'Alimentos selecionados de acordo com o plano nutricional.'}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-warm-card border border-dashed border-warm-border p-6 rounded-2xl text-center space-y-2">
              <Utensils size={24} className="mx-auto text-warm-muted/50" />
              <p className="text-xs text-warm-muted italic">Nenhuma prescrição dietética foi associada a este dia de consulta.</p>
            </Card>
          )}

          {/* Card 2: Avaliação Física & Composição Corporal */}
          {consultation.assessment ? (
            <Card className="bg-warm-card border-warm-border shadow-sm rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-warm-border bg-warm-inner/40 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <Scale size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-warm-charcoal">Avaliação Física & Antropometria</h2>
                    <span className="text-[11px] text-warm-muted">Medições corporais efetuadas nesta consulta</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-warm-emerald flex items-center space-x-1 bg-warm-emerald/10 px-2.5 py-1 rounded-lg">
                    <TrendingDown size={12} />
                    <span>Evolução Favorável</span>
                  </span>
                  <EditIconButton onClick={handleOpenEditAssessment} title="Editar Avaliação Física" />
                </div>
              </div>

              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">Peso Corporal</span>
                    <span className="font-black text-sm text-warm-charcoal">{consultation.assessment.weightKg} kg</span>
                  </div>
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">% Gordura (BF)</span>
                    <span className="font-black text-sm text-warm-charcoal">{consultation.assessment.bodyFatPercent}%</span>
                  </div>
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">Massa Magra</span>
                    <span className="font-black text-sm text-warm-charcoal">{consultation.assessment.muscleMassKg} kg</span>
                  </div>
                  <div className="p-3 bg-warm-inner border border-warm-border/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">Cintura</span>
                    <span className="font-black text-sm text-warm-charcoal">{consultation.assessment.waistCm} cm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-warm-card border border-dashed border-warm-border p-6 rounded-2xl text-center space-y-2">
              <Activity size={24} className="mx-auto text-warm-muted/50" />
              <p className="text-xs text-warm-muted italic">Nenhuma medição física foi registrada nesta consulta.</p>
            </Card>
          )}

        </div>

        {/* Right 1 Column: Clinical Notes & Summary Sidecard */}
        <div className="space-y-6">
          
          {/* Card 3: Anotações & Prontuário da Consulta */}
          <Card className="bg-warm-card border-warm-border shadow-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-warm-border pb-3">
              <ClipboardList size={16} className="text-warm-emerald" />
              <h3 className="font-bold text-xs text-warm-charcoal uppercase tracking-wider">
                Prontuário & Conduta Nutricional
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-warm-muted block mb-1">Evolução Clínica</span>
                <p className="text-xs text-warm-charcoal leading-relaxed bg-warm-inner p-3 rounded-xl border border-warm-border">
                  {consultation.notes}
                </p>
              </div>

              {consultation.prescribedSupplements && consultation.prescribedSupplements.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-warm-muted block">Suplementação Prescrita</span>
                  <div className="space-y-1.5">
                    {consultation.prescribedSupplements.map((supp, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-warm-charcoal">
                        <CheckCircle2 size={13} className="text-warm-emerald shrink-0" />
                        <span>{supp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Metrics Summary */}
          <Card className="bg-warm-card border-warm-border shadow-sm rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-warm-charcoal uppercase tracking-wider">
              Resumo Diagnóstico
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-warm-border/60">
                <span className="text-warm-muted font-medium">Índice de Massa Corporal (IMC)</span>
                <span className="font-bold text-warm-charcoal">{bmi} kg/m²</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-warm-border/60">
                <span className="text-warm-muted font-medium">Status do Plano</span>
                <span className="font-bold text-warm-emerald">{consultation.diet?.status || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-warm-muted font-medium">Data do Registro</span>
                <span className="font-bold text-warm-charcoal">{consultation.date}</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Edit Physical Assessment Dialog */}
      <Dialog open={isEditAssessmentOpen} onOpenChange={setIsEditAssessmentOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-bold text-base text-warm-charcoal flex items-center space-x-2">
              <Scale size={18} className="text-warm-emerald" />
              <span>Editar Medidas da Avaliação Física</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-warm-muted">
              Atualize as medições corporais efetuadas nesta consulta.
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
    </div>
  );
}
