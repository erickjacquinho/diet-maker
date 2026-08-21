import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button, SelectField } from '@/components/atoms';
import { Copy } from 'lucide-react';
import { CarbCyclingVariation } from '@/lib/dietStore';

interface CopyVariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  variations: CarbCyclingVariation[];
  copySourceId: string;
  setCopySourceId: (id: string) => void;
  copyTargetId: string;
  setCopyTargetId: (id: string) => void;
  onCopy: () => void;
}

export function CopyVariationModal({
  isOpen,
  onClose,
  variations,
  copySourceId,
  setCopySourceId,
  copyTargetId,
  setCopyTargetId,
  onCopy,
}: CopyVariationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-primary">
            <Copy className="w-5 h-5 text-primary" />
            Copiar Refeições entre Variações
          </DialogTitle>
          <DialogDescription>
            Copie a estrutura de refeições de um dia para outro e ajuste apenas os carboidratos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          <SelectField
            id="copy-variation-source"
            label="Copiar de:"
            value={copySourceId}
            onValueChange={setCopySourceId}
            placeholder="Selecione a origem"
            layer="modal"
            options={variations.map((v) => ({
              value: v.id,
              label: `${v.name} (${v.targetKcal} kcal)`,
            }))}
          />

          <SelectField
            id="copy-variation-target"
            label="Para:"
            value={copyTargetId}
            onValueChange={setCopyTargetId}
            placeholder="Selecione o destino"
            layer="modal"
            options={variations
              .filter((v) => v.id !== copySourceId)
              .map((v) => ({
                value: v.id,
                label: `${v.name} (${v.targetKcal} kcal)`,
              }))}
          />
        </div>

        <DialogFooter>
          <Button variant="quiet" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onCopy}>
            Confirmar Cópia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
