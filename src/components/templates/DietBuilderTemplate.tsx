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
      <header className="bg-warm-card border-b border-warm-border p-4 flex md:hidden items-center justify-between">
        <div className="font-black text-base text-warm-charcoal">NutriDiet Pro</div>
        <Button variant="secondary" size="sm" className="flex items-center space-x-1">
          <Menu size={14} />
          <span>Menu</span>
        </Button>
      </header>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/pacientes/${patientId}`}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-warm-muted hover:text-warm-charcoal transition-colors bg-warm-card border border-warm-border px-3 py-1 rounded-xl"
              >
                <ArrowLeft size={13} />
                <span>Voltar ao Prontuário</span>
              </Link>
            </div>
            <h2 className="text-2xl font-black text-warm-charcoal tracking-tight mt-2">
              Elaboração de Plano Alimentar
            </h2>
            <p className="text-xs text-warm-secondary">
              Paciente: <strong className="text-warm-charcoal font-bold">{patientName}</strong> • Prescrição funcional do zero
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSaveDiet && (
              <Button
                onClick={onSaveDiet}
                variant="default"
                size="sm"
                className="flex items-center space-x-1.5 bg-warm-charcoal hover:bg-black text-white"
              >
                <Save size={14} />
                <span>Salvar Prescrição</span>
              </Button>
            )}

            <Button
              onClick={onAddMeal}
              variant="emerald"
              size="sm"
              className="flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Nova Refeição</span>
            </Button>

            <Button onClick={onScaleDiet} variant="secondary" size="sm" className="flex items-center space-x-1.5">
              <Percent size={14} />
              <span>Escalar</span>
            </Button>

            <Button onClick={onWhatsAppShare} variant="secondary" size="sm" className="flex items-center space-x-1.5">
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </Button>

            <Button onClick={onExportPDF} variant="secondary" size="sm" className="flex items-center space-x-1.5">
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
          <div className="p-10 text-center bg-warm-card border-2 border-dashed border-warm-border rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-warm-emerald/10 text-warm-emerald flex items-center justify-center mx-auto">
              <Utensils size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-warm-charcoal">Nenhuma Refeição Cadastrada</h3>
              <p className="text-xs text-warm-muted max-w-md mx-auto">
                Crie a primeira refeição da dieta do zero e adicione alimentos diretamente da base TACO.
              </p>
            </div>
            <Button
              onClick={onAddMeal}
              variant="emerald"
              className="font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center space-x-2"
            >
              <Plus size={15} />
              <span>+ Criar Primeira Refeição do Zero</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealsData.map((meal, index) => (
              <MealCardContainer key={index} {...meal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
