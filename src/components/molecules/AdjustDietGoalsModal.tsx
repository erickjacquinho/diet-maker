import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3 } from 'lucide-react';

interface AdjustDietGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempTargetProt: number;
  setTempTargetProt: (val: number) => void;
  tempTargetCarb: number;
  setTempTargetCarb: (val: number) => void;
  tempTargetFat: number;
  setTempTargetFat: (val: number) => void;
  onSave: () => void;
}

export function AdjustDietGoalsModal({
  isOpen,
  onClose,
  tempTargetProt,
  setTempTargetProt,
  tempTargetCarb,
  setTempTargetCarb,
  tempTargetFat,
  setTempTargetFat,
  onSave,
}: AdjustDietGoalsModalProps) {
  const calcKcal = tempTargetProt * 4 + tempTargetCarb * 4 + tempTargetFat * 9;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Edit3 className="w-5 h-5 text-emerald-600" />
            Ajustar Metas de Macronutrientes
          </DialogTitle>
          <DialogDescription>
            Insira os valores-alvo em gramas. As calorias serão calculadas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Proteína (g)</label>
              <Input
                type="number"
                value={tempTargetProt}
                onChange={(e) => setTempTargetProt(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Carboidratos (g)</label>
              <Input
                type="number"
                value={tempTargetCarb}
                onChange={(e) => setTempTargetCarb(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Gorduras (g)</label>
              <Input
                type="number"
                value={tempTargetFat}
                onChange={(e) => setTempTargetFat(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <span className="text-xs text-slate-500 block">Total Calculado</span>
            <span className="text-lg font-bold text-slate-800">{calcKcal} kcal</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave}>
            Salvar Metas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
