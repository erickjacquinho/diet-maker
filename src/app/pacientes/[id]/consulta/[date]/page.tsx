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
      <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-6 text-text-muted text-style-body-small">
        <Card className="bg-surface border-border-subtle rounded-surface p-8 max-w-md mx-auto text-center flex flex-col gap-4 shadow-floating">
          <h3 className="font-bold text-style-body text-text-primary">Registro de Consulta Não Encontrado</h3>
          <p className="text-style-legal text-text-muted leading-relaxed">
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
    <div className="min-h-screen bg-surface-subtle text-text-primary p-4 p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex flex-col flex-row items-center justify-between gap-4 bg-surface border border-border-subtle p-4 p-5 rounded-surface shadow-floating">
        <div className="flex items-center gap-3">
          <Link
            href={`/pacientes/${patient.id}`}
            className="p-2 rounded-control bg-surface-subtle border border-border-subtle text-text-muted hover:text-text-primary hover:border-text-primary transition-colors"
            title="Voltar para a Ficha do Paciente"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-success" />
              <h1 className="font-bold text-style-body-large text-text-primary">
                Registro de Consulta — {consultation.date}
              </h1>
            </div>
            <p className="text-style-legal text-text-muted font-medium">
              Paciente: <strong className="text-text-primary font-bold">{patient.name}</strong> • {patient.age} anos • {patient.objective}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryActionButton
            onClick={() => toast.info('Função de impressão/exportação acionada')}
            icon={<Printer size={14} className="text-text-muted" />}
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
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Card 1: Prescrição Dietética da Consulta */}
          {consultation.diet ? (
            <Card className="bg-surface border-border-subtle shadow-floating rounded-surface overflow-hidden">
              <div className="p-5 border-b border-border-subtle bg-surface-subtle/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-control bg-success/10 text-success">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-style-body-small text-text-primary">{consultation.diet.name}</h2>
                    <span className="text-style-legal text-text-muted">Prescrição calculada para o ciclo atual</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-surface text-text-primary border-border-subtle font-semibold text-style-legal px-2.5 py-0.5"
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

              <CardContent className="p-5 flex flex-col gap-5">
                {/* Macro Summary Grid */}
                <div className="grid grid-cols-2 grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">Meta Calórica</span>
                    <span className="font-bold text-style-body-small text-text-muted">{consultation.diet.targetKcal} kcal</span>
                  </div>
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">Proteínas</span>
                    <span className="font-bold text-style-body-small text-macro-protein">{consultation.diet.proteinG}g</span>
                  </div>
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">Carboidratos</span>
                    <span className="font-bold text-style-body-small text-macro-carbohydrate">{consultation.diet.carbsG}g</span>
                  </div>
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">Gorduras</span>
                    <span className="font-bold text-style-body-small text-success">{consultation.diet.fatsG}g</span>
                  </div>
                </div>

                {/* Meals Breakdown List */}
                {consultation.diet.meals && (
                  <div className="flex flex-col gap-3 pt-2">
                    <h3 className="text-style-legal font-bold text-text-primary tracking-overline flex items-center gap-1.5">
                      <Sparkles size={13} className="text-success" />
                      <span>Refeições Programadas da Consulta</span>
                    </h3>

                    <div className="flex flex-col gap-2">
                      {consultation.diet.meals.map((meal, idx) => {
                        const isExpanded = expandedMealIndexes.includes(idx);
                        return (
                          <div
                            key={idx}
                            className="bg-surface-subtle/70 border border-border-subtle rounded-control overflow-hidden transition-colors duration-standard"
                          >
                            <div
                              onClick={() => toggleMealExpansion(idx)}
                              className="p-3 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-surface-subtle transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-style-legal text-text-primary">{meal.name}</span>
                                <span className="text-style-legal font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-control border border-border-subtle">
                                  {meal.time}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-style-legal">
                                <div className="text-text-muted font-medium text-style-legal flex items-center gap-1.5">
                                  <span className="text-macro-protein font-bold">{meal.proteinG}g</span>
                                  <span>•</span>
                                  <span className="text-macro-carbohydrate font-bold">{meal.carbsG}g</span>
                                  <span>•</span>
                                  <span className="text-success font-bold">{meal.fatsG}g</span>
                                </div>
                                <span className="font-semibold text-style-legal text-text-muted bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-surface">
                                  {meal.kcal} kcal
                                </span>
                                <div className="text-text-muted hover:text-text-primary transition-colors">
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="px-3.5 pb-3.5 pt-2 border-t border-border-subtle/60 bg-surface/60 flex flex-col gap-2">
                                <div className="flex items-center gap-1.5 text-style-legal font-bold text-text-muted tracking-overline">
                                  <Utensils size={12} className="text-success" />
                                  <span>Composição e Alimentos da Refeição</span>
                                </div>
                                <p className="text-style-legal text-text-primary leading-relaxed bg-surface-subtle p-2.5 rounded-control border border-border-subtle/70">
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
            <Card className="bg-surface border border-dashed border-border-subtle p-6 rounded-surface text-center flex flex-col gap-2">
              <Utensils size={24} className="mx-auto text-text-muted/50" />
              <p className="text-style-legal text-text-muted italic">Nenhuma prescrição dietética foi associada a este dia de consulta.</p>
            </Card>
          )}

          {/* Card 2: Avaliação Física & Composição Corporal */}
          {consultation.assessment ? (
            <Card className="bg-surface border-border-subtle shadow-floating rounded-surface overflow-hidden">
              <div className="p-5 border-b border-border-subtle bg-surface-subtle/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-control bg-primary-soft text-primary">
                    <Scale size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-style-body-small text-text-primary">Avaliação Física & Antropometria</h2>
                    <span className="text-style-legal text-text-muted">Medições corporais efetuadas nesta consulta</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-style-legal font-bold text-success flex items-center gap-1 bg-success/10 px-2.5 py-1 rounded-surface">
                    <TrendingDown size={12} />
                    <span>Evolução Favorável</span>
                  </span>
                  <EditIconButton onClick={handleOpenEditAssessment} title="Editar Avaliação Física" />
                </div>
              </div>

              <CardContent className="p-5">
                <div className="grid grid-cols-2 grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">Peso Corporal</span>
                    <span className="font-bold text-style-body-small text-text-primary">{consultation.assessment.weightKg} kg</span>
                  </div>
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">% Gordura (BF)</span>
                    <span className="font-bold text-style-body-small text-text-primary">{consultation.assessment.bodyFatPercent}%</span>
                  </div>
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">Massa Magra</span>
                    <span className="font-bold text-style-body-small text-text-primary">{consultation.assessment.muscleMassKg} kg</span>
                  </div>
                  <div className="p-3 bg-surface-subtle border border-border-subtle/70 rounded-control flex flex-col gap-1">
                    <span className="text-style-legal font-bold text-text-muted tracking-overline block">Cintura</span>
                    <span className="font-bold text-style-body-small text-text-primary">{consultation.assessment.waistCm} cm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-surface border border-dashed border-border-subtle p-6 rounded-surface text-center flex flex-col gap-2">
              <Activity size={24} className="mx-auto text-text-muted/50" />
              <p className="text-style-legal text-text-muted italic">Nenhuma medição física foi registrada nesta consulta.</p>
            </Card>
          )}

        </div>

        {/* Right 1 Column: Clinical Notes & Summary Sidecard */}
        <div className="flex flex-col gap-6">
          
          {/* Card 3: Anotações & Prontuário da Consulta */}
          <Card className="bg-surface border-border-subtle shadow-floating rounded-surface p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <ClipboardList size={16} className="text-success" />
              <h3 className="font-bold text-style-legal text-text-primary tracking-overline">
                Prontuário & Conduta Nutricional
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <span className="text-style-legal font-bold text-text-muted block mb-1">Evolução Clínica</span>
                <p className="text-style-legal text-text-primary leading-relaxed bg-surface-subtle p-3 rounded-control border border-border-subtle">
                  {consultation.notes}
                </p>
              </div>

              {consultation.prescribedSupplements && consultation.prescribedSupplements.length > 0 && (
                <div className="pt-2 flex flex-col gap-2">
                  <span className="text-style-legal font-bold text-text-muted block">Suplementação Prescrita</span>
                  <div className="flex flex-col gap-1.5">
                    {consultation.prescribedSupplements.map((supp, i) => (
                      <div key={i} className="flex items-center gap-2 text-style-legal text-text-primary">
                        <CheckCircle2 size={13} className="text-success shrink-0" />
                        <span>{supp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Metrics Summary */}
          <Card className="bg-surface border-border-subtle shadow-floating rounded-surface p-5 flex flex-col gap-3">
            <h3 className="font-bold text-style-legal text-text-primary tracking-overline">
              Resumo Diagnóstico
            </h3>

            <div className="flex flex-col gap-2 text-style-legal">
              <div className="flex justify-between py-1.5 border-b border-border-subtle/60">
                <span className="text-text-muted font-medium">Índice de Massa Corporal (IMC)</span>
                <span className="font-bold text-text-primary">{bmi} kg/m²</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-subtle/60">
                <span className="text-text-muted font-medium">Status do Plano</span>
                <span className="font-bold text-success">{consultation.diet?.status || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-muted font-medium">Data do Registro</span>
                <span className="font-bold text-text-primary">{consultation.date}</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Edit Physical Assessment Dialog */}
      <Dialog open={isEditAssessmentOpen} onOpenChange={setIsEditAssessmentOpen}>
        <DialogContent className="max-w-md bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
              <Scale size={18} className="text-success" />
              <span>Editar Medidas da Avaliação Física</span>
            </DialogTitle>
            <DialogDescription className="text-style-legal text-text-muted">
              Atualize as medições corporais efetuadas nesta consulta.
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
                  size="sm"
                  className="flex-1 text-style-legal"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1 text-style-legal font-bold"
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
