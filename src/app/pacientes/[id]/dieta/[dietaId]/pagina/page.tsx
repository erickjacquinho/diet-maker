'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DietPublishedTemplate } from '@/components/templates/DietPublishedTemplate';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getBrowserDietApplication, getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { buildDietPdfViewModel, type DietPdfViewModel } from '@/lib/application/diets/diet-pdf-view';
import { normalizeDateToISO, serializeDateOnly } from '@/lib/date-only';
import { toPatientViewModel } from '@/lib/patientViewModel';
import { textStyle } from '@/design-system';

interface PageState {
  document: DietPdfViewModel | null;
  error: string | null;
  isLoading: boolean;
}

export default function DietPdfPreviewPage() {
  const params = useParams();
  const options = useSearchParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const dietaId = (params?.dietaId as string) || 'nova';
  const isHistoricalExport = options?.get('source') === 'history';
  const [pageState, setPageState] = useState<PageState>({ document: null, error: null, isLoading: true });

  useEffect(() => {
    if (!patientId || !dietaId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [dietApplication, patientApplication] = await Promise.all([
          getBrowserDietApplication(),
          getBrowserPatientApplication(),
        ]);
        const profilePromise = patientApplication.getPatientProfile(patientId);

        if (isHistoricalExport) {
          const [profile, snapshot] = await Promise.all([
            profilePromise,
            dietApplication.getDietSnapshot(patientId, dietaId),
          ]);
          if (!snapshot) throw new Error('A dieta não foi encontrada.');
          const patient = toPatientViewModel(profile.patient);
          const prescriptionDate = normalizeDateToISO(snapshot.activatedAt);
          if (!prescriptionDate) throw new Error('Não foi possível localizar a data da prescrição salva.');

          const view = buildDietPdfViewModel(snapshot, patient.name, prescriptionDate);
          if (!cancelled) setPageState({ document: view, error: null, isLoading: false });
          return;
        }

        const [profile, editor] = await Promise.all([
          profilePromise,
          dietApplication.openEditor(patientId, dietaId),
        ]);
        const patient = toPatientViewModel(profile.patient);
        const { draft } = editor;

        if (draft.payload.mode !== 'SIMPLE') {
          throw new Error('A prévia da página está disponível para dietas simples.');
        }

        const savedDietId = draft.baseDietId ?? (dietaId === 'nova' ? undefined : dietaId);
        let prescriptionDate = serializeDateOnly(new Date());
        if (savedDietId) {
          const savedDiet = await dietApplication.getDietSnapshot(patientId, savedDietId);
          const activatedDate = normalizeDateToISO(savedDiet?.activatedAt);
          if (!activatedDate) throw new Error('Não foi possível localizar a data da prescrição salva.');
          prescriptionDate = activatedDate;
        }

        const view = buildDietPdfViewModel(draft.payload, patient.name, prescriptionDate);
        if (!cancelled) setPageState({ document: view, error: null, isLoading: false });
      } catch (error) {
        if (!cancelled) {
          setPageState({
            document: null,
            error: error instanceof Error ? error.message : 'Não foi possível abrir a prévia do PDF.',
            isLoading: false,
          });
        }
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [dietaId, isHistoricalExport, patientId]);

  const handleBack = useCallback(() => {
    router.push(isHistoricalExport ? `/pacientes/${patientId}` : `/pacientes/${patientId}/dieta/${dietaId}`);
  }, [dietaId, isHistoricalExport, patientId, router]);

  if (pageState.isLoading) {
    return (
      <main aria-label="Prévia da prescrição da página" className="flex min-h-96 items-center justify-center">
        <Spinner className="size-8 text-success" />
      </main>
    );
  }

  if (pageState.error || !pageState.document) {
    return (
      <main aria-label="Prévia da prescrição da página" className="mx-auto flex max-w-container-reading flex-col gap-4 px-8 py-6">
        <h1 className={textStyle('page-title')}>Prévia da página</h1>
        <p role="alert" className={textStyle('body')}>{pageState.error ?? 'Não foi possível abrir esta prescrição.'}</p>
        <div>
          <Button type="button" variant="secondary" size="compact" onClick={handleBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            {isHistoricalExport ? 'Voltar para o perfil' : 'Voltar para a dieta'}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main aria-label="Prévia da prescrição da página" className="mx-auto flex max-w-container-reading flex-col gap-6 px-8 py-6">
      <div role="group" aria-label="Ações da prévia" className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="secondary" size="compact" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {isHistoricalExport ? 'Voltar para o perfil' : 'Voltar para a dieta'}
        </Button>

      </div>

      <p role="status">Prévia local. Esta página ainda não foi publicada para o paciente.</p>
      <DietPublishedTemplate document={pageState.document} checklist={options?.get('checklist') !== '0'} mealMacros={options?.get('mealMacros') !== '0'} dayMacros={options?.get('dayMacros') !== '0'} />
    </main>
  );
}
