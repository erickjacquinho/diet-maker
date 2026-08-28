'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

export interface AddObjectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddObjective: (newObjective: string) => void;
}

export function AddObjectiveModal({
  open,
  onOpenChange,
  onAddObjective,
}: AddObjectiveModalProps) {
  const [input, setInput] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({
    formRef,
    enabled: open,
    priority: 10,
  });

  useEffect(() => {
    if (open) setInput('');
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onAddObjective(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className={textStyle('dialog-title')}>
            <Plus size={18} className="text-success shrink-0 inline-block mr-2" aria-hidden="true" />
            <span>Novo Objetivo</span>
          </DialogTitle>
          <DialogDescription className={textStyle('body-secondary')}>
            Digite um novo objetivo clínico ou esportivo para incluir na lista.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div>
            <label htmlFor="objective-description-input" className={textStyle('field-label')}>
              Descrição do Objetivo
            </label>
            <Input
              id="objective-description-input"
              type="text"
              required
              autoFocus
              placeholder="Ex: Preparação para Maratona"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="secondary"
              size="compact"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              className="flex-1"
              aria-keyshortcuts="Control+s Meta+s"
              title="Adicionar Objetivo (Ctrl+S)"
            >
              Adicionar <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
