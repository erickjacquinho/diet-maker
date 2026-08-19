'use client';

import React from 'react';
import { MacroTrackerHeader } from '../organisms';
import { DietModeSwitcherProps, PageContextHeader } from '../molecules';
import { Button } from '@/components/ui/button';
import {
  Percent,
  MessageCircle,
  FileText,
  Save,
  MoreHorizontal,
  Edit3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  onScaleDiet,
  onOpenScaleModal,
  onOpenAdjustGoalsModal,
  onOpenWhatsAppModal,
  onWhatsAppShare,
  onExportPDF,
  onSaveDiet,
  onBackClick,
}) => {
  const defaultDietModeProps: DietModeSwitcherProps = {
    mode: 'simple',
    onModeChange: () => {},
    variationsCount: 3,
    onVariationsCountChange: () => {},
    variations: [],
    activeVariationId: 'var-high',
    onSelectVariation: () => {},
  };

  const activeDietModeProps = dietModeProps || defaultDietModeProps;

  const resolvedName = patient?.name || patientName || macroTrackerData?.patientName || 'Paciente';
  const resolvedInitials = patient?.initials || patientInitials || macroTrackerData?.patientInitials || 'P';
  const resolvedObjective = patient?.objective || patientObjective || macroTrackerData?.patientGoalDescription || 'Prescrição Alimentar';
  const resolvedAge = patient?.age ?? patientAge ?? macroTrackerData?.patientAge;
  const resolvedHeightCm = patient?.heightCm ?? patientHeightCm ?? macroTrackerData?.patientHeightCm;
  const resolvedGender = patient?.gender ?? patientGender ?? macroTrackerData?.patientGender;
  const resolvedWeightKg = patient?.weightKg ?? macroTrackerData?.patientWeightKg;

  const metricsToRender = macroMetrics || macroTrackerData?.metrics || [];
  const handleAdjustGoals = onOpenAdjustGoalsModal || macroTrackerData?.onAdjustGoals;
  const handleScale = onOpenScaleModal || onScaleDiet;
  const handleWhatsApp = onOpenWhatsAppModal || onWhatsAppShare;

  const headerActions = (
    <>
      {onSaveDiet && (
        <Button onClick={onSaveDiet} variant="primary" size="compact" className="flex items-center gap-1.5">
          <Save size={14} aria-hidden="true" />
          <span>Salvar Prescrição</span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="compact"
            aria-label="Mais ações"
            className="flex items-center gap-1.5"
          >
            <MoreHorizontal size={15} aria-hidden="true" />
            <span>Mais ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onSelect={() => handleWhatsApp?.()}>
            <MessageCircle size={14} aria-hidden="true" />
            <span>WhatsApp</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExportPDF?.()}>
            <FileText size={14} aria-hidden="true" />
            <span>PDF</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <main
        aria-label="Elaboração de Dieta"
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
          <div className="flex items-center justify-end gap-2">
            {handleAdjustGoals && (
              <Button onClick={handleAdjustGoals} variant="secondary" size="compact" className="flex items-center gap-1.5">
                <Edit3 size={13} aria-hidden="true" />
                <span>Ajustar Metas</span>
              </Button>
            )}
            {handleScale && (
              <Button onClick={handleScale} variant="secondary" size="compact" className="flex items-center gap-1.5">
                <Percent size={14} aria-hidden="true" />
                <span>Escalar</span>
              </Button>
            )}
          </div>
          <MacroTrackerHeader
            patientInitials={resolvedInitials}
            patientName={resolvedName}
            patientWeightKg={resolvedWeightKg || 70}
            patientGoalDescription={resolvedObjective}
            metrics={metricsToRender}
            showPatientContext={false}
          />
        </section>

        <DietMealsSection mealsData={mealsData} onAddMeal={onAddMeal} />
      </main>
    </div>
  );
};
