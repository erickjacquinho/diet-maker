'use client';

import React from 'react';
import {
  EditAssessmentModal,
  EditPatientModal,
  NextEventModal,
  AddObjectiveModal,
  DeletePatientModal,
} from '@/components/molecules';
import { ReadOnlyDietModal } from '@/components/organisms';
import type { PatientViewModel } from '@/lib/patientViewModel';
import type { BodyAssessment, PatientNextEvent } from '@/lib/patientRelatedRecords';
import type { DietPlan } from '@/lib/domain/diets/diet-model';

export interface PatientProfileModalsProps {
  patient: PatientViewModel;
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
  selectedReadOnlyDiet: DietPlan | null;
  isReadOnlyDietModalOpen: boolean;
  setIsReadOnlyDietModalOpen: (open: boolean) => void;
  handleSavePatient: (p: PatientViewModel) => void | Promise<void>;
  handleDeletePatient: () => void | Promise<void>;
  handleSaveNextEvent: (ev: PatientNextEvent) => void | Promise<void>;
  handleClearNextEvent: () => void | Promise<void>;
  handleAddCustomObjective: (obj: string) => void | Promise<void>;
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
        onConfirmArchive={handleDeletePatient}
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
