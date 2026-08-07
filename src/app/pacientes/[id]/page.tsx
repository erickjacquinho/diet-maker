'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Utensils, Calendar, MessageCircle, AlertTriangle } from 'lucide-react';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { CreateButton, SecondaryActionButton, Surface, EditIconButton, DeleteIconButton } from '@/components/atoms';
import {
  PatientConsultationHistoryTable,
  PatientProfileHeader,
  ConsolidatedConsultationUpdate,
} from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { PatientProfileModals } from './PatientProfileModals';

export default function PatientDetailPage() {
  const {
    patientId,
    patient,
    dietHistory,
    bodyAssessments,
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

  const consultationUpdates: ConsolidatedConsultationUpdate[] = useMemo(() => {
    const map = new Map<string, ConsolidatedConsultationUpdate>();

    dietHistory.forEach((d) => {
      if (!map.has(d.date)) {
        map.set(d.date, { date: d.date, diet: d });
      } else {
        map.get(d.date)!.diet = d;
      }
    });

    bodyAssessments.forEach((a) => {
      if (!map.has(a.date)) {
        map.set(a.date, { date: a.date, assessment: a });
      } else {
        map.get(a.date)!.assessment = a;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [dietHistory, bodyAssessments]);

  if (!patient) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Paciente Não Encontrado</h2>
        <p className="text-slate-500 mb-6">O paciente solicitado não existe ou foi removido.</p>
        <Link href="/pacientes">
          <SecondaryActionButton icon={<ArrowLeft size={14} />}>Voltar para Lista de Pacientes</SecondaryActionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-7xl">
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
          {whatsappUrl && (
            <Button
              variant="secondary"
              size="compact"
              onClick={() => window.open(whatsappUrl, '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-1 text-emerald-600" />
              WhatsApp
            </Button>
          )}
          <Button variant="secondary" size="compact" onClick={() => setIsNextEventModalOpen(true)}>
            <Calendar className="w-4 h-4 mr-1 text-indigo-600" />
            Acompanhamento
          </Button>
          <EditIconButton onClick={() => setIsEditModalOpen(true)} title="Editar dados do paciente" />
          <DeleteIconButton onClick={() => setIsDeleteModalOpen(true)} title="Excluir paciente" />
        </PatientProfileHeader.Actions>
      </PatientProfileHeader>

      <Surface className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Histórico de Consultas & Acompanhamento
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
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
