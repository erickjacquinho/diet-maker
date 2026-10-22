import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DietPdfTemplate } from '@/components/templates/DietPdfTemplate';
import type { DietPdfViewModel } from '@/lib/application/diets/diet-pdf-view';
import { clinicLogo } from '../../fixtures/clinic-logo';

const document: DietPdfViewModel = {
  patientName: 'Maria Lima',
  prescriptionDate: '22/10/2026',
  prescriptionDateIso: '2026-10-22',
  meals: [],
  dayMacros: null,
};

describe('DietPdfTemplate professional block', () => {
  it('identifies the responsible professional when provided', () => {
    const { container } = render(<DietPdfTemplate document={document} professional={{
      name: 'Ana Souza',
      title: 'Nutricionista',
      crn: 'CRN-3 12345',
      contact: '(11) 99999-8888 · @ana.nutri',
    }} />);

    expect(container.querySelector('[data-diet-pdf-professional]')).not.toBeNull();
    expect(screen.getByText('Ana Souza · Nutricionista · CRN-3 12345')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-8888 · @ana.nutri')).toBeInTheDocument();
  });

  it('omits the block when the profile is hidden from documents', () => {
    const { container } = render(<DietPdfTemplate document={document} />);

    expect(container.querySelector('[data-diet-pdf-professional]')).toBeNull();
    expect(screen.queryByText('Responsável')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the persisted clinic logo in the PDF header', () => {
    render(<DietPdfTemplate document={document} professional={{ name: 'Ana Souza', title: 'Nutricionista', crn: null, contact: null, logo: clinicLogo }} />);
    expect(screen.getByRole('img', { name: 'Logotipo do consultório' })).toHaveAttribute('src', clinicLogo);
  });
});
