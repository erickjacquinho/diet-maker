import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Percent } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Percent className="w-5 h-5 text-emerald-600" />
            Escalar Quantidade dos Alimentos
          </DialogTitle>
          <DialogDescription>
            Aumente ou reduza proporcionalmente a quantidade de todos os alimentos da dieta ativa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
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
          <Button variant="primary" onClick={() => onApplyScale(scalePercentage)}>
            Aplicar Ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
