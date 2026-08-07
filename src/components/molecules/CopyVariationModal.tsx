import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Copy className="w-5 h-5 text-indigo-600" />
            Copiar Refeições entre Variações
          </DialogTitle>
          <DialogDescription>
            Copie a estrutura de refeições de um dia para outro e ajuste apenas os carboidratos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Copiar de:</label>
            <Select value={copySourceId} onValueChange={setCopySourceId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                {variations.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} ({v.targetKcal} kcal)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Para:</label>
            <Select value={copyTargetId} onValueChange={setCopyTargetId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                {variations
                  .filter((v) => v.id !== copySourceId)
                  .map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.targetKcal} kcal)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
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
