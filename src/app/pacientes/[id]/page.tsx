'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Utensils, Calendar, MessageCircle, AlertTriangle } from 'lucide-react';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { CreateButton, SecondaryActionButton, Surface, EditIconButton, DeleteIconButton } from '@/components/atoms';
import {
  PatientConsultationHistoryTable,
  PatientProfileHeader,
} from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { PageContextHeader } from '@/components/molecules';
import { PatientProfileModals } from './PatientProfileModals';
import { PatientProfileCurrentContext } from './PatientProfileCurrentContext';
import { buildPatientProfileConsultations } from '@/lib/patientProfileConsultations';

export default function PatientDetailPage() {
  const {
    patientId,
    patient,
    dietHistory,
    bodyAssessments,
    activePlan,
    latestAssessment,
    nextEventSummary,
    whatsappUrl,
    availableObjectives,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isEditAssessmentOpen,
    setIsEditAssessmentOpen,
    editingAssessment,
    assessmentMode,
    isNextEventModalOpen,
    setIsNextEventModalOpen,
    isAddObjectiveModalOpen,
    setIsAddObjectiveModalOpen,
    objectiveToApply,
    selectedReadOnlyDiet,
    isReadOnlyDietModalOpen,
    setIsReadOnlyDietModalOpen,
    handleOpenReadOnlyDietModal,
    handleOpenEditAssessment,
    handleSaveAssessment,
    handleSaveNextEvent,
    handleClearNextEvent,
    handleAddCustomObjective,
    handleSavePatient,
    handleDeletePatient,
  } = usePatientProfilePage();

  const consultationUpdates = buildPatientProfileConsultations(dietHistory, bodyAssessments);

  if (!patient) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertTriangle className="size-12 text-warning mx-auto mb-4" />
        <h2 className="text-style-section-title font-bold text-text-primary mb-2">Paciente Não Encontrado</h2>
        <p className="text-text-secondary mb-6">O paciente solicitado não existe ou foi removido.</p>
        <Link href="/pacientes">
          <SecondaryActionButton icon={<ArrowLeft size={14} />}>Voltar para Pacientes</SecondaryActionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 flex flex-col gap-6 max-w-7xl">
      <PageContextHeader
        title="Perfil do paciente"
        backHref="/pacientes"
        backLabel="Voltar para Pacientes"
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: patient.name },
        ]}
      />
      <PatientProfileHeader patient={patient}>
        <PatientProfileHeader.Identity>
          <PatientProfileHeader.Avatar />
          <PatientProfileHeader.Info>
            <div className="flex items-center gap-2">
              <PatientProfileHeader.Name />
              <PatientProfileHeader.Gender />
              <PatientProfileHeader.Badge />
            </div>
            <PatientProfileHeader.Meta />
          </PatientProfileHeader.Info>
        </PatientProfileHeader.Identity>

        <PatientProfileHeader.Actions>
          <Button
            variant="secondary"
            size="compact"
            aria-label="Abrir conversa no WhatsApp"
            disabled={!whatsappUrl}
            onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
          >
              <MessageCircle className="w-4 h-4 mr-1 text-success" />
              WhatsApp
          </Button>
          <Button variant="secondary" size="compact" onClick={() => setIsNextEventModalOpen(true)}>
            <Calendar className="w-4 h-4 mr-1 text-primary" />
            Acompanhamento
          </Button>
          <EditIconButton onClick={() => setIsEditModalOpen(true)} title="Editar Cadastro" />
          <DeleteIconButton
            onClick={() => setIsDeleteModalOpen(true)}
            title="Excluir Paciente"
            variant="destructive-outline"
          />
        </PatientProfileHeader.Actions>
      </PatientProfileHeader>

      <PatientProfileCurrentContext
        patientId={patientId}
        latestAssessment={latestAssessment}
        activePlan={activePlan}
        nextEventSummary={nextEventSummary}
        onOpenNextEvent={() => setIsNextEventModalOpen(true)}
      />

      <Surface className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-border-divider pb-4">
          <div>
            <h2 className="text-style-section-title font-bold text-text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5 text-success" />
              Histórico de Consultas & Acompanhamento
            </h2>
            <p className="text-style-caption text-text-secondary mt-0.5">
              Consolidado de dietas e avaliações antropométricas do paciente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/pacientes/${patientId}/dieta/nova`}>
              <CreateButton icon={<Utensils size={14} />}>Nova Dieta</CreateButton>
            </Link>
          </div>
        </div>

        <PatientConsultationHistoryTable
          patientId={patientId}
          updates={consultationUpdates}
          onOpenReadOnlyDiet={handleOpenReadOnlyDietModal}
          onOpenEditAssessment={handleOpenEditAssessment}
        />
      </Surface>

      <PatientProfileModals
        patient={patient}
        availableObjectives={availableObjectives}
        objectiveToApply={objectiveToApply}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        isNextEventModalOpen={isNextEventModalOpen}
        setIsNextEventModalOpen={setIsNextEventModalOpen}
        isAddObjectiveModalOpen={isAddObjectiveModalOpen}
        setIsAddObjectiveModalOpen={setIsAddObjectiveModalOpen}
        isEditAssessmentOpen={isEditAssessmentOpen}
        setIsEditAssessmentOpen={setIsEditAssessmentOpen}
        editingAssessment={editingAssessment}
        assessmentMode={assessmentMode}
        selectedReadOnlyDiet={selectedReadOnlyDiet}
        isReadOnlyDietModalOpen={isReadOnlyDietModalOpen}
        setIsReadOnlyDietModalOpen={setIsReadOnlyDietModalOpen}
        handleSavePatient={handleSavePatient}
        handleDeletePatient={handleDeletePatient}
        handleSaveNextEvent={handleSaveNextEvent}
        handleClearNextEvent={handleClearNextEvent}
        handleAddCustomObjective={handleAddCustomObjective}
        handleSaveAssessment={handleSaveAssessment}
      />
    </div>
  );
}
