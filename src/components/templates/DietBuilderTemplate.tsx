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
} from '../molecules';
import { Button } from '@/components/ui/button';
import { Plus, Percent, MessageCircle, FileText, Menu, Save, ArrowLeft, Utensils } from 'lucide-react';
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
  dietaId = 'nova',
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

  return (
    <div className="flex-1 min-w-0 flex flex-col w-full">
      {/* Mobile Header */}
      <header className="bg-surface border-b border-border-subtle p-4 flex hidden items-center justify-between">
        <div className="font-bold text-style-body text-text-primary">NutriDiet Pro</div>
        <Button variant="secondary" size="sm" className="flex items-center gap-1">
          <Menu size={14} />
          <span>Menu</span>
        </Button>
      </header>

      <div className="flex-1 p-4 p-6 lg:p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/pacientes/${patientId}`}
                className="inline-flex items-center gap-1.5 text-style-legal font-bold text-text-muted hover:text-text-primary transition-colors bg-surface border border-border-subtle px-3 py-1 rounded-control"
              >
                <ArrowLeft size={13} />
                <span>Voltar ao Prontuário</span>
              </Link>
            </div>
            <h2 className="text-style-section-title font-bold text-text-primary tracking-tight mt-2">
              Elaboração de Plano Alimentar
            </h2>
            <p className="text-style-legal text-text-secondary">
              Paciente: <strong className="text-text-primary font-bold">{patientName}</strong> • Prescrição funcional do zero
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSaveDiet && (
              <Button
                onClick={onSaveDiet}
                variant="default"
                size="sm"
                className="flex items-center gap-1.5 bg-primary hover:bg-black text-white"
              >
                <Save size={14} />
                <span>Salvar Prescrição</span>
              </Button>
            )}

            <Button
              onClick={onAddMeal}
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Nova Refeição</span>
            </Button>

            <Button onClick={onScaleDiet} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <Percent size={14} />
              <span>Escalar</span>
            </Button>

            <Button onClick={onWhatsAppShare} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </Button>

            <Button onClick={onExportPDF} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <FileText size={14} />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* 1. Diet Mode Switcher (Dieta Simples vs Ciclo de Carboidratos) */}
        <DietModeSwitcher {...activeDietModeProps} />

        {/* 2. Macro Tracker Header */}
        <MacroTrackerHeader {...macroTrackerData} />

        {/* 3. Meals Section */}
        {mealsData.length === 0 ? (
          <div className="p-10 text-center bg-surface border-2 border-dashed border-border-subtle rounded-surface flex flex-col gap-4">
            <div className="h-12 w-12 rounded-surface bg-success/10 text-success flex items-center justify-center mx-auto">
              <Utensils size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-style-body font-bold text-text-primary">Nenhuma Refeição Cadastrada</h3>
              <p className="text-style-legal text-text-muted max-w-md mx-auto">
                Crie a primeira refeição da dieta do zero e adicione alimentos diretamente da base TACO.
              </p>
            </div>
            <Button
              onClick={onAddMeal}
              variant="primary"
              className="font-bold text-style-legal px-5 py-2.5 rounded-control inline-flex items-center gap-2"
            >
              <Plus size={15} />
              <span>+ Criar Primeira Refeição do Zero</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {mealsData.map((meal, index) => (
              <MealCardContainer key={index} {...meal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
