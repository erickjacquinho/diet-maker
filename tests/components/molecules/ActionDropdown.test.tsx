import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActionDropdown } from '@/components/molecules/ActionDropdown';

describe('ActionDropdown', () => {
  it('renders default trigger button and opens actions menu on trigger interaction', async () => {
    const handleWhatsApp = vi.fn();
    const handlePdf = vi.fn();

    const items = [
      { id: 'whatsapp', label: 'Compartilhar WhatsApp', onSelect: handleWhatsApp },
      { id: 'pdf', label: 'Exportar PDF', onSelect: handlePdf },
    ];

    render(
      <ActionDropdown
        triggerLabel="Mais ações"
        items={items}
      />,
    );

    const trigger = screen.getByRole('button', { name: /mais ações/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' });
    fireEvent.click(trigger);

    const whatsappItem = await waitFor(() => screen.getByRole('menuitem', { name: /compartilhar whatsapp/i }));
    const pdfItem = screen.getByRole('menuitem', { name: /exportar pdf/i });

    expect(whatsappItem).toBeInTheDocument();
    expect(pdfItem).toBeInTheDocument();

    fireEvent.click(whatsappItem);
    expect(handleWhatsApp).toHaveBeenCalled();
  });

  it('supports custom trigger node', async () => {
    const handleAction = vi.fn();
    const items = [{ id: 'action-1', label: 'Opção 1', onSelect: handleAction }];

    render(
      <ActionDropdown
        trigger={<button type="button">Menu Customizado</button>}
        items={items}
      />,
    );

    const trigger = screen.getByText('Menu Customizado');
    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' });
    fireEvent.click(trigger);

    const option = await waitFor(() => screen.getByRole('menuitem', { name: 'Opção 1' }));
    expect(option).toBeInTheDocument();
  });

  it('supports disabled action item', async () => {
    const handleAction = vi.fn();
    const items = [
      { id: 'disabled-item', label: 'Item Desabilitado', onSelect: handleAction, disabled: true },
    ];

    render(
      <ActionDropdown
        triggerLabel="Ações"
        items={items}
      />,
    );

    const trigger = screen.getByRole('button', { name: /ações/i });
    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' });
    fireEvent.click(trigger);

    const item = await waitFor(() => screen.getByRole('menuitem', { name: 'Item Desabilitado' }));
    expect(item).toHaveAttribute('data-disabled');
  });
});
