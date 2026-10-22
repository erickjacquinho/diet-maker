import type { DietPdfDocumentViewModel } from '@/lib/application/diets/diet-pdf-view';

/** Professional responsible for the prescription; omitted when the profile hides it from documents. */
export interface DietPdfProfessional {
  name: string;
  title: string;
  crn: string | null;
  contact: string | null;
}

export interface DietPdfTemplateProps {
  document: DietPdfDocumentViewModel;
  professional?: DietPdfProfessional | null;
}
