import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/atoms';
import { Percent } from 'lucide-react';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

interface ScaleDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  scalePercentage: number;
  setScalePercentage: (pct: number) => void;
  onApplyScale: (pct: number) => void;
}

export function ScaleDietModal({
  isOpen,
  onClose,
  scalePercentage,
  setScalePercentage,
  onApplyScale,
}: ScaleDietModalProps) {
  useSaveShortcut({
    onSave: () => onApplyScale(scalePercentage),
    enabled: isOpen,
    priority: 10,
  });
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-primary">
            <Percent className="w-5 h-5 text-success" />
            Escalar Quantidade dos Alimentos
          </DialogTitle>
          <DialogDescription>
            Aumente ou reduza proporcionalmente a quantidade de todos os alimentos da dieta ativa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2">
            {[-20, -10, -5, 5, 10, 20].map((pct) => (
              <Button
                key={pct}
                type="button"
                variant={scalePercentage === pct ? 'primary' : 'secondary'}
                size="compact"
                onClick={() => setScalePercentage(pct)}
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="quiet" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => onApplyScale(scalePercentage)}
            aria-keyshortcuts="Control+s Meta+s"
            title="Aplicar Ajuste (Ctrl+S)"
          >
            Aplicar Ajuste <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
