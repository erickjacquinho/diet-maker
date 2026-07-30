'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Calendar, Weight, Target, ArrowRight, Users } from 'lucide-react';
import { Avatar } from '@/components/atoms';
import { CreateButton } from '@/components/atoms/Button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPatientsFromStorage, savePatientToStorage, Patient, DEFAULT_OBJECTIVES } from '@/lib/patientsStore';
import { calculatePresetCalories } from '@/lib/presetUtils';

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Patient Form State
  const [formData, setFormData] = useState({
    name: '',
    age: 30,
    gender: 'Masculino',
    heightCm: 175,
    weightKg: 75,
    targetProtein: 150,
    targetCarbs: 220,
    targetFats: 60,
    objective: 'Recomposição Corporal',
  });

  useEffect(() => {
    setPatients(getPatientsFromStorage());
  }, []);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const calculatedKcal = calculatePresetCalories(
      Number(formData.targetProtein),
      Number(formData.targetCarbs),
      Number(formData.targetFats)
    );

    savePatientToStorage({
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      heightCm: Number(formData.heightCm),
      weightKg: Number(formData.weightKg),
      targetKcal: calculatedKcal,
      targetProtein: Number(formData.targetProtein),
      targetCarbs: Number(formData.targetCarbs),
      targetFats: Number(formData.targetFats),
      objective: formData.objective.trim(),
    });

    setPatients(getPatientsFromStorage());
    setIsModalOpen(false);
    setFormData({
      name: '',
      age: 30,
      gender: 'Masculino',
      heightCm: 175,
      weightKg: 75,
      targetProtein: 150,
      targetCarbs: 220,
      targetFats: 60,
      objective: 'Recomposição Corporal',
    });
  };


  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.objective.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-warm-charcoal tracking-tight">Pacientes</h1>
          <p className="text-xs text-warm-muted mt-1 font-medium">
            Gerencie o histórico, medições e prescrições alimentares de cada paciente.
          </p>
        </div>
        <CreateButton
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus size={15} className="shrink-0" />}
        >
          Cadastrar Paciente
        </CreateButton>
      </div>

      {/* Search Input */}
      {patients.length > 0 && (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-muted z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente por nome ou objetivo..."
            className="pl-11 pr-4 h-11 bg-warm-card border-warm-border rounded-xl text-xs text-warm-charcoal placeholder-warm-muted"
          />
        </div>
      )}

      {/* Empty State vs Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <Card className="bg-warm-card border-warm-border rounded-2xl p-0 max-w-md mx-auto my-8">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-warm-inner border border-warm-border flex items-center justify-center mx-auto text-warm-muted">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-black text-base text-warm-charcoal">Nenhum paciente cadastrado</h3>
              <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                Sua lista de pacientes está em branco. Cadastre seu primeiro paciente para iniciar o acompanhamento nutricional.
              </p>
            </div>
            <CreateButton
              onClick={() => setIsModalOpen(true)}
              icon={<UserPlus size={15} className="shrink-0" />}
            >
              Cadastrar Primeiro Paciente
            </CreateButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="bg-warm-card border-warm-border rounded-2xl p-0 hover:border-warm-charcoal/30 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar initials={patient.initials} variant="charcoal" size="md" className="rounded-xl font-bold" />
                    <div>
                      <h3 className="font-bold text-sm text-warm-charcoal leading-snug">{patient.name}</h3>
                      <span className="text-[11px] text-warm-muted font-medium">
                        {patient.age} anos • {patient.gender}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-warm-inner border border-warm-border rounded-xl text-center">
                  <div>
                    <div className="text-[10px] font-semibold text-warm-muted flex items-center justify-center space-x-1">
                      <Weight size={10} />
                      <span>Peso</span>
                    </div>
                    <div className="font-black text-xs text-warm-charcoal mt-0.5">{patient.weightKg} kg</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-warm-muted flex items-center justify-center space-x-1">
                      <Target size={10} />
                      <span>Meta Kcal</span>
                    </div>
                    <div className="font-bold text-xs text-warm-muted mt-0.5">{patient.targetKcal} kcal</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-warm-muted flex items-center justify-center space-x-1">
                      <Calendar size={10} />
                      <span>Última</span>
                    </div>
                    <div className="font-bold text-[11px] text-warm-charcoal mt-0.5">{patient.lastConsultation}</div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-warm-border">
                  <span className="text-[11px] font-semibold text-warm-muted truncate max-w-[180px]">
                    🎯 {patient.objective}
                  </span>
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-warm-charcoal hover:text-warm-emerald transition-colors"
                  >
                    <span>Ver Perfil</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Cadastrar Paciente Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal">Cadastrar Novo Paciente</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePatient} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Nome Completo</label>
              <Input
                type="text"
                required
                placeholder="Ex: Carlos Eduardo Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-warm-inner border-warm-border text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-warm-muted block mb-1">Idade</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-warm-muted block mb-1">Altura (cm)</label>
                <Input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-warm-muted block mb-1">Peso (kg)</label>
                <Input
                  type="number"
                  step="any"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Objetivo Clínico / Esportivo</label>
              <Select
                value={formData.objective}
                onValueChange={(val) => setFormData({ ...formData, objective: val })}
              >
                <SelectTrigger className="bg-warm-inner border-warm-border text-xs text-warm-charcoal font-semibold h-9 w-full">
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DEFAULT_OBJECTIVES.map((obj) => (
                    <SelectItem key={obj} value={obj}>
                      {obj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="pt-2 flex space-x-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
              >
                Cancelar
              </Button>

              <Button type="submit" variant="emerald" size="sm" className="flex-1 text-xs font-bold">
                Salvar Paciente
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

