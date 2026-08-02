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
    <div className="p-6 p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col flex-row items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-style-section-title text-text-primary tracking-tight">Pacientes</h1>
          <p className="text-style-legal text-text-muted mt-1 font-medium">
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
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente por nome ou objetivo..."
            className="pl-11 pr-4 h-11 bg-surface border-border-subtle rounded-control text-style-legal text-text-primary placeholder-text-muted"
          />
        </div>
      )}

      {/* Empty State vs Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-0 max-w-md mx-auto my-8">
          <CardContent className="p-12 text-center flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Nenhum paciente cadastrado</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
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
        <div className="grid grid-cols-1 grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="bg-surface border-border-subtle rounded-surface p-0 hover:border-text-primary/30 transition-colors duration-standard flex flex-col justify-between"
            >
              <CardContent className="p-5 gap-4 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar initials={patient.initials} variant="charcoal" size="md" className="rounded-control font-bold" />
                    <div>
                      <h3 className="font-bold text-style-body-small text-text-primary leading-snug">{patient.name}</h3>
                      <span className="text-style-legal text-text-muted font-medium">
                        {patient.age} anos • {patient.gender}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-surface-subtle border border-border-subtle rounded-control text-center">
                  <div>
                    <div className="text-style-legal font-semibold text-text-muted flex items-center justify-center gap-1">
                      <Weight size={10} />
                      <span>Peso</span>
                    </div>
                    <div className="font-bold text-style-legal text-text-primary mt-0.5">{patient.weightKg} kg</div>
                  </div>
                  <div>
                    <div className="text-style-legal font-semibold text-text-muted flex items-center justify-center gap-1">
                      <Target size={10} />
                      <span>Meta Kcal</span>
                    </div>
                    <div className="font-bold text-style-legal text-text-muted mt-0.5">{patient.targetKcal} kcal</div>
                  </div>
                  <div>
                    <div className="text-style-legal font-semibold text-text-muted flex items-center justify-center gap-1">
                      <Calendar size={10} />
                      <span>Última</span>
                    </div>
                    <div className="font-bold text-style-legal text-text-primary mt-0.5">{patient.lastConsultation}</div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-border-subtle">
                  <span className="text-style-legal font-semibold text-text-muted truncate max-w-[180px]">
                    🎯 {patient.objective}
                  </span>
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="inline-flex items-center gap-1 text-style-legal font-bold text-text-primary hover:text-success transition-colors"
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
        <DialogContent className="max-w-md bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-text-primary">Cadastrar Novo Paciente</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePatient} className="flex flex-col gap-3 pt-2">
            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Nome Completo</label>
              <Input
                type="text"
                required
                placeholder="Ex: Carlos Eduardo Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-surface-subtle border-border-subtle text-style-legal"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-style-legal font-semibold text-text-muted block mb-1">Idade</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="bg-surface-subtle border-border-subtle text-style-legal font-bold"
                />
              </div>
              <div>
                <label className="text-style-legal font-semibold text-text-muted block mb-1">Altura (cm)</label>
                <Input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="bg-surface-subtle border-border-subtle text-style-legal font-bold"
                />
              </div>
              <div>
                <label className="text-style-legal font-semibold text-text-muted block mb-1">Peso (kg)</label>
                <Input
                  type="number"
                  step="any"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="bg-surface-subtle border-border-subtle text-style-legal font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Objetivo Clínico / Esportivo</label>
              <Select
                value={formData.objective}
                onValueChange={(val) => setFormData({ ...formData, objective: val })}
              >
                <SelectTrigger className="bg-surface-subtle border-border-subtle text-style-legal text-text-primary font-semibold h-9 w-full">
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


            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="sm"
                className="flex-1 text-style-legal"
              >
                Cancelar
              </Button>

              <Button type="submit" variant="primary" size="sm" className="flex-1">
                Salvar Paciente
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

