'use client';

import React, { useState } from 'react';
import { MacroTrackerHeader } from '../organisms';
import { ActionDropdown, PageContextHeader } from '../molecules';
import type { DietModeSwitcherProps } from '../organisms/diet/DietModeSwitcher';
import { Button } from '@/components/atoms';
import { ConfirmationAlertDialog } from '@/components/molecules/ConfirmationAlertDialog';
import {
  MessageCircle,
  FileText,
  Link2,
  Save,
  Edit3,
  History,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { DietContextSection } from '../organisms/diet/DietContextSection';
import { DietMealsSection } from '../organisms/diet/DietMealsSection';
import type { DietBuilderTemplateProps } from './dietBuilderTemplateTypes';

export type { DietBuilderTemplateProps };

export const DietBuilderTemplate: React.FC<DietBuilderTemplateProps> = ({
  patient,
  patientId,
  patientName,
  patientInitials,
  patientObjective,
  patientAge,
  patientHeightCm,
  patientGender,
  dietModeProps,
  macroTrackerData,
  macroMetrics,
  mealsData = [],
  onAddMeal,
  onReorderMeals,
  onOpenAdjustGoalsModal,
  onPullPreviousGoals,
  onOpenImportPreviousDietModal,
  hasPreviousDiets = true,
  onOpenWhatsAppModal,
  onWhatsAppShare,
  onExportPDF,
  onExportPage,
  onSaveDiet,
  onOpenSaveReadyDiet,
  onDiscardDraft,
  canDiscardDraft = true,
  saveStatus = 'clean',
  confirmationBusy = false,
  onBackClick,
}) => {
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const defaultDietModeProps: DietModeSwitcherProps = {
    mode: 'simple',
    onModeChange: () => {},
    variationsCount: 3,
    onVariationsCountChange: () => {},
    variations: [],
    activeVariationId: 'var-high',
    onSelectVariation: () => {},
  };

  const activeDietModeProps: DietModeSwitcherProps = {
    ...defaultDietModeProps,
    ...dietModeProps,
    mode: dietModeProps?.mode || 'simple',
  };

  const resolvedName = patient?.name || patientName || macroTrackerData?.patientName || 'Paciente';
  const resolvedInitials = patient?.initials || patientInitials || macroTrackerData?.patientInitials || 'P';
  const resolvedObjective = patient?.objective || patientObjective || macroTrackerData?.patientGoalDescription || 'Prescrição Alimentar';
  const resolvedAge = patient?.age ?? patientAge ?? macroTrackerData?.patientAge;
  const resolvedHeightCm = patient?.heightCm ?? patientHeightCm ?? macroTrackerData?.patientHeightCm;
  const resolvedGender = patient?.gender ?? patientGender ?? macroTrackerData?.patientGender;
  const resolvedWeightKg = patient?.weightKg ?? macroTrackerData?.patientWeightKg;

  const metricsToRender = macroMetrics || macroTrackerData?.metrics || [];
  const handleAdjustGoals = onOpenAdjustGoalsModal || macroTrackerData?.onAdjustGoals;
  const handleWhatsApp = onOpenWhatsAppModal || onWhatsAppShare;
  const handlePullPrevious = onOpenImportPreviousDietModal || onPullPreviousGoals;
  const isSaveBusy = confirmationBusy || saveStatus === 'saving' || saveStatus === 'committing';
  const isDiscardBlockedBySave = saveStatus === 'pending' || isSaveBusy;

  const headerActions = (
    <>
      {onSaveDiet && (
        <Button
          onClick={onSaveDiet}
          disabled={isSaveBusy}
          variant="primary"
          size="compact"
          className="flex items-center gap-1.5"
          aria-keyshortcuts="Control+s Meta+s"
          aria-label={confirmationBusy ? 'Confirmando prescrição' : 'Salvar Prescrição'}
          title={confirmationBusy ? 'Confirmando prescrição' : 'Salvar Prescrição e fechar (Ctrl+S)'}
        >
          <Save size={14} aria-hidden="true" />
          <span>
            {confirmationBusy
              ? 'Confirmando…'
              : <>Salvar Prescrição <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span></>}
          </span>
        </Button>
      )}

      {onDiscardDraft && canDiscardDraft && (
        <Button
          type="button"
          onClick={() => setIsDiscardDialogOpen(true)}
          disabled={isSaveBusy}
          variant="destructive-outline"
          size="compact"
          className="flex items-center gap-1.5"
          aria-label="Descartar rascunho local"
        >
          <Trash2 size={14} aria-hidden="true" />
          <span>Descartar rascunho</span>
        </Button>
      )}

      <ActionDropdown
        triggerLabel="Exportar Dieta"
        items={[
          {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: <MessageCircle size={14} aria-hidden="true" />,
            onSelect: () => handleWhatsApp?.(),
          },
          {
            id: 'pdf',
            label: 'PDF',
            icon: <FileText size={14} aria-hidden="true" />,
            onSelect: () => onExportPDF?.(),
          },
          {
            id: 'link',
            label: 'Exportar como página externa',
            disabled: !onExportPage,
            icon: <Link2 size={14} aria-hidden="true" />,
            onSelect: () => onExportPage?.(),
          },
        ]}
      />
    </>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {confirmationBusy && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Confirmando a prescrição. Aguarde a conclusão do salvamento.
        </span>
      )}
      <main
        aria-label="Elaboração de Dieta"
        aria-busy={isSaveBusy ? true : undefined}
        inert={confirmationBusy || undefined}
        className="flex w-full max-w-container-workflow flex-1 flex-col gap-6 py-6 px-8 lg:mx-auto"
      >
        <PageContextHeader
          title="Elaboração de Dieta"
          backHref={onBackClick ? undefined : `/pacientes/${patientId}`}
          onBackClick={onBackClick}
          backLabel={`Voltar para a ficha de ${resolvedName}`}
          breadcrumbs={[
            { label: 'Pacientes', href: '/pacientes' },
            { label: resolvedName, href: `/pacientes/${patientId}` },
            { label: 'Dieta' },
          ]}
          actions={headerActions}
        />

        <DietContextSection
          name={resolvedName}
          initials={resolvedInitials}
          objective={resolvedObjective}
          age={resolvedAge}
          heightCm={resolvedHeightCm}
          gender={resolvedGender}
          weightKg={resolvedWeightKg}
          activeDietModeProps={activeDietModeProps}
        />

        <section data-testid="macro-tracker-region" aria-label="Metas nutricionais" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {onOpenSaveReadyDiet && (
              <Button onClick={onOpenSaveReadyDiet} disabled={isSaveBusy} variant="secondary" size="compact" className="flex items-center gap-1.5">
                <Save size={14} aria-hidden="true" />
                <span>Salvar dieta pronta</span>
              </Button>
            )}
            <div className="flex items-center justify-end gap-2 flex-wrap">
              {handlePullPrevious && (
                <Button
                  onClick={handlePullPrevious}
                  disabled={hasPreviousDiets === false}
                  variant="secondary"
                  size="compact"
                  className="flex items-center gap-1.5"
                  title={
                    hasPreviousDiets === false
                      ? 'Nenhuma dieta anterior cadastrada para este paciente'
                      : 'Puxar metas ou refeições de dietas anteriores'
                  }
                >
                  <History size={13} aria-hidden="true" />
                  <span>Puxar Metas Anteriores</span>
                </Button>
              )}
              {handleAdjustGoals && (
                <Button onClick={handleAdjustGoals} variant="secondary" size="compact" className="flex items-center gap-1.5">
                  <Edit3 size={13} aria-hidden="true" />
                  <span>Ajustar Metas</span>
                </Button>
              )}
            </div>
          </div>
          <MacroTrackerHeader
            patientInitials={resolvedInitials}
            patientName={resolvedName}
            patientWeightKg={resolvedWeightKg}
            patientGoalDescription={resolvedObjective}
            metrics={metricsToRender}
            showPatientContext={false}
          />
        </section>

        <DietMealsSection mealsData={mealsData} onAddMeal={onAddMeal} onReorderMeals={onReorderMeals} />
      </main>

      {onDiscardDraft && (
        <ConfirmationAlertDialog
          open={isDiscardDialogOpen}
          onOpenChange={setIsDiscardDialogOpen}
          title="Descartar rascunho local?"
          description={isDiscardBlockedBySave
            ? 'Aguarde o salvamento local terminar antes de descartar. Nenhuma prescrição confirmada será apagada.'
            : 'As alterações ainda não confirmadas serão removidas deste dispositivo. Nenhuma prescrição confirmada será apagada.'}
          confirmLabel="Descartar rascunho"
          confirmPendingLabel="Descartando rascunho..."
          confirmVariant="destructive"
          confirmDisabled={isDiscardBlockedBySave}
          awaitConfirm
          icon={<AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />}
          onConfirm={onDiscardDraft}
        />
      )}
    </div>
  );
};
