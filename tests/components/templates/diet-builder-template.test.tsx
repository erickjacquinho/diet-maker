import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DietBuilderTemplate } from '@/components/templates/DietBuilderTemplate';

const renderTemplate = (overrides: Partial<React.ComponentProps<typeof DietBuilderTemplate>> = {}) => {
  const props: React.ComponentProps<typeof DietBuilderTemplate> = {
    patientId: 'patient-1',
    patientName: 'Ana Lima',
    macroTrackerData: {
      patientInitials: 'AL',
      patientName: 'Ana Lima',
      patientWeightKg: 68,
      patientGoalDescription: 'Redução de gordura',
      metrics: [],
    },
    mealsData: [],
    dietModeProps: {
      mode: 'simple',
      onModeChange: vi.fn(),
      variationsCount: 2,
      onVariationsCountChange: vi.fn(),
      variations: [],
      activeVariationId: 'var-high',
      onSelectVariation: vi.fn(),
    },
    onAddMeal: vi.fn(),
    onScaleDiet: vi.fn(),
    onWhatsAppShare: vi.fn(),
    onExportPDF: vi.fn(),
    onSaveDiet: vi.fn(),
    ...overrides,
  };

  return render(<DietBuilderTemplate {...props} />);
};

describe('DietBuilderTemplate top composition', () => {
  it('keeps patient context and diet mode in one surface before macros and meals', () => {
    renderTemplate();

    const contextCard = screen.getByTestId('diet-context-card');
    const macroRegion = screen.getByTestId('macro-tracker-region');
    const mealsRegion = screen.getByRole('region', { name: 'Refeições' });
    const header = screen.getByRole('banner');
    const backLink = screen.getByRole('link', { name: 'Voltar para a ficha de Ana Lima' });
    const pageHeading = screen.getByRole('heading', { level: 1, name: 'Elaboração de Dieta' });
    const patientName = within(contextCard).getByRole('heading', { name: 'Ana Lima' });
    const modeHeading = within(contextCard).getByRole('heading', { name: 'Modelo de dieta' });
    const simpleMode = within(contextCard).getByRole('tab', { name: /Dieta Simples/i });
    const mealsHeading = screen.getByRole('heading', { name: 'Refeições' });

    expect(backLink).toHaveAttribute('href', '/pacientes/patient-1');
    expect(header).toBeInTheDocument();
    expect(pageHeading).toBeInTheDocument();
    expect(backLink.compareDocumentPosition(pageHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pageHeading.compareDocumentPosition(contextCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(modeHeading.compareDocumentPosition(simpleMode) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(contextCard.compareDocumentPosition(macroRegion) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(macroRegion.compareDocumentPosition(mealsRegion) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(macroRegion).queryByRole('heading', { name: 'Ana Lima' })).not.toBeInTheDocument();
    expect(patientName.compareDocumentPosition(mealsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByText('Ana Lima', { exact: true })).toHaveLength(2);
  });

  it('keeps save and secondary outputs inside the top surface without a global header', () => {
    const onSaveDiet = vi.fn();
    const onWhatsAppShare = vi.fn();
    const onExportPDF = vi.fn();

    renderTemplate({ onSaveDiet, onWhatsAppShare, onExportPDF });

    const contextCard = screen.getByTestId('diet-context-card');
    const header = screen.getByRole('banner');
    const saveButton = within(header).getByRole('button', { name: 'Salvar Prescrição' });
    const moreActionsButton = within(header).getByRole('button', { name: 'Mais ações' });

    expect(saveButton).toHaveClass('bg-primary');
    expect(within(contextCard).queryByRole('button', { name: 'Salvar Prescrição' })).not.toBeInTheDocument();
    expect(within(contextCard).queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument();
    expect(within(contextCard).queryByRole('button', { name: 'Nova Refeição' })).not.toBeInTheDocument();
    expect(within(contextCard).queryByRole('button', { name: 'Escalar' })).not.toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(onSaveDiet).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(moreActionsButton, { key: 'Enter', code: 'Enter' });
    const menu = screen.getByRole('menu');
    const whatsappItem = within(menu).getByRole('menuitem', { name: 'WhatsApp' });
    const pdfItem = within(menu).getByRole('menuitem', { name: 'PDF' });

    fireEvent.click(whatsappItem);
    expect(onWhatsAppShare).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(moreActionsButton, { key: 'Enter', code: 'Enter' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.keyDown(moreActionsButton, { key: ' ', code: 'Space' });
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'PDF' }));
    expect(onExportPDF).toHaveBeenCalledTimes(1);
    expect(pdfItem).toBeDefined();
  });

  it('keeps contextual actions with macros and meals outside the redesigned top surface', () => {
    renderTemplate();

    const contextCard = screen.getByTestId('diet-context-card');
    const macroRegion = screen.getByTestId('macro-tracker-region');
    const mealsRegion = screen.getByRole('region', { name: 'Refeições' });

    expect(within(contextCard).queryByRole('button', { name: 'Escalar' })).not.toBeInTheDocument();
    expect(within(macroRegion).getByRole('button', { name: 'Escalar' })).toBeInTheDocument();
    expect(within(mealsRegion).getByRole('button', { name: 'Nova Refeição' })).toBeInTheDocument();
  });

  it('shows one creation path when there are no meals', () => {
    renderTemplate();

    const mealsRegion = screen.getByRole('region', { name: 'Refeições' });

    expect(within(mealsRegion).getByRole('button', { name: 'Nova Refeição' })).toBeInTheDocument();
    expect(within(mealsRegion).getByText(/nenhuma refeição cadastrada/i)).toBeInTheDocument();
    expect(within(mealsRegion).getAllByRole('button', { name: 'Nova Refeição' })).toHaveLength(1);
  });

  it('keeps populated meals in the contextual section', () => {
    const onAddMeal = vi.fn();

    renderTemplate({
      onAddMeal,
      mealsData: [
        {
          id: 'meal-breakfast',
          title: 'Café da manhã',
          time: '08:00',
          kcal: 420,
          proteinG: 24,
          carbsG: 48,
          fatsG: 14,
          items: [],
        },
      ],
    });

    const mealsRegion = screen.getByRole('region', { name: 'Refeições' });
    expect(within(mealsRegion).getByRole('heading', { name: 'Café da manhã' })).toBeInTheDocument();
    fireEvent.click(within(mealsRegion).getByRole('button', { name: 'Nova Refeição' }));
    expect(onAddMeal).toHaveBeenCalledTimes(1);
  });
});
