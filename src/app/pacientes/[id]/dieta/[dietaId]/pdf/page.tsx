'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { DietPdfTemplate, type DietPdfProfessional } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getBrowserDietApplication, getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { getBrowserProfessionalProfileStore } from '@/lib/application/professional-profile-store';
import { getProfessionalFullName, getProfessionalTitle, type ProfessionalProfile } from '@/lib/domain/professional-profile';
import { buildDietCyclePdfViewModel, buildDietPdfViewModel, createDietPdfFilename, type DietPdfDocumentViewModel } from '@/lib/application/diets/diet-pdf-view';
import { normalizeDateToISO, serializeDateOnly } from '@/lib/date-only';
import { toPatientViewModel } from '@/lib/patientViewModel';
import { textStyle } from '@/design-system';

function toPdfProfessional(profile: ProfessionalProfile | null): DietPdfProfessional | null {
  if (!profile?.showOnDocuments) return null;
  const contact = [profile.phone, profile.contactEmail, profile.instagram].filter(Boolean).join(' · ');
  return {
    name: getProfessionalFullName(profile),
    title: getProfessionalTitle(profile),
    crn: profile.crn,
    contact: contact || null,
  };
}

interface PageState {
  document: DietPdfDocumentViewModel | null;
  error: string | null;
  isLoading: boolean;
}

export default function DietPdfPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = params?.id as string;
  const dietaId = (params?.dietaId as string) || 'nova';
  const isHistoricalExport = searchParams.get('source') === 'history';
  const documentRef = useRef<HTMLDivElement | null>(null);
  const [pageState, setPageState] = useState<PageState>({ document: null, error: null, isLoading: true });
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const professionalProfileStore = getBrowserProfessionalProfileStore();
  const professionalProfile = useSyncExternalStore(
    professionalProfileStore.subscribe,
    professionalProfileStore.getSnapshot,
    professionalProfileStore.getSnapshot,
  );

  useEffect(() => {
    void professionalProfileStore.load();
  }, [professionalProfileStore]);

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

          const view = snapshot.mode === 'CARB_CYCLING'
            ? buildDietCyclePdfViewModel(snapshot, patient.name, prescriptionDate)
            : buildDietPdfViewModel(snapshot, patient.name, prescriptionDate);
          if (!cancelled) setPageState({ document: view, error: null, isLoading: false });
          return;
        }

        const [profile, editor] = await Promise.all([
          profilePromise,
          dietApplication.openEditor(patientId, dietaId),
        ]);
        const patient = toPatientViewModel(profile.patient);
        const { draft } = editor;

        const savedDietId = draft.baseDietId ?? (dietaId === 'nova' ? undefined : dietaId);
        let prescriptionDate = serializeDateOnly(new Date());
        if (savedDietId) {
          const savedDiet = await dietApplication.getDietSnapshot(patientId, savedDietId);
          const activatedDate = normalizeDateToISO(savedDiet?.activatedAt);
          if (!activatedDate) throw new Error('Não foi possível localizar a data da prescrição salva.');
          prescriptionDate = activatedDate;
        }

        const view = draft.payload.mode === 'CARB_CYCLING'
          ? buildDietCyclePdfViewModel(draft.payload, patient.name, prescriptionDate)
          : buildDietPdfViewModel(draft.payload, patient.name, prescriptionDate);
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

  const handleDownload = useCallback(async () => {
    const documentElement = documentRef.current?.querySelector<HTMLElement>('[data-diet-pdf-document]');
    const view = pageState.document;
    if (!documentElement || !view || isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);
    try {
      await document.fonts?.ready;
      const { default: html2pdf } = await import('html2pdf.js');
      const worker = html2pdf();
      const options = {
        margin: 0,
        filename: createDietPdfFilename(view),
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css'], avoid: ['.diet-pdf-meal-block', '.diet-pdf-option-heading', '.diet-pdf-food-row', '.diet-pdf-macro-row', '.diet-pdf-day-total-row', '.diet-pdf-cycle-total-row'] },
      } as Parameters<typeof worker.set>[0] & {
        pagebreak: { mode: string[]; avoid: string[] };
      };
      await worker.set(options).from(documentElement).save();
    } catch {
      setDownloadError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, pageState.document]);

  if (pageState.isLoading) {
    return (
      <main aria-label="Prévia da prescrição em PDF" className="flex min-h-96 items-center justify-center">
        <Spinner className="size-8 text-success" />
      </main>
    );
  }

  if (pageState.error || !pageState.document) {
    return (
      <main aria-label="Prévia da prescrição em PDF" className="mx-auto flex max-w-container-reading flex-col gap-4 px-8 py-6">
        <h1 className={textStyle('page-title')}>Prévia do PDF</h1>
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
    <main aria-label="Prévia da prescrição em PDF" className="mx-auto flex max-w-container-reading flex-col gap-6 px-8 py-6">
      <div role="group" aria-label="Ações da prévia" className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="secondary" size="compact" onClick={handleBack} disabled={isDownloading}>
          <ArrowLeft size={16} aria-hidden="true" />
          {isHistoricalExport ? 'Voltar para o perfil' : 'Voltar para a dieta'}
        </Button>
        <Button type="button" variant="primary" size="compact" onClick={handleDownload} disabled={isDownloading}>
          <Download size={16} aria-hidden="true" />
          {isDownloading ? 'Gerando PDF…' : 'Baixar PDF'}
        </Button>
      </div>

      {downloadError && <p role="alert" className={`${textStyle('body-small')} text-error`}>{downloadError}</p>}
      <div ref={documentRef} aria-busy={isDownloading}>
        <DietPdfTemplate document={pageState.document} professional={toPdfProfessional(professionalProfile.profile)} />
      </div>
    </main>
  );
}
