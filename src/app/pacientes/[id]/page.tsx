'use client';

import React, { useState, useEffect } from 'react';
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
  TrendingDown,
  Scale,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Avatar } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  getPatientById, 
  updatePatientInStorage, 
  deletePatientFromStorage, 
  Patient 
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

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);

  // Initial Empty States for Diets & Body Assessments
  const [dietHistory, setDietHistory] = useState<HistoricalDiet[]>([]);
  const [bodyAssessments, setBodyAssessments] = useState<BodyAssessment[]>([]);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Patient | null>(null);

  useEffect(() => {
    if (patientId) {
      const found = getPatientById(patientId);
      if (found) {
        setPatient(found);
      } else {
        // Fallback default structure for newly navigated ID
        setPatient({
          id: patientId,
          name: 'Paciente Sem Nome',
          age: 30,
          gender: 'Não Informado',
          heightCm: 170,
          weightKg: 70,
          initials: 'P',
          objective: 'Acompanhamento Nutricional',
          targetKcal: 2000,
          targetProtein: 140,
          targetCarbs: 220,
          targetFats: 60,
          lastConsultation: new Date().toLocaleDateString('pt-BR'),
        });
      }
    }
  }, [patientId]);

  const handleOpenEditModal = () => {
    if (patient) {
      setEditFormData({ ...patient });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editFormData.name.trim()) return;

    const saved = updatePatientInStorage(editFormData);
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

  if (!patient) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditModal}
            className="flex items-center space-x-1.5 text-xs font-bold border-warm-border text-warm-charcoal hover:bg-warm-inner"
          >
            <Pencil size={14} />
            <span>Editar Dados</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Trash2 size={14} />
            <span>Excluir Paciente</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fixed Sticky Profile Card */}
        <Card className="lg:col-span-4 bg-warm-card border-warm-border rounded-2xl p-0 lg:sticky lg:top-6">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center space-x-4 pb-5 border-b border-warm-border">
              <Avatar initials={patient.initials} variant="charcoal" size="lg" className="rounded-2xl font-black text-lg" />
              <div>
                <h2 className="font-black text-base text-warm-charcoal">{patient.name}</h2>
                <span className="text-xs font-semibold text-warm-muted">
                  {patient.age} anos • {patient.heightCm} cm • {patient.gender}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl">
                <div className="text-[10px] font-bold text-warm-muted uppercase flex items-center space-x-1">
                  <Weight size={12} />
                  <span>Peso Atual</span>
                </div>
                <div className="font-black text-base text-warm-charcoal mt-1">{patient.weightKg} kg</div>
              </div>
              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl">
                <div className="text-[10px] font-bold text-warm-muted uppercase flex items-center space-x-1">
                  <Flame size={12} className="text-warm-emerald" />
                  <span>Meta Kcal</span>
                </div>
                <div className="font-black text-base text-warm-emerald mt-1">{patient.targetKcal} kcal</div>
              </div>
            </div>

            {/* Macro Targets Card */}
            <div className="p-4 bg-warm-inner border border-warm-border rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-warm-charcoal uppercase tracking-wider">Metas Manuais Ativas</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div>
                  <span className="text-[10px] font-semibold text-warm-muted block">Proteína</span>
                  <span className="font-black text-warm-charcoal">{patient.targetProtein}g</span>
                  <span className="text-[9px] text-warm-muted block">{(patient.targetProtein / (patient.weightKg || 1)).toFixed(1)} g/kg</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-warm-muted block">Carbo</span>
                  <span className="font-black text-warm-charcoal">{patient.targetCarbs}g</span>
                  <span className="text-[9px] text-warm-muted block">{(patient.targetCarbs / (patient.weightKg || 1)).toFixed(1)} g/kg</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-warm-muted block">Gordura</span>
                  <span className="font-black text-warm-charcoal">{patient.targetFats}g</span>
                  <span className="text-[9px] text-warm-muted block">{(patient.targetFats / (patient.weightKg || 1)).toFixed(1)} g/kg</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Link
                href={`/pacientes/${patient.id}/dieta/nova`}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-warm-charcoal text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
              >
                <Plus size={16} />
                <span>Criar Nova Dieta</span>
              </Link>
              <Button variant="secondary" size="sm" className="w-full flex items-center justify-center space-x-2 text-xs">
                <Activity size={15} />
                <span>Nova Avaliação Física</span>
              </Button>

              <div className="pt-2 border-t border-warm-border grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEditModal}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs font-bold border-warm-border text-warm-charcoal hover:bg-warm-inner"
                >
                  <Pencil size={13} />
                  <span>Editar</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Trash2 size={13} />
                  <span>Excluir</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Timeline Sections */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 1: Historical Diets */}
          <Card className="bg-warm-card border-warm-border rounded-2xl p-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Utensils size={18} className="text-warm-emerald" />
                  <h3 className="font-black text-base text-warm-charcoal">Atualizações Dietéticas</h3>
                </div>
                <span className="text-xs font-bold text-warm-muted">{dietHistory.length} registradas</span>
              </div>

              {dietHistory.length === 0 ? (
                <div className="p-8 text-center bg-warm-inner border border-warm-border rounded-xl space-y-3">
                  <p className="text-xs text-warm-muted">Nenhuma prescrição dietética criada para este paciente ainda.</p>
                  <Link
                    href={`/pacientes/${patient.id}/dieta/nova`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-warm-charcoal text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                  >
                    <Plus size={14} />
                    <span>Montar Primeira Dieta</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {dietHistory.map((diet) => (
                    <div
                      key={diet.id}
                      className="p-4 bg-warm-inner border border-warm-border rounded-xl space-y-3 hover:border-warm-charcoal/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-warm-charcoal">{diet.name}</span>
                            {diet.status === 'Ativa' && (
                              <Badge variant="default" className="text-[9px] font-extrabold bg-warm-emerald/10 text-warm-emerald">
                                Ativa
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] text-warm-muted mt-0.5">
                            <Calendar size={12} />
                            <span>Prescrita em {diet.date}</span>
                          </div>
                        </div>

                        <Link
                          href={`/pacientes/${patient.id}/dieta/${diet.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-warm-charcoal hover:text-warm-emerald transition-colors"
                        >
                          <span>Abrir no Construtor</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>

                      {/* VISIBLE MACRONUTRIENTS CHIPS (WITHOUT OPENING) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-warm-border/60">
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">Calorias</span>
                          <span className="font-black text-xs text-warm-charcoal">{diet.targetKcal} kcal</span>
                        </div>
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">Proteínas</span>
                          <span className="font-black text-xs text-rose-700">{diet.proteinG}g</span>
                        </div>
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">Carbo</span>
                          <span className="font-black text-xs text-amber-700">{diet.carbsG}g</span>
                        </div>
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">Gorduras</span>
                          <span className="font-black text-xs text-emerald-700">{diet.fatsG}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Physical Body Assessments */}
          <Card className="bg-warm-card border-warm-border rounded-2xl p-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale size={18} className="text-warm-emerald" />
                  <h3 className="font-black text-base text-warm-charcoal">Atualizações de Valores Corporais</h3>
                </div>
                <span className="text-xs font-bold text-warm-muted">{bodyAssessments.length} avaliações</span>
              </div>

              {bodyAssessments.length === 0 ? (
                <div className="p-8 text-center bg-warm-inner border border-warm-border rounded-xl space-y-3">
                  <p className="text-xs text-warm-muted">Nenhuma avaliação física ou medição corporal registrada ainda.</p>
                  <Button variant="secondary" size="sm" className="text-xs font-bold">
                    + Registrar Primeira Avaliação
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bodyAssessments.map((assess) => (
                    <div
                      key={assess.id}
                      className="p-4 bg-warm-inner border border-warm-border rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-warm-muted" />
                          <span className="text-xs font-bold text-warm-charcoal">Avaliação de {assess.date}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-warm-emerald flex items-center space-x-1">
                          <TrendingDown size={12} />
                          <span>Evolução Favorável</span>
                        </span>
                      </div>

                      {/* VISIBLE BODY VALUES (WITHOUT OPENING) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">Peso</span>
                          <span className="font-black text-xs text-warm-charcoal">{assess.weightKg} kg</span>
                        </div>
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">% Gordura</span>
                          <span className="font-black text-xs text-warm-charcoal">{assess.bodyFatPercent}%</span>
                        </div>
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">Massa Magra</span>
                          <span className="font-black text-xs text-warm-charcoal">{assess.muscleMassKg} kg</span>
                        </div>
                        <div className="p-2 bg-warm-card border border-warm-border rounded-lg text-center">
                          <span className="text-[9px] font-bold text-warm-muted block uppercase">Cintura</span>
                          <span className="font-black text-xs text-warm-charcoal">{assess.waistCm} cm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
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
                <Input
                  type="text"
                  value={editFormData.gender}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  className="bg-warm-inner border-warm-border text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-warm-charcoal block mb-1">Objetivo Clínico / Esportivo</label>
                <Input
                  type="text"
                  value={editFormData.objective}
                  onChange={(e) => setEditFormData({ ...editFormData, objective: e.target.value })}
                  className="bg-warm-inner border-warm-border text-xs"
                />
              </div>

              <div className="p-3 bg-warm-inner border border-warm-border rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-warm-charcoal uppercase tracking-wider block">Metas Manuais</span>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div>
                    <span className="text-[9px] font-semibold text-warm-muted block uppercase">Kcal</span>
                    <Input
                      type="number"
                      value={editFormData.targetKcal}
                      onChange={(e) => setEditFormData({ ...editFormData, targetKcal: Number(e.target.value) })}
                      className="bg-warm-card border-warm-border text-xs font-bold text-center px-1"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-warm-muted block uppercase">Prot (g)</span>
                    <Input
                      type="number"
                      value={editFormData.targetProtein}
                      onChange={(e) => setEditFormData({ ...editFormData, targetProtein: Number(e.target.value) })}
                      className="bg-warm-card border-warm-border text-xs font-bold text-center px-1"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-warm-muted block uppercase">Carb (g)</span>
                    <Input
                      type="number"
                      value={editFormData.targetCarbs}
                      onChange={(e) => setEditFormData({ ...editFormData, targetCarbs: Number(e.target.value) })}
                      className="bg-warm-card border-warm-border text-xs font-bold text-center px-1"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-warm-muted block uppercase">Gord (g)</span>
                    <Input
                      type="number"
                      value={editFormData.targetFats}
                      onChange={(e) => setEditFormData({ ...editFormData, targetFats: Number(e.target.value) })}
                      className="bg-warm-card border-warm-border text-xs font-bold text-center px-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <Button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Cancelar
                </Button>

                <Button type="submit" size="sm" className="flex-1 text-xs font-bold bg-warm-emerald text-white hover:bg-warm-emerald/90">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
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
    </div>
  );
}
