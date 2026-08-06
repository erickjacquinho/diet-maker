'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users } from 'lucide-react';
import { PatientListTable } from '@/components/organisms';
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
import {
  getPatientRecordHistory,
  getPatientsFromStorage,
  savePatientToStorage,
  Patient,
  DEFAULT_OBJECTIVES,
} from '@/lib/patientsStore';
import { buildPatientListRows, filterPatients } from '@/lib/patientListView';
import type { PatientListHistoryInput } from '@/lib/patientListView';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { formatWhatsappContact } from '@/lib/whatsapp';

export default function PatientsListPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [patientHistoryById, setPatientHistoryById] = useState<Record<string, PatientListHistoryInput>>({});

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
    whatsapp: '',
    objective: 'Recomposição Corporal',
  });

  const loadPatients = useCallback(() => {
    const loadedPatients = getPatientsFromStorage();
    setPatients(loadedPatients);
    setPatientHistoryById(
      Object.fromEntries(
        loadedPatients.map((patient) => {
          const recordHistory = getPatientRecordHistory(patient.id);
          return [patient.id, {
            assessments: recordHistory.assessments,
            hasAssessment: recordHistory.assessments.length > 0 || patient.lastActivity?.type === 'assessment',
            hasDiet: recordHistory.hasDiet || patient.lastActivity?.type === 'diet',
          }];
        }),
      ),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

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
      whatsapp: formatWhatsappContact(formData.whatsapp) || undefined,
    });

    loadPatients();
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
      whatsapp: '',
      objective: 'Recomposição Corporal',
    });
  };


  const filteredPatients = filterPatients(patients, searchTerm);
  const patientRows = buildPatientListRows(filteredPatients, undefined, patientHistoryById);
  const countLabel = filteredPatients.length === patients.length
    ? `${patients.length} ${patients.length === 1 ? 'paciente' : 'pacientes'}`
    : `${filteredPatients.length} de ${patients.length} pacientes`;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div>
        <div>
          <h1 className="font-bold text-style-section-title text-text-primary tracking-tight">Pacientes</h1>
          <p className="text-style-legal text-text-muted mt-1 font-medium">
            Organize os próximos acompanhamentos para preparar o atendimento.
          </p>
        </div>
      </div>

      {patients.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10 pointer-events-none" />
              <Input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou objetivo..."
                aria-label="Buscar pacientes por nome ou objetivo"
                className="pl-11 pr-4 h-11 bg-surface border-border-subtle rounded-control text-style-legal text-text-primary placeholder-text-muted"
              />
            </div>
            <span role="status" aria-live="polite" className="text-style-legal text-text-muted whitespace-nowrap">
              {countLabel}
            </span>
            <CreateButton
              onClick={() => setIsModalOpen(true)}
              className="ml-auto shrink-0"
            >
              Novo paciente
            </CreateButton>
          </div>
        </div>
      )}

      {isLoading ? (
        <div role="status" className="py-16 text-center text-style-body-small text-text-muted">
          Carregando pacientes...
        </div>
      ) : patients.length === 0 ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-0 max-w-md mx-auto my-8">
          <CardContent className="p-12 text-center flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <Users size={24} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Nenhum paciente cadastrado</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                Cadastre seu primeiro paciente para iniciar o acompanhamento nutricional.
              </p>
            </div>
            <CreateButton
              onClick={() => setIsModalOpen(true)}
            >
              Cadastrar Primeiro Paciente
            </CreateButton>
          </CardContent>
        </Card>
      ) : filteredPatients.length === 0 ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-0 max-w-md mx-auto my-8">
          <CardContent className="p-12 text-center flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <Search size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Nenhum paciente encontrado</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                Tente buscar por outro nome ou objetivo.
              </p>
            </div>
            <Button type="button" variant="secondary" size="compact" onClick={() => setSearchTerm('')}>
              Limpar busca
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section
          className="overflow-hidden rounded-surface border border-border-subtle bg-surface"
        >
          <PatientListTable
            rows={patientRows}
            onNavigate={(href) => router.push(href)}
          />
        </section>
      )}

      {/* Modal Cadastrar Paciente Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-text-primary">Cadastrar Novo Paciente</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePatient} className="flex flex-col gap-3 pt-2">
            <div>
              <label htmlFor="new-patient-name" className="text-style-legal font-bold text-text-primary block mb-1">Nome Completo</label>
              <Input
                id="new-patient-name"
                type="text"
                required
                placeholder="Ex: Carlos Eduardo Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-surface-subtle border-border-subtle text-style-legal"
              />
            </div>

            <div>
              <label htmlFor="new-patient-whatsapp" className="text-style-legal font-bold text-text-primary block mb-1">WhatsApp</label>
              <Input
                id="new-patient-whatsapp"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: formatWhatsappContact(e.target.value) })}
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
                size="compact"
                className="flex-1 text-style-legal"
              >
                Cancelar
              </Button>

              <Button type="submit" variant="primary" size="compact" className="flex-1">
                Salvar Paciente
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

