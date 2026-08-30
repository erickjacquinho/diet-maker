'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  EditAssessmentModal,
  ReadOnlyDietModal,
  EditPatientModal,
  NextEventModal,
  AddObjectiveModal,
  DeletePatientModal,
  ConfirmationAlertDialog,
} from '@/components/molecules';
import type { PatientViewModel } from '@/lib/patientViewModel';
import type { BodyAssessment, HistoricalDiet, PatientNextEvent } from '@/lib/patientRelatedRecords';

export interface PatientProfileModalsProps {
  patient: PatientViewModel;
  availableObjectives: string[];
  objectiveToApply?: string;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  isDeleteDietModalOpen?: boolean;
  setIsDeleteDietModalOpen?: (open: boolean) => void;
  dietToDelete?: HistoricalDiet | null;
  handleDeleteDiet?: () => void;
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
  isDeleteDietModalOpen,
  setIsDeleteDietModalOpen,
  dietToDelete,
  handleDeleteDiet,
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

      {dietToDelete && isDeleteDietModalOpen !== undefined && setIsDeleteDietModalOpen && handleDeleteDiet && (
        <ConfirmationAlertDialog
          open={isDeleteDietModalOpen}
          onOpenChange={setIsDeleteDietModalOpen}
          title="Excluir prescrição dietética?"
          description={
            <>
              A prescrição <strong>{dietToDelete.name}</strong>
              {dietToDelete.date ? ` (${dietToDelete.date})` : ''} e seus cálculos e cardápios associados serão removidos permanentemente.
            </>
          }
          confirmLabel="Excluir prescrição"
          confirmVariant="destructive"
          icon={<AlertTriangle className="size-4 shrink-0 text-error" aria-hidden="true" />}
          onConfirm={handleDeleteDiet}
        />
      )}

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
