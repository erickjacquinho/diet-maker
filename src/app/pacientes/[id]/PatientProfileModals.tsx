'use client';

import React from 'react';
import {
  EditAssessmentModal,
  ReadOnlyDietModal,
  EditPatientModal,
  NextEventModal,
  AddObjectiveModal,
  DeletePatientModal,
} from '@/components/molecules';
import type { Patient, BodyAssessment, HistoricalDiet, PatientNextEvent } from '@/lib/patientsStore';

export interface PatientProfileModalsProps {
  patient: Patient;
  availableObjectives: string[];
  objectiveToApply?: string;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  isNextEventModalOpen: boolean;
  setIsNextEventModalOpen: (open: boolean) => void;
  isAddObjectiveModalOpen: boolean;
  setIsAddObjectiveModalOpen: (open: boolean) => void;
  isEditAssessmentOpen: boolean;
  setIsEditAssessmentOpen: (open: boolean) => void;
  editingAssessment: BodyAssessment | null;
  assessmentMode: 'create' | 'edit';
  selectedReadOnlyDiet: HistoricalDiet | null;
  isReadOnlyDietModalOpen: boolean;
  setIsReadOnlyDietModalOpen: (open: boolean) => void;
  handleSavePatient: (p: Patient) => void;
  handleDeletePatient: () => void;
  handleSaveNextEvent: (ev: PatientNextEvent) => void;
  handleClearNextEvent: () => void;
  handleAddCustomObjective: (obj: string) => void;
  handleSaveAssessment: (ass: BodyAssessment) => void;
}

export function PatientProfileModals({
  patient,
  availableObjectives,
  objectiveToApply,
  isEditModalOpen,
  setIsEditModalOpen,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  isNextEventModalOpen,
  setIsNextEventModalOpen,
  isAddObjectiveModalOpen,
  setIsAddObjectiveModalOpen,
  isEditAssessmentOpen,
  setIsEditAssessmentOpen,
  editingAssessment,
  assessmentMode,
  selectedReadOnlyDiet,
  isReadOnlyDietModalOpen,
  setIsReadOnlyDietModalOpen,
  handleSavePatient,
  handleDeletePatient,
  handleSaveNextEvent,
  handleClearNextEvent,
  handleAddCustomObjective,
  handleSaveAssessment,
}: PatientProfileModalsProps) {
  return (
    <>
      <EditPatientModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        patient={patient}
        objectives={availableObjectives}
        onSave={handleSavePatient}
        onRequestAddObjective={() => setIsAddObjectiveModalOpen(true)}
        objectiveToApply={objectiveToApply}
      />

      <DeletePatientModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        patientName={patient.name}
        onConfirmDelete={handleDeletePatient}
      />

      <NextEventModal
        open={isNextEventModalOpen}
        onOpenChange={setIsNextEventModalOpen}
        nextEvent={patient.nextEvent || null}
        onSave={handleSaveNextEvent}
        onClear={handleClearNextEvent}
      />

      <AddObjectiveModal
        open={isAddObjectiveModalOpen}
        onOpenChange={setIsAddObjectiveModalOpen}
        onAddObjective={handleAddCustomObjective}
      />

      <EditAssessmentModal
        open={isEditAssessmentOpen}
        onOpenChange={setIsEditAssessmentOpen}
        patient={patient}
        assessment={editingAssessment}
        mode={assessmentMode}
        onSave={handleSaveAssessment}
      />

      {selectedReadOnlyDiet && (
        <ReadOnlyDietModal
          isOpen={isReadOnlyDietModalOpen}
          onClose={() => setIsReadOnlyDietModalOpen(false)}
          diet={selectedReadOnlyDiet}
          patientName={patient.name}
        />
      )}
    </>
  );
}
