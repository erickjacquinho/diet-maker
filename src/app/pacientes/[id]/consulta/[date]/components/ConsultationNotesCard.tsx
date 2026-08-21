'use client';

import React from 'react';
import { ClipboardList, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ConsultationRecord } from '@/lib/patientsStore';

export function ConsultationNotesCard({
  consultation,
  bmi,
}: {
  consultation: ConsultationRecord;
  bmi: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-surface border-border-subtle shadow-floating rounded-surface p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <ClipboardList size={16} className="text-success" />
          <h3 className="font-bold text-style-legal text-text-primary tracking-overline">
            Prontuário & Conduta Nutricional
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <span className="text-style-legal font-bold text-text-muted block mb-1">Evolução Clínica</span>
            <p className="text-style-legal text-text-primary leading-relaxed bg-surface-subtle p-3 rounded-control border border-border-subtle">
              {consultation.notes}
            </p>
          </div>

          {consultation.prescribedSupplements && consultation.prescribedSupplements.length > 0 && (
            <div className="pt-2 flex flex-col gap-2">
              <span className="text-style-legal font-bold text-text-muted block">Suplementação Prescrita</span>
              <div className="flex flex-col gap-1.5">
                {consultation.prescribedSupplements.map((supp, i) => (
                  <div key={i} className="flex items-center gap-2 text-style-legal text-text-primary">
                    <CheckCircle2 size={13} className="text-success shrink-0" />
                    <span>{supp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-surface border-border-subtle shadow-floating rounded-surface p-5 flex flex-col gap-3">
        <h3 className="font-bold text-style-legal text-text-primary tracking-overline">
          Resumo Diagnóstico
        </h3>

        <div className="flex flex-col gap-2 text-style-legal">
          <div className="flex justify-between py-1.5 border-b border-border-subtle/60">
            <span className="text-text-muted font-medium">Índice de Massa Corporal (IMC)</span>
            <span className="font-bold text-text-primary">{bmi} kg/m²</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border-subtle/60">
            <span className="text-text-muted font-medium">Status do Plano</span>
            <span className="font-bold text-success">{consultation.diet?.status || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-text-muted font-medium">Data do Registro</span>
            <span className="font-bold text-text-primary">{consultation.date}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
