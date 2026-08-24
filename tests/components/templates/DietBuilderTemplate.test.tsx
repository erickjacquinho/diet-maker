import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DietBuilderTemplate } from '@/components/templates/DietBuilderTemplate';

describe('DietBuilderTemplate header action dropdown', () => {
  it('renders ActionDropdown and triggers WhatsApp and PDF callbacks', async () => {
    const handleWhatsApp = vi.fn();
    const handlePdf = vi.fn();

    render(
      <DietBuilderTemplate
        patientId="pat-1"
        patientName="Carlos Silva"
        patientObjective="Emagrecimento"
        patientAge={30}
        patientHeightCm={175}
        patientGender="Masculino"
        onWhatsAppShare={handleWhatsApp}
        onExportPDF={handlePdf}
      />,
    );

    const trigger = screen.getByRole('button', { name: /mais ações/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' });
    fireEvent.click(trigger);

    const whatsappItem = await waitFor(() => screen.getByRole('menuitem', { name: /whatsapp/i }));
    const pdfItem = screen.getByRole('menuitem', { name: /pdf/i });

    expect(whatsappItem).toBeInTheDocument();
    expect(pdfItem).toBeInTheDocument();

    fireEvent.click(whatsappItem);
    expect(handleWhatsApp).toHaveBeenCalled();
  });

  it('renders Puxar Metas Anteriores button and triggers onPullPreviousGoals callback', () => {
    const handlePull = vi.fn();

    render(
      <DietBuilderTemplate
        patientId="pat-1"
        patientName="Carlos Silva"
        patientObjective="Emagrecimento"
        onPullPreviousGoals={handlePull}
        onOpenAdjustGoalsModal={vi.fn()}
      />,
    );

    const pullButton = screen.getByRole('button', { name: /puxar metas anteriores/i });
    expect(pullButton).toBeInTheDocument();

    fireEvent.click(pullButton);
    expect(handlePull).toHaveBeenCalled();
  });
});
