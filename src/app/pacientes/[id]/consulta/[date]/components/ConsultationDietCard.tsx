'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Utensils, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MetricBoxGroup } from '@/components/organisms/MetricBoxGroup';
import { EditIconButton } from '@/components/atoms';
import type { HistoricalDiet } from '@/lib/patientsStore';

export function ConsultationDietCard({
  patientId,
  diet,
}: {
  patientId: string;
  diet: HistoricalDiet;
}) {
  const [expandedMealIndexes, setExpandedMealIndexes] = useState<number[]>([]);

  const toggleMealExpansion = (idx: number) => {
    setExpandedMealIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <Card className="bg-surface border-border-subtle shadow-floating rounded-surface overflow-hidden">
      <div className="p-5 border-b border-border-subtle bg-surface-subtle/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-control bg-success/10 text-success">
            <Utensils size={18} />
          </div>
          <div>
            <h2 className="font-bold text-style-body-small text-text-primary">{diet.name}</h2>
            <span className="text-style-legal text-text-muted">Prescrição calculada para o ciclo atual</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-surface text-text-primary border-border-subtle font-semibold text-style-legal px-2.5 py-0.5">
            Dieta
          </Badge>
          <Link href={`/pacientes/${patientId}/dieta/${diet.id}`} title="Editar Dieta">
            <EditIconButton title="Editar Dieta" />
          </Link>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col gap-5">
        <MetricBoxGroup
          items={[
            { size: 'standard', tone: 'muted', label: 'Meta Calórica', value: `${diet.targetKcal} kcal` },
            { size: 'standard', tone: 'protein', label: 'Proteínas', value: `${diet.proteinG}g` },
            { size: 'standard', tone: 'carbohydrate', label: 'Carboidratos', value: `${diet.carbsG}g` },
            { size: 'standard', tone: 'success', label: 'Gorduras', value: `${diet.fatsG}g` },
          ]}
        />

        {diet.meals && (
          <div className="flex flex-col gap-3 pt-2">
            <h3 className="text-style-legal font-bold text-text-primary tracking-overline flex items-center gap-1.5">
              <Sparkles size={13} className="text-success" />
              <span>Refeições Programadas da Consulta</span>
            </h3>

            <div className="flex flex-col gap-2">
              {diet.meals.map((meal, idx) => {
                const isExpanded = expandedMealIndexes.includes(idx);
                return (
                  <div key={idx} className="bg-surface-subtle/70 border border-border-subtle rounded-control overflow-hidden transition-colors duration-standard">
                    <div
                      onClick={() => toggleMealExpansion(idx)}
                      className="p-3 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-style-legal text-text-primary">{meal.name}</span>
                        <span className="text-style-legal font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-control border border-border-subtle">
                          {meal.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-style-legal">
                        <div className="text-text-muted font-medium text-style-legal flex items-center gap-1.5">
                          <span className="text-macro-protein font-bold">{meal.proteinG}g</span>
                          <span>•</span>
                          <span className="text-macro-carbohydrate font-bold">{meal.carbsG}g</span>
                          <span>•</span>
                          <span className="text-macro-fat font-bold">{meal.fatsG}g</span>
                        </div>
                        <span className="font-semibold text-style-legal text-text-muted bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-surface">
                          {meal.kcal} kcal
                        </span>
                        <div className="text-text-muted hover:text-text-primary transition-colors">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-border-subtle/60 bg-surface/60 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-style-legal font-bold text-text-muted tracking-overline">
                          <Utensils size={12} className="text-success" />
                          <span>Composição e Alimentos da Refeição</span>
                        </div>
                        <p className="text-style-legal text-text-primary leading-relaxed bg-surface-subtle p-2.5 rounded-control border border-border-subtle/70">
                          {meal.itemsSummary || 'Alimentos selecionados de acordo com o plano nutricional.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
