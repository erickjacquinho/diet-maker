'use client';

import React from 'react';
import {
  MacroTrackerHeader,
  MealCardContainer,
  MacroTrackerHeaderProps,
  MealCardContainerProps,
} from '../organisms';
import {
  DietModeSwitcher,
  DietModeSwitcherProps,
  PatientBadgeHeader,
  PageContextHeader,
} from '../molecules';
import { Surface } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Percent,
  MessageCircle,
  FileText,
  Save,
  ArrowLeft,
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
import Link from 'next/link';

export interface DietBuilderTemplateProps {
  patientId?: string;
  patientName?: string;
  dietaId?: string;
  dietModeProps?: DietModeSwitcherProps;
  macroTrackerData: MacroTrackerHeaderProps;
  mealsData: MealCardContainerProps[];
  onAddMeal?: () => void;
  onScaleDiet?: () => void;
  onWhatsAppShare?: () => void;
  onExportPDF?: () => void;
  onSaveDiet?: () => void;
  onOpenFoodSearchForMeal?: (mealIndex: number) => void;
}

export const DietBuilderTemplate: React.FC<DietBuilderTemplateProps> = ({
  patientId = 'pat-1',
  patientName = 'Paciente',
  dietModeProps,
  macroTrackerData,
  mealsData,
  onAddMeal,
  onScaleDiet,
  onWhatsAppShare,
  onExportPDF,
  onSaveDiet,
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
          <DropdownMenuItem onSelect={() => onWhatsAppShare?.()}>
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

  const resolvedPatientName = patientName || 'Paciente';

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <main
        aria-label="Elaboração de Dieta"
        className="flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 lg:mx-auto lg:p-8"
      >
        <PageContextHeader
          title="Elaboração de Dieta"
          backHref={`/pacientes/${patientId}`}
          backLabel={`Voltar para a ficha de ${resolvedPatientName}`}
          breadcrumbs={[
            { label: 'Pacientes', href: '/pacientes' },
            { label: resolvedPatientName, href: `/pacientes/${patientId}` },
            { label: 'Dieta' },
          ]}
          actions={headerActions}
        />

        <section
          aria-label="Contexto da dieta"
          data-testid="diet-context-card"
        >
          <Surface variant="default" density="highlight" className="p-0">
            <div className="p-5 lg:p-6">
              <div className="grid grid-cols-12 items-center gap-6">
                <div className="col-span-5 flex min-w-0 items-center border-r border-border-subtle pr-6">
                  <PatientBadgeHeader
                    initials={macroTrackerData.patientInitials}
                    name={macroTrackerData.patientName}
                    weightKg={macroTrackerData.patientWeightKg}
                    goalDescription={macroTrackerData.patientGoalDescription}
                    compact
                    showAdjustGoals={false}
                  />
                </div>

                <div className="col-span-7 min-w-0">
                  <DietModeSwitcher {...activeDietModeProps} embedded />
                </div>
              </div>
            </div>
          </Surface>
        </section>

        <section data-testid="macro-tracker-region" aria-label="Metas nutricionais" className="flex flex-col gap-3">
          <div className="flex items-center justify-end gap-2">
            {macroTrackerData.onAdjustGoals && (
              <Button onClick={macroTrackerData.onAdjustGoals} variant="secondary" size="compact" className="flex items-center gap-1.5">
                <Edit3 size={13} aria-hidden="true" />
                <span>Ajustar Metas</span>
              </Button>
            )}
            <Button onClick={onScaleDiet} variant="secondary" size="compact" className="flex items-center gap-1.5">
              <Percent size={14} aria-hidden="true" />
              <span>Escalar</span>
            </Button>
          </div>
          <MacroTrackerHeader {...macroTrackerData} showPatientContext={false} />
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
            <div className="p-8 text-center bg-surface border-2 border-dashed border-border-subtle rounded-surface flex flex-col gap-4">
              <div className="h-12 w-12 rounded-surface bg-success/10 text-success flex items-center justify-center mx-auto">
                <Utensils size={24} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-style-body font-bold text-text-primary">Nenhuma Refeição Cadastrada</h3>
                <p className="text-style-legal text-text-muted max-w-md mx-auto">
                  Use “Nova Refeição” para começar a prescrição e adicionar alimentos diretamente da base TACO.
                </p>
              </div>
            </div>
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
