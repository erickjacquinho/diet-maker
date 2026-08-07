'use client';

import React from 'react';
import {
  MacroTrackerHeader,
  MealCardContainer,
  PatientProfileHeader,
  MacroTrackerHeaderProps,
  MealCardContainerProps,
} from '../organisms';
import {
  DietModeSwitcher,
  DietModeSwitcherProps,
  PatientBadgeHeader,
  PageContextHeader,
  MacroMetricCardProps,
} from '../molecules';
import { Surface } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Percent,
  MessageCircle,
  FileText,
  Save,
  Utensils,
  MoreHorizontal,
  Edit3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DietBuilderTemplateProps {
  patient?: {
    id?: string;
    name?: string;
    initials?: string;
    age?: number;
    heightCm?: number;
    weightKg?: number;
    gender?: string;
    objective?: string;
  };
  patientId?: string;
  patientName?: string;
  patientInitials?: string;
  patientObjective?: string;
  patientAge?: number;
  patientHeightCm?: number;
  patientGender?: string;
  dietaId?: string;
  mode?: 'simple' | 'carb_cycling';
  onModeChange?: (mode: 'simple' | 'carb_cycling') => void;
  dietModeProps?: DietModeSwitcherProps;
  macroTrackerData?: MacroTrackerHeaderProps;
  macroMetrics?: MacroMetricCardProps[];
  mealsData?: MealCardContainerProps[];
  meals?: any[];
  onAddMeal?: () => void;
  onRemoveMeal?: (index: number) => void;
  onUpdateMealHeader?: (index: number, title: string, time: string) => void;
  onAddFoodClick?: (index: number) => void;
  onUpdateItemGram?: (mealIndex: number, itemIndex: number, newGrams: number) => void;
  onRemoveItem?: (mealIndex: number, itemIndex: number) => void;
  onScaleDiet?: () => void;
  onOpenScaleModal?: () => void;
  onOpenCopyModal?: () => void;
  onOpenAdjustGoalsModal?: () => void;
  onOpenWhatsAppModal?: () => void;
  onWhatsAppShare?: () => void;
  onExportPDF?: () => void;
  onSaveDiet?: () => void;
  onBackClick?: () => void;
  carbCyclingVariations?: any[];
  activeVariationId?: string;
  onSelectVariation?: (id: string) => void;
  onOpenFoodSearchForMeal?: (mealIndex: number) => void;
}

export const DietBuilderTemplate: React.FC<DietBuilderTemplateProps> = ({
  patient,
  patientId = 'pat-1',
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
        className="flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 lg:mx-auto lg:p-8"
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

        <section
          aria-label="Contexto da dieta"
          data-testid="diet-context-card"
        >
          <Surface variant="default" density="compact" className="p-6">
            <PatientProfileHeader.Root
              patient={{
                name: resolvedName,
                initials: resolvedInitials,
                objective: resolvedObjective,
                age: resolvedAge,
                heightCm: resolvedHeightCm,
                gender: resolvedGender,
                weightKg: resolvedWeightKg,
              }}
              className="border-b-0 pb-0"
            >
              <PatientProfileHeader.Identity>
                <PatientProfileHeader.Avatar variant="charcoal" size="lg" />
                <PatientProfileHeader.Info>
                  <div className="flex flex-wrap items-center gap-2">
                    <PatientProfileHeader.Name />
                    <PatientProfileHeader.Gender />
                    <PatientProfileHeader.Badge />
                  </div>
                  <PatientProfileHeader.Meta />
                </PatientProfileHeader.Info>
              </PatientProfileHeader.Identity>

              <PatientProfileHeader.Actions>
                <DietModeSwitcher {...activeDietModeProps} embedded />
              </PatientProfileHeader.Actions>
            </PatientProfileHeader.Root>
          </Surface>
        </section>

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

        <section aria-labelledby="meals-heading" className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <h2 id="meals-heading" className="text-style-subsection-title font-bold tracking-tight text-text-primary">
                Refeições
              </h2>
              <p className="text-style-legal text-text-muted">Organize as refeições e alimentos prescritos para o paciente.</p>
            </div>
            <Button onClick={onAddMeal} variant="secondary" size="compact" className="flex items-center gap-1.5 self-auto">
              <Plus size={14} aria-hidden="true" />
              <span>Nova Refeição</span>
            </Button>
          </div>

          {mealsData.length === 0 ? (
            <Card className="p-8 text-center bg-surface-subtle/50 border-border-subtle flex flex-col items-center gap-4 shadow-none">
              <div className="h-12 w-12 rounded-surface bg-success/10 text-success flex items-center justify-center mx-auto">
                <Utensils size={24} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-style-body font-bold text-text-primary">Nenhuma Refeição Cadastrada</h3>
                <p className="text-style-legal text-text-muted max-w-md mx-auto">
                  Use “Nova Refeição” para começar a prescrição e adicionar alimentos diretamente da base TACO.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {mealsData.map((meal, index) => (
                <MealCardContainer key={index} {...meal} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
