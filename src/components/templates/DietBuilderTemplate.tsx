import React from 'react';
import { MacroTrackerHeader, MealCardContainer, MacroTrackerHeaderProps, MealCardContainerProps } from '../organisms';
import { Button } from '@/components/ui/button';
import { Plus, Percent, MessageCircle, FileText, Menu } from 'lucide-react';

export interface DietBuilderTemplateProps {
  macroTrackerData: MacroTrackerHeaderProps;
  mealsData: MealCardContainerProps[];
  onAddMeal?: () => void;
  onScaleDiet?: () => void;
  onWhatsAppShare?: () => void;
  onExportPDF?: () => void;
}

export const DietBuilderTemplate: React.FC<DietBuilderTemplateProps> = ({
  macroTrackerData,
  mealsData,
  onAddMeal,
  onScaleDiet,
  onWhatsAppShare,
  onExportPDF,
}) => {
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
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-warm-charcoal tracking-tight">Plano Alimentar Ativo</h2>
            <p className="text-xs text-warm-secondary">Elaboração visual com acompanhamento de metas manuais</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={onAddMeal} variant="default" size="sm" className="flex items-center space-x-1.5 bg-warm-emerald text-white">
              <Plus size={14} />
              <span>Nova Refeição</span>
            </Button>
            <Button onClick={onScaleDiet} variant="secondary" size="sm" className="flex items-center space-x-1.5">
              <Percent size={14} />
              <span>Escalar Dieta</span>
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

        {/* 3. Macro Tracker Section */}
        <MacroTrackerHeader {...macroTrackerData} />

        {/* 4. Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealsData.map((meal, index) => (
            <MealCardContainer key={index} {...meal} />
          ))}
        </div>
      </div>
    </div>
  );
};

