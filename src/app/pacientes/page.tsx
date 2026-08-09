'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users } from 'lucide-react';
import { PatientListTable } from '@/components/organisms';
import { CreateButton } from '@/components/atoms/Button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePatientModal, type CreatePatientFormData } from '@/components/molecules/CreatePatientModal';
import {
  getPatientRecordHistory,
  getPatientsFromStorage,
  savePatientToStorage,
  Patient,
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

  const handleCreatePatient = (formData: CreatePatientFormData) => {
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
  };


  const filteredPatients = filterPatients(patients, searchTerm);
  const patientRows = buildPatientListRows(filteredPatients, undefined, patientHistoryById);
  const countLabel = filteredPatients.length === patients.length
    ? `${patients.length} ${patients.length === 1 ? 'paciente' : 'pacientes'}`
    : `${filteredPatients.length} de ${patients.length} pacientes`;

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
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
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
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

      <CreatePatientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleCreatePatient}
      />
    </div>
  );
}

