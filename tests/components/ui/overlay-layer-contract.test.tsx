import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

afterEach(() => {
  cleanup();
});

describe('overlay layer contract', () => {
  it('keeps dialog and sheet content above their backdrops', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog de teste</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toHaveClass('z-modal');
    expect(document.body.querySelector('[data-state="open"].z-overlay')).toBeInTheDocument();

    cleanup();

    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Sheet de teste</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole('dialog')).toHaveClass('z-modal');
    expect(document.body.querySelector('[data-state="open"].z-overlay')).toBeInTheDocument();
  });

  it('uses z-dropdown for ordinary dropdown and select content', async () => {
    render(
      <DropdownMenu open modal={false}>
        <DropdownMenuTrigger>Opções</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Editar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(await screen.findByRole('menu')).toHaveClass('z-dropdown');

    cleanup();

    render(
      <Select defaultValue="one">
        <SelectTrigger aria-label="Escolha">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">Um</SelectItem>
        </SelectContent>
      </Select>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Escolha' }));
    expect(await screen.findByRole('listbox')).toHaveClass('z-dropdown');
  });

  it('resolves select and popover content to z-modal only when requested', async () => {
    render(
      <Select defaultValue="one">
        <SelectTrigger aria-label="Escolha modal">
          <SelectValue />
        </SelectTrigger>
        <SelectContent layer="modal">
          <SelectItem value="one">Um</SelectItem>
        </SelectContent>
      </Select>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Escolha modal' }));
    expect(await screen.findByRole('listbox')).toHaveClass('z-modal');

    cleanup();

    render(
      <Popover open>
        <PopoverContent layer="modal">Calendário</PopoverContent>
      </Popover>,
    );

    expect(await screen.findByRole('dialog')).toHaveClass('z-modal');
  });

  it('keeps ordinary popovers and tooltips on their semantic layers', async () => {
    render(
      <>
        <Popover open>
          <PopoverContent>Popover</PopoverContent>
        </Popover>
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Ajuda</TooltipTrigger>
            <TooltipContent>Informação</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </>,
    );

    expect(await screen.findByRole('dialog')).toHaveClass('z-popover');
    expect(await screen.findByRole('tooltip')).toHaveClass('z-tooltip');
  });

  it('preserves dismissal through the public Radix interaction', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Dialog de dismiss</DialogTitle>
          <button type="button">Ação</button>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Dialog de dismiss' });
    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
