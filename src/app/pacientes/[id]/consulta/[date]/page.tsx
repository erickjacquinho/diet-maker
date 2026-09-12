'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Utensils, Activity, Scale, Printer } from 'lucide-react';
import { PageContextHeader } from '@/components/molecules';
import { Card } from '@/components/ui/card';
import { SecondaryActionButton } from '@/components/atoms';
import { toast } from 'sonner';
import type { Patient } from '@/lib/domain/patient';
import type { ConsultationView } from '@/lib/domain/clinical';
import { getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { ClinicalApplicationError } from '@/lib/domain/clinical';
import { toClinicalConsultationDate, toLegacyAssessment } from '@/lib/application/patients/clinical-ui-adapter';
import { ConsultationAssessmentCard } from './components/ConsultationAssessmentCard';
import { ConsultationNotesCard } from './components/ConsultationNotesCard';
import { ConsultationDietCard } from './components/ConsultationDietCard';
import type { HistoricalDiet } from '@/lib/application/patients/clinical-ui-adapter';

function toHistoricalDiet(plan: ConsultationView['diets'][number]): HistoricalDiet {
  const variation = plan.variations[0];
  return {
    id: plan.id,
    name: plan.name,
    date: plan.activatedAt.slice(0, 10),
    targetKcal: Number(variation?.targets.energyKcal ?? 0),
    proteinG: Number(variation?.targets.protein ?? 0),
    carbsG: Number(variation?.targets.carbs ?? 0),
    fatsG: Number(variation?.targets.fat ?? 0),
    status: plan.status === 'ACTIVE' ? 'Ativa' : 'Histórica',
    mode: plan.mode === 'CARB_CYCLING' ? 'carb_cycling' : 'simple',
  };
}

export default function DedicatedConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const rawDate = params?.date as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState<ConsultationView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleOpenEditAssessment = () => {
    if (consultation?.assessments[0] && patient) {
      router.push(`/pacientes/${patient.id}/avaliacao/${consultation.assessments[0].id}`);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!patientId || !rawDate) return undefined;
    setIsLoading(true);
    setError(null);
    void getBrowserPatientApplication().then((application) => application.getConsultationView(patientId, toClinicalConsultationDate(decodeURIComponent(rawDate).replace(/-/g, '/'))))
      .then((view) => {
        if (cancelled) return;
        setPatient(view.patient);
        setConsultation(view);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setPatient(null);
        setConsultation(null);
        setError(cause instanceof ClinicalApplicationError ? cause.message : 'Não foi possível carregar a consulta.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [patientId, rawDate]);

  if (isLoading) {
    return <div role="status" aria-live="polite" className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-muted text-style-body-small">Carregando consulta…</div>;
  }

  if (!patient || !consultation) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-muted text-style-body-small">
        <Card className="bg-surface border-border-subtle rounded-surface p-8 max-w-md mx-auto text-center flex flex-col gap-4 shadow-floating">
          <h3 className="font-bold text-style-body text-text-primary">Registro de Consulta Não Encontrado</h3>
          <p className="text-style-legal text-text-muted leading-relaxed">
            {error ?? 'Não foi possível localizar o paciente ou o registro desta consulta.'}
          </p>
          <Link href="/pacientes" className="inline-block pt-2">
            <SecondaryActionButton icon={<ArrowLeft size={14} />}>
              Voltar para Pacientes
            </SecondaryActionButton>
          </Link>
        </Card>
      </div>
    );
  }

  const heightM = patient.heightCm / 100;
  const currentWeight = consultation.assessments[0]?.weightKg || patient.weightKg;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);
  const consultationDateLabel = consultation.date.replace(/-/g, '/');

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full text-text-primary">
      <PageContextHeader
        title={`Registro de Consulta — ${consultationDateLabel}`}
        backHref={`/pacientes/${patient.id}`}
        backLabel={`Voltar para a ficha de ${patient.name}`}
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: patient.name, href: `/pacientes/${patient.id}` },
          { label: 'Consulta' },
        ]}
        actions={(
          <>
            <SecondaryActionButton
              onClick={() => toast.info('Função de impressão/exportação acionada')}
              icon={<Printer size={14} className="text-text-muted" />}
            >
              Imprimir Prontuário
            </SecondaryActionButton>

          </>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {consultation.diets.length > 0 ? consultation.diets.map((diet) => (
            <ConsultationDietCard key={diet.id} patientId={patient.id} diet={toHistoricalDiet(diet)} />
          )) : (
            <Card className="bg-surface border border-dashed border-border-subtle p-6 rounded-surface text-center flex flex-col gap-2">
              <Utensils size={24} className="mx-auto text-text-muted/50" />
              <p className="text-style-legal text-text-muted italic">
                As prescrições confirmadas ficam disponíveis no histórico da ficha do paciente.
              </p>
            </Card>
          )}

          {consultation.assessments.length > 0 ? (
            consultation.assessments.map((assessment) => (
              <ConsultationAssessmentCard key={assessment.id} assessment={toLegacyAssessment(assessment)} onEdit={handleOpenEditAssessment} />
            ))
          ) : (
            <Card className="bg-surface border border-dashed border-border-subtle p-6 rounded-surface text-center flex flex-col gap-2">
              <Activity size={24} className="mx-auto text-text-muted/50" />
              <p className="text-style-legal text-text-muted italic">Nenhuma medição física foi registrada nesta consulta.</p>
            </Card>
          )}
        </div>

        <ConsultationNotesCard consultation={{ date: consultationDateLabel, notes: 'Sem observações registradas para esta consulta.', prescribedSupplements: consultation.prescribedSupplements }} bmi={bmi} />
      </div>
    </div>
  );
}
