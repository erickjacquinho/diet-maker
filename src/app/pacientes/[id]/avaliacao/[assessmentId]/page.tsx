'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Calendar, User, Ruler } from 'lucide-react';
import { PageContextHeader } from '@/components/molecules';
import { AssessmentContinuousFields } from '@/components/molecules/assessment/AssessmentContinuousFields';
import { AssessmentSummaryPanel } from '@/components/organisms/assessment/AssessmentSummaryPanel';
import { Surface, SecondaryActionButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { textStyle } from '@/design-system';
import { useAssessmentWorkspacePage } from '@/hooks/useAssessmentWorkspacePage';

export default function AssessmentWorkspacePage() {
  const params = useParams();
  const patientId = params?.id as string;
  const assessmentId = params?.assessmentId as string;

  const {
    patient,
    draft,
    composition,
    bmi,
    waistToHipRatio,
    deltas,
    isNew,
    isSaving,
    submitError,
    updateNumericField,
    updateDateField,
    handleSave,
    handleCancel,
  } = useAssessmentWorkspacePage(patientId, assessmentId);

  if (!patient || !draft) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertTriangle className="size-12 text-warning mx-auto mb-4" />
        <h2 className="text-style-section-title font-bold text-text-primary mb-2">
          Paciente ou Avaliação Não Encontrada
        </h2>
        <p className="text-text-secondary mb-6">
          Não foi possível localizar os registros solicitados.
        </p>
        <Link href="/pacientes">
          <SecondaryActionButton icon={<ArrowLeft size={14} />}>
            Voltar para Pacientes
          </SecondaryActionButton>
        </Link>
      </div>
    );
  }

  const pageTitle = isNew ? 'Nova Avaliação Antropométrica' : 'Editar Avaliação Antropométrica';

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full text-text-primary">
      <PageContextHeader
        title={pageTitle}
        backHref={`/pacientes/${patient.id}`}
        backLabel={`Voltar para o perfil de ${patient.name}`}
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: patient.name, href: `/pacientes/${patient.id}` },
          { label: isNew ? 'Nova Avaliação' : 'Editar Avaliação' },
        ]}
      />

      {/* Barra de Contexto do Paciente & Data */}
      <Surface variant="subtle" className="p-4 rounded-surface border border-border-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" aria-hidden="true" />
            <span className={textStyle('caption-strong')}>{patient.name}</span>
            <span className="text-text-muted text-style-caption">
              ({patient.gender}, {patient.age} anos)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-style-caption text-text-secondary">
            <Ruler className="size-3.5 text-text-muted" aria-hidden="true" />
            <span>Altura cadastral: <strong>{patient.heightCm} cm</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="assessment-date" className={`flex items-center gap-1.5 ${textStyle('caption-strong')}`}>
            <Calendar className="size-3.5 text-text-muted" aria-hidden="true" />
            <span>Data da Medição:</span>
          </label>
          <Input
            id="assessment-date"
            type="text"
            value={draft.date}
            onChange={(e) => updateDateField(e.target.value)}
            className="w-32 h-8 text-style-caption"
            placeholder="DD/MM/AAAA"
          />
        </div>
      </Surface>

      {/* Grid de Conteúdo Principal: Formulário Contínuo (2 cols) + Resumo Lateral (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <form
            aria-label="Formulário de avaliação física contínua"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <AssessmentContinuousFields
              draft={draft}
              updateNumericField={updateNumericField}
            />
          </form>
        </div>

        <div className="lg:col-span-1">
          <AssessmentSummaryPanel
            composition={composition}
            bmi={bmi}
            waistToHipRatio={waistToHipRatio}
            deltas={deltas}
            isSaving={isSaving}
            submitError={submitError}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
