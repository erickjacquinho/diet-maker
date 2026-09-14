'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Search, Users } from 'lucide-react';
import { PatientListTable } from '@/components/organisms';
import { CreateButton } from '@/components/atoms/Button';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePatientModal, type CreatePatientFormData } from '@/components/molecules/CreatePatientModal';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { usePatientsPage } from '@/hooks/usePatientsPage';

export default function PatientsListPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { patients, filteredPatients, rows: patientRows, searchTerm, setSearchTerm, isLoading, error, retry, createPatient } = usePatientsPage();

  const handleCreatePatient = async (formData: CreatePatientFormData) => {
    const targetProtein = Number(formData.targetProtein);
    const targetCarbs = Number(formData.targetCarbs);
    const targetFats = Number(formData.targetFats);
    await createPatient({
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      heightCm: Number(formData.heightCm),
      weightKg: Number(formData.weightKg),
      phone: null,
      whatsapp: formData.whatsapp,
      currentObjective: formData.objective,
      defaultMacroTargets: {
        proteinG: targetProtein,
        carbsG: targetCarbs,
        fatsG: targetFats,
        kcal: calculatePresetCalories(targetProtein, targetCarbs, targetFats),
      },
    });
    setIsModalOpen(false);
  };
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
            <InputGroup className="flex-1 h-11 bg-surface border-border-subtle rounded-control">
              <InputGroupAddon align="inline-start">
                <Search size={18} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou objetivo..."
                aria-label="Buscar pacientes por nome ou objetivo"
                className="text-style-legal text-text-primary placeholder:text-text-muted focus:placeholder:text-transparent"
              />
            </InputGroup>
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
      ) : error ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-0 max-w-md mx-auto my-8">
          <CardContent className="p-12 text-center flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-error-soft border border-error-border flex items-center justify-center mx-auto text-error">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Não foi possível carregar pacientes</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">{error}</p>
            </div>
            <Button type="button" variant="secondary" size="compact" onClick={() => void retry()}>Tentar novamente</Button>
          </CardContent>
        </Card>
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

