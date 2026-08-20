'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Utensils, Activity, Scale, Printer } from 'lucide-react';
import { PageContextHeader } from '@/components/molecules';
import { Card } from '@/components/ui/card';
import { CreateButton, SecondaryActionButton } from '@/components/atoms';
import { toast } from 'sonner';
import {
  getPatientById,
  getConsultationRecord,
  Patient,
  ConsultationRecord,
} from '@/lib/patientsStore';
import { ConsultationDietCard } from './components/ConsultationDietCard';
import { ConsultationAssessmentCard } from './components/ConsultationAssessmentCard';
import { ConsultationNotesCard } from './components/ConsultationNotesCard';

export default function DedicatedConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const rawDate = params?.date as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState<ConsultationRecord | null>(null);

  const handleOpenEditAssessment = () => {
    if (consultation?.assessment && patient) {
      router.push(`/pacientes/${patient.id}/avaliacao/${consultation.assessment.id}`);
    }
  };

  useEffect(() => {
    if (patientId && rawDate) {
      const foundPatient = getPatientById(patientId);
      setPatient(foundPatient);

      const rec = getConsultationRecord(patientId, rawDate);
      setConsultation(rec);
    }
  }, [patientId, rawDate]);

  if (!patient || !consultation) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-muted text-style-body-small">
        <Card className="bg-surface border-border-subtle rounded-surface p-8 max-w-md mx-auto text-center flex flex-col gap-4 shadow-floating">
          <h3 className="font-bold text-style-body text-text-primary">Registro de Consulta Não Encontrado</h3>
          <p className="text-style-legal text-text-muted leading-relaxed">
            Não foi possível localizar o paciente ou o registro desta consulta.
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
  const currentWeight = consultation.assessment?.weightKg || patient.weightKg;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full text-text-primary">
      <PageContextHeader
        title={`Registro de Consulta — ${consultation.date}`}
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

            {consultation.diet && (
              <Link href={`/pacientes/${patient.id}/dieta/${consultation.diet.id}`}>
                <CreateButton icon={<Utensils size={14} />}>
                  Abrir no Construtor de Dietas
                </CreateButton>
              </Link>
            )}
          </>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {consultation.diet ? (
            <ConsultationDietCard patientId={patient.id} diet={consultation.diet} />
          ) : (
            <Card className="bg-surface border border-dashed border-border-subtle p-6 rounded-surface text-center flex flex-col gap-2">
              <Utensils size={24} className="mx-auto text-text-muted/50" />
              <p className="text-style-legal text-text-muted italic">Nenhuma prescrição dietética foi associada a este dia de consulta.</p>
            </Card>
          )}

          {consultation.assessment ? (
            <ConsultationAssessmentCard assessment={consultation.assessment} onEdit={handleOpenEditAssessment} />
          ) : (
            <Card className="bg-surface border border-dashed border-border-subtle p-6 rounded-surface text-center flex flex-col gap-2">
              <Activity size={24} className="mx-auto text-text-muted/50" />
              <p className="text-style-legal text-text-muted italic">Nenhuma medição física foi registrada nesta consulta.</p>
            </Card>
          )}
        </div>

        <ConsultationNotesCard consultation={consultation} bmi={bmi} />
      </div>
    </div>
  );
}
