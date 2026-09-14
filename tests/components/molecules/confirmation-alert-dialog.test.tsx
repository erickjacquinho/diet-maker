import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmationAlertDialog } from '@/components/molecules/ConfirmationAlertDialog';

describe('ConfirmationAlertDialog', () => {
  it('centralizes confirmation content and keeps cancel separate from confirm', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmationAlertDialog
        open
        onOpenChange={onOpenChange}
        title="Excluir registro?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={onConfirm}
      />,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByRole('heading', { name: 'Excluir registro?' })).toBeInTheDocument();
    expect(within(dialog).getByText('Esta ação não pode ser desfeita.')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('supports a modal layer for confirmations opened above another dialog', () => {
    render(
      <ConfirmationAlertDialog
        open
        onOpenChange={vi.fn()}
        title="Descartar alterações?"
        description="As alterações serão perdidas."
        confirmLabel="Descartar"
        overlayLayer="modal"
        onConfirm={vi.fn()}
      />,
    );

    expect(document.body.querySelector('[data-state="open"].z-modal')).toBeInTheDocument();
    expect(document.body.querySelector('[data-state="open"].z-overlay')).not.toBeInTheDocument();
  });
});
