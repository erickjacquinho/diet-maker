'use client';

import React from 'react';
import { Scale, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricBox } from '@/components/molecules';
import { EditIconButton } from '@/components/atoms';
import { BodyAssessment } from '@/lib/patientsStore';

export function ConsultationAssessmentCard({
  assessment,
  onEdit,
}: {
  assessment: BodyAssessment;
  onEdit: () => void;
}) {
  return (
    <Card className="bg-surface border-border-subtle shadow-floating rounded-surface overflow-hidden">
      <div className="p-5 border-b border-border-subtle bg-surface-subtle/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-control bg-primary-soft text-primary">
            <Scale size={18} />
          </div>
          <div>
            <h2 className="font-bold text-style-body-small text-text-primary">Avaliação Física & Antropometria</h2>
            <span className="text-style-legal text-text-muted">Medições corporais efetuadas nesta consulta</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-style-legal font-bold text-success flex items-center gap-1 bg-success/10 px-2.5 py-1 rounded-surface">
            <TrendingDown size={12} />
            <span>Evolução Favorável</span>
          </span>
          <EditIconButton onClick={onEdit} title="Editar Avaliação Física" />
        </div>
      </div>

      <CardContent className="p-5">
        <div className="grid grid-cols-4 gap-3 text-center">
          <MetricBox size="standard" label="Peso Corporal" value={`${assessment.weightKg} kg`} />
          <MetricBox size="standard" label="% Gordura (BF)" value={`${assessment.bodyFatPercent}%`} />
          <MetricBox size="standard" label="Massa Magra" value={`${assessment.muscleMassKg} kg`} />
          <MetricBox size="standard" label="Cintura" value={`${assessment.waistCm} cm`} />
        </div>
      </CardContent>
    </Card>
  );
}
