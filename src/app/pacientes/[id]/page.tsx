'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Utensils, Calendar, MessageCircle, AlertTriangle, Scale, Info } from 'lucide-react';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { CreateButton, SecondaryActionButton, Surface, EditIconButton, DeleteIconButton, IconButton } from '@/components/atoms';
import {
  PatientAssessmentsTable,
  PatientDietsTable,
  PatientProfileHeader,
} from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageContextHeader } from '@/components/molecules';
import { textStyle } from '@/design-system';
import { formatAgeFromBirthDate, formatDateOnly } from '@/lib/date-only';
import { cn } from '@/lib/utils';
import { PatientProfileModals } from './PatientProfileModals';
import { PatientProfileCurrentContext } from './PatientProfileCurrentContext';

export default function PatientDetailPage() {
  const {
    patientId,
    patient,
    profileError,
    isProfileLoading,
    confirmedPlans,
    dietTotal,
    isDietsLoading,
    dietsError,
    bodyAssessments,
    assessmentTotal,
    isAssessmentsLoading,
    assessmentsError,
    latestAssessment,
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
    handleOpenCreateAssessment,
    handleSaveAssessment,
    handleSaveNextEvent,
    handleClearNextEvent,
    handleAddCustomObjective,
    handleSavePatient,
    handleDeletePatient,
  } = usePatientProfilePage();

  if (isProfileLoading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center" role="status" aria-live="polite">
        <p className="text-text-secondary">Carregando perfil do paciente...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertTriangle className="size-12 text-warning mx-auto mb-4" />
        <h2 className="text-style-section-title font-bold text-text-primary mb-2">
          {profileError ? 'Não foi possível carregar o paciente' : 'Paciente Não Encontrado'}
        </h2>
        <p className="text-text-secondary mb-6">
          {profileError ?? 'O paciente solicitado não existe ou não pertence à Conta ativa.'}
        </p>
        <Link href="/pacientes">
          <SecondaryActionButton icon={<ArrowLeft size={14} />}>Voltar para Pacientes</SecondaryActionButton>
        </Link>
      </div>
    );
  }

  const isPatientArchived = Boolean(patient.archivedAt);

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
      <PageContextHeader
        title="Perfil do paciente"
        backHref="/pacientes"
        backLabel="Voltar para Pacientes"
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: patient.name },
        ]}
      />
      <Surface className="p-6">
        <PatientProfileHeader patient={patient} className="border-b-0 pb-0">
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
            <Popover>
              <PopoverTrigger asChild>
                <IconButton
                  size="compact"
                  variant="quiet"
                  title="Ver dados pessoais"
                  aria-label="Ver dados pessoais"
                  icon={<Info className="size-4" aria-hidden="true" />}
                />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="flex flex-col gap-3">
                  <h2 className={textStyle('body-strong')}>Dados pessoais</h2>
                  <dl className="flex flex-col gap-2 text-style-body-small">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-text-muted">Idade</dt>
                      <dd className="font-semibold text-text-primary">{formatAgeFromBirthDate(patient.birthDate) || 'Não informado'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-text-muted">Gênero</dt>
                      <dd className="font-semibold text-text-primary">{patient.gender || 'Não informado'}</dd>
                    </div>
                    {patient.gender === 'Feminino' && (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-text-muted">Grávida</dt>
                          <dd className="font-semibold text-text-primary">{patient.isPregnant ? 'Sim' : 'Não'}</dd>
                        </div>
                        {patient.isPregnant && (
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-text-muted">DPP</dt>
                            <dd className="font-semibold text-text-primary">{formatDateOnly(patient.pregnancyDueDate) || 'Não informado'}</dd>
                          </div>
                        )}
                      </>
                    )}
                  </dl>
                </div>
              </PopoverContent>
            </Popover>
            {!isPatientArchived && (
              <IconButton
                size="compact"
                variant="quiet"
                title={patient.nextEvent ? 'Reagendar acompanhamento' : 'Definir acompanhamento'}
                aria-label={patient.nextEvent ? 'Reagendar acompanhamento' : 'Definir acompanhamento'}
                icon={<Calendar className="size-4" aria-hidden="true" />}
                onClick={() => setIsNextEventModalOpen(true)}
              />
            )}
            <Button
              variant="secondary"
              size="compact"
              aria-label="Abrir conversa no WhatsApp"
              disabled={!whatsappUrl}
              onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
            >
              <MessageCircle className="size-4 text-success shrink-0" aria-hidden="true" />
              <span>WhatsApp</span>
            </Button>
            {!isPatientArchived && (
              <>
                <EditIconButton size="compact" onClick={() => setIsEditModalOpen(true)} title="Editar Cadastro" />
                <DeleteIconButton
                  size="compact"
                  onClick={() => setIsDeleteModalOpen(true)}
                  title="Arquivar Paciente"
                />
              </>
            )}
          </PatientProfileHeader.Actions>
        </PatientProfileHeader>
      </Surface>

      {isPatientArchived && (
        <Surface className="border-warning-border bg-warning-soft p-4" role="status">
          <p className="text-style-body-small font-medium text-warning-foreground">
            Este paciente está arquivado. O histórico permanece disponível para consulta, mas novas operações clínicas estão bloqueadas.
          </p>
        </Surface>
      )}

      <PatientProfileCurrentContext
        patientId={patientId}
        latestAssessment={latestAssessment}
        latestDiet={confirmedPlans[0] ?? null}
        readOnly={isPatientArchived}
      />

      {/* 1. Histórico de Prescrições & Planos Alimentares */}
      <Surface className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-border-divider pb-4">
          <div>
            <h2 className={cn(textStyle('section-title'), 'flex items-center gap-2 text-text-primary')}>
              <Utensils className="w-5 h-5 text-primary" />
              <span>Histórico de prescrições dietéticas</span>
            </h2>
            <p className={cn(textStyle('caption'), 'text-text-secondary mt-0.5')}>
              Planos alimentares, metas calóricas, distribuição de macronutrientes e cardápios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={textStyle('caption')}>
              {dietTotal === 1 ? '1 plano' : `${dietTotal} planos`}
            </span>
            {!isPatientArchived && (
              <Link href={`/pacientes/${patientId}/dieta/nova`}>
                <CreateButton icon={<Utensils size={14} />}>Nova Dieta</CreateButton>
              </Link>
            )}
          </div>
        </div>

        {dietTotal > confirmedPlans.length && (
          <div className="flex justify-end">
            <Button asChild variant="secondary" size="compact">
              <Link href={`/pacientes/${patientId}/dietas`}>Ver histórico completo</Link>
            </Button>
          </div>
        )}
        <PatientDietsTable
          patientId={patientId}
          diets={confirmedPlans}
          loading={isDietsLoading}
          error={dietsError}
          onOpenReadOnlyDiet={handleOpenReadOnlyDietModal}
        />
      </Surface>

      {/* 2. Histórico de Avaliações Físicas & Antropometria */}
      <Surface className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-border-divider pb-4">
          <div>
            <h2 className={cn(textStyle('section-title'), 'flex items-center gap-2 text-text-primary')}>
              <Scale className="w-5 h-5 text-primary" />
              <span>Histórico de avaliações físicas</span>
            </h2>
            <p className={cn(textStyle('caption'), 'text-text-secondary mt-0.5')}>
              Evolução da composição corporal, peso, % de gordura e perímetros.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={textStyle('caption')}>
              {assessmentTotal === 1 ? '1 avaliação' : `${assessmentTotal} avaliações`}
            </span>
            {!isPatientArchived && (
              <Link href={`/pacientes/${patientId}/avaliacao/nova`}>
                <CreateButton icon={<Scale size={14} />}>
                  Nova Avaliação
                </CreateButton>
              </Link>
            )}
          </div>
        </div>

        {assessmentTotal > bodyAssessments.length && (
          <div className="flex justify-end">
            <Button asChild variant="secondary" size="compact">
              <Link href={`/pacientes/${patientId}/avaliacoes`}>Ver histórico completo</Link>
            </Button>
          </div>
        )}
        <PatientAssessmentsTable
          patientId={patientId}
          assessments={bodyAssessments}
          loading={isAssessmentsLoading}
          error={assessmentsError}
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
