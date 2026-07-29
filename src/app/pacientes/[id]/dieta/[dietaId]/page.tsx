'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DietBuilderTemplate } from '@/components/templates';
import { MacroMetricCardProps } from '@/components/molecules';
import { Badge } from '@/components/ui/badge';

export default function DietBuilderPage() {
  const params = useParams();
  const patientId = params?.id as string || 'pat-1';
  const dietaId = params?.dietaId as string || 'nova';

  const macroMetrics: MacroMetricCardProps[] = [
    {
      label: 'Kcal Total',
      currentValue: '2.450',
      targetValue: '2.400 kcal',
      statusBadgeText: '102%',
      statusBadgeVariant: 'neutral',
      percentage: 100,
      macroColor: 'emerald',
    },
    {
      label: 'Proteínas',
      currentValue: '168g',
      targetValue: '165g',
      statusBadgeText: 'Na meta ✓',
      statusBadgeVariant: 'emerald',
      percentage: 100,
      gPerKgRatio: '2.03 g/kg',
      gPerKgMeta: '2.0',
      macroColor: 'rose',
    },
    {
      label: 'Carboidratos',
      currentValue: '268g',
      targetValue: '280g',
      statusBadgeText: '-12g restante',
      statusBadgeVariant: 'amber',
      percentage: 95,
      gPerKgRatio: '3.24 g/kg',
      gPerKgMeta: '3.4',
      macroColor: 'amber',
    },
    {
      label: 'Gorduras',
      currentValue: '64g',
      targetValue: '65g',
      statusBadgeText: 'Na meta ✓',
      statusBadgeVariant: 'emerald',
      percentage: 98,
      gPerKgRatio: '0.77 g/kg',
      gPerKgMeta: '0.8',
      macroColor: 'teal',
    },
  ];

  const meals = [
    {
      title: 'Café da Manhã',
      time: '07:30',
      kcal: 520,
      proteinG: 34,
      carbsG: 58,
      fatsG: 14,
      items: [
        {
          name: 'Ovo de galinha inteiro cozido',
          kcal: 219,
          protein: 20,
          carbs: 0.9,
          fats: 14,
          quantityGrams: 150,
        },
        {
          name: 'Aveia em flocos',
          kcal: 197,
          protein: 7,
          carbs: 33,
          fats: 4,
          quantityGrams: 50,
        },
        {
          name: 'Banana prata',
          kcal: 98,
          protein: 1.3,
          carbs: 26,
          fats: 0.1,
          quantityGrams: 100,
        },
      ],
    },
    {
      title: 'Almoço',
      time: '12:30',
      kcal: 780,
      proteinG: 62,
      carbsG: 75,
      fatsG: 18,
      items: [
        {
          name: 'Peito de frango grelhado',
          kcal: 297,
          protein: 55.8,
          carbs: 0,
          fats: 6.4,
          quantityGrams: 180,
        },
        {
          name: 'Arroz branco cozido',
          kcal: 256,
          protein: 5,
          carbs: 56.2,
          fats: 0.4,
          quantityGrams: 200,
        },
        {
          name: 'Azeite de oliva extra virgem',
          kcal: 88,
          protein: 0,
          carbs: 0,
          fats: 10,
          quantityGrams: 10,
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb Bar */}
      <div className="px-6 pt-4 flex items-center justify-between">
        <Link
          href={`/pacientes/${patientId}`}
          className="inline-flex items-center space-x-2 text-xs font-bold text-warm-muted hover:text-warm-charcoal transition-colors bg-warm-card border border-warm-border px-3 py-1.5 rounded-xl"
        >
          <ArrowLeft size={14} />
          <span>Voltar ao Prontuário</span>
        </Link>
        <Badge variant="default" className="text-[11px] font-bold bg-warm-emerald/10 text-warm-emerald uppercase">
          {dietaId === 'nova' ? 'Criando Nova Prescrição' : `Editando Prescrição ${dietaId}`}
        </Badge>
      </div>

      <DietBuilderTemplate
        macroTrackerData={{
          patientInitials: 'CE',
          patientName: 'Carlos Eduardo Silva',
          patientWeightKg: 82.5,
          patientGoalDescription: 'Hipertrofia Muscular e Definição • Metas Manuais',
          metrics: macroMetrics,
        }}
        mealsData={meals}
      />
    </div>
  );
}

