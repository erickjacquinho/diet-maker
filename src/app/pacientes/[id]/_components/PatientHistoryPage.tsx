'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Scale, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/atoms';
import { PageContextHeader } from '@/components/molecules';
import { PatientAssessmentsTable } from '@/components/organisms/patient/PatientAssessmentsTable';
import { PatientDietsTable } from '@/components/organisms/patient/PatientDietsTable';
import { ReadOnlyDietModal } from '@/components/organisms/diets/ReadOnlyDietModal';
import { textStyle } from '@/design-system';
import { getBrowserDietApplication, getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { toLegacyAssessment, type BodyAssessment, type HistoricalDiet } from '@/lib/application/patients/clinical-ui-adapter';
import type { DietPlan } from '@/lib/domain/diets/diet-model';
import { MAX_PAGE_SIZE } from '@/lib/persistence/page';
import type { HistoricalDiet as DietTableItem } from '@/lib/patientRelatedRecords';

type PatientHistoryKind = 'dietas' | 'avaliacoes';

export function PatientHistoryPage({ kind }: { kind: PatientHistoryKind }) {
  const params = useParams();
  const patientId = params?.id as string;
  const isDietHistory = kind === 'dietas';
  const title = isDietHistory ? 'Histórico de dietas' : 'Histórico de avaliações';
  const [patientName, setPatientName] = useState<string | null>(null);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [diets, setDiets] = useState<HistoricalDiet[]>([]);
  const [assessments, setAssessments] = useState<BodyAssessment[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<DietPlan | null>(null);
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const dietRequest = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setIsPatientLoading(true);
    setProfileError(null);

    void (async () => {
      try {
        const application = await getBrowserPatientApplication();
        const profile = await application.getPatientProfile(patientId);
        if (!cancelled) setPatientName(profile.patient.name);
      } catch (error) {
        if (!cancelled) {
          setProfileError(error instanceof Error ? error.message : 'Não foi possível carregar o paciente.');
        }
      } finally {
        if (!cancelled) setIsPatientLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    setIsHistoryLoading(true);
    setHistoryError(null);

    void (async () => {
      try {
        if (isDietHistory) {
          const application = await getBrowserDietApplication();
          const result = await application.listDietHistoryViewsPage(patientId, {
            pageIndex,
            pageSize: MAX_PAGE_SIZE,
          });
          if (cancelled) return;
          setDiets(result.items);
          setHistoryTotal(result.total);
        } else {
          const application = await getBrowserPatientApplication();
          const result = await application.listAssessmentsPage(patientId, {
            pageIndex,
            pageSize: MAX_PAGE_SIZE,
          });
          if (cancelled) return;
          setAssessments(result.items.map(toLegacyAssessment));
          setHistoryTotal(result.total);
        }
      } catch (error) {
        if (!cancelled) {
          setHistoryError(error instanceof Error ? error.message : `Não foi possível carregar ${isDietHistory ? 'as dietas' : 'as avaliações'}.`);
        }
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isDietHistory, pageIndex, patientId]);

  const handleOpenReadOnlyDiet = useCallback(async (diet: DietTableItem) => {
    const request = ++dietRequest.current;
    try {
      const application = await getBrowserDietApplication();
      const snapshot = await application.getDietSnapshot(patientId, diet.id);
      if (request !== dietRequest.current) return;
      if (!snapshot) throw new Error('A dieta não foi encontrada.');
      setSelectedDiet(snapshot);
      setIsDietModalOpen(true);
    } catch (error) {
      if (request === dietRequest.current) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível abrir o cardápio.');
      }
    }
  }, [patientId]);

  if (isPatientLoading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center text-text-secondary" role="status" aria-live="polite">
        Carregando histórico do paciente...
      </div>
    );
  }

  if (!patientName) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertTriangle className="size-12 text-warning mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-style-section-title font-bold text-text-primary mb-2">
          Não foi possível abrir o histórico
        </h1>
        <p className="text-text-secondary mb-6">
          {profileError ?? 'O paciente solicitado não existe ou não pertence à Conta ativa.'}
        </p>
        <Button asChild variant="secondary" size="compact">
          <Link href="/pacientes">
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar para Pacientes
          </Link>
        </Button>
      </div>
    );
  }

  const pagination = {
    pageIndex,
    pageSize: MAX_PAGE_SIZE,
    totalRows: historyTotal,
    onPageChange: setPageIndex,
  };
  const totalLabel = isDietHistory
    ? `${historyTotal} ${historyTotal === 1 ? 'plano' : 'planos'}`
    : `${historyTotal} ${historyTotal === 1 ? 'avaliação' : 'avaliações'}`;

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
      <PageContextHeader
        title={title}
        backHref={`/pacientes/${patientId}`}
        backLabel={`Voltar para o perfil de ${patientName}`}
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: patientName, href: `/pacientes/${patientId}` },
          { label: isDietHistory ? 'Dietas' : 'Avaliações' },
        ]}
      />

      <Surface className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-border-divider pb-4">
          <div>
            <h2 className={`flex items-center gap-2 text-text-primary ${textStyle('section-title')}`}>
              {isDietHistory ? (
                <Utensils className="size-5 text-primary" aria-hidden="true" />
              ) : (
                <Scale className="size-5 text-primary" aria-hidden="true" />
              )}
              <span>{isDietHistory ? 'Histórico completo de dietas' : 'Histórico completo de avaliações físicas'}</span>
            </h2>
            <p className={`mt-0.5 text-text-secondary ${textStyle('caption')}`}>
              {isDietHistory
                ? 'Todos os planos alimentares cadastrados para este paciente.'
                : 'Todas as avaliações físicas cadastradas para este paciente.'}
            </p>
          </div>
          <span className={`${textStyle('caption')} whitespace-nowrap`}>
            {isHistoryLoading ? 'Carregando...' : historyError ? '—' : totalLabel}
          </span>
        </div>

        {isDietHistory ? (
          <PatientDietsTable
            patientId={patientId}
            diets={diets}
            loading={isHistoryLoading}
            error={historyError}
            onOpenReadOnlyDiet={handleOpenReadOnlyDiet}
            pagination={pagination}
          />
        ) : (
          <PatientAssessmentsTable
            patientId={patientId}
            assessments={assessments}
            loading={isHistoryLoading}
            error={historyError}
            pagination={pagination}
          />
        )}
      </Surface>

      {isDietHistory && (
        <ReadOnlyDietModal
          isOpen={isDietModalOpen}
          onClose={() => setIsDietModalOpen(false)}
          diet={selectedDiet}
          patientName={patientName}
        />
      )}
    </div>
  );
}
