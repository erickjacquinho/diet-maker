'use client';

import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MealItemRowProps {
  id?: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  quantityGrams: number;
  onQuantityChange?: (newGrams: number) => void;
  onRemove?: () => void;
  isReorderingActive?: boolean;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({
  name,
  kcal,
  protein,
  carbs,
  fats,
  quantityGrams,
  onQuantityChange,
  onRemove,
  isReorderingActive: propIsActive = false,
}) => {
  const [isActivated, setIsActivated] = useState(false);
  const [isEditingGrams, setIsEditingGrams] = useState(false);
  const [tempGrams, setTempGrams] = useState<number>(quantityGrams);

  const isActive = isActivated || propIsActive;

  const handleSaveGrams = () => {
    const val = Math.max(1, Number(tempGrams) || 100);
    if (onQuantityChange) {
      onQuantityChange(val);
    }
    setIsEditingGrams(false);
  };

  return (
    <div className="group/row flex items-center justify-between bg-warm-inner border border-warm-border rounded-xl p-3">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onMouseDown={() => setIsActivated(true)}
          onMouseUp={() => setIsActivated(false)}
          onTouchStart={() => setIsActivated(true)}
          onTouchEnd={() => setIsActivated(false)}
          onClick={() => setIsActivated((prev) => !prev)}
          aria-label={`Reordenar ${name}`}
          className={`p-1 rounded-md cursor-grab active:cursor-grabbing transition-opacity duration-150 text-warm-muted hover:text-warm-charcoal ${
            isActive
              ? 'opacity-100 text-warm-emerald bg-warm-emerald/10 ring-1 ring-warm-emerald/30'
              : 'opacity-0 group-hover/row:opacity-100'
          }`}
          title="Reordenar alimento"
        >
          <GripVertical size={14} />
        </button>

        <div>
          <div className="text-xs font-bold text-warm-charcoal">{name}</div>
          <div className="text-[11px] text-warm-secondary mt-0.5 flex items-center space-x-1.5">
            <span className="text-blue-600 font-bold">P: {protein}g</span>
            <span className="text-warm-muted font-normal">•</span>
            <span className="text-amber-600 font-bold">C: {carbs}g</span>
            <span className="text-warm-muted font-normal">•</span>
            <span className="text-teal-600 font-bold">G: {fats}g</span>
            <span className="text-warm-muted font-normal">•</span>
            <span>{kcal} kcal</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isEditingGrams ? (
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min={1}
              max={5000}
              value={tempGrams}
              onChange={(e) => setTempGrams(Number(e.target.value))}
              onBlur={handleSaveGrams}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveGrams();
              }}
              className="w-16 h-7 px-1 text-center bg-warm-card border border-warm-emerald rounded-lg text-xs font-black text-warm-charcoal focus:outline-none"
              autoFocus
            />
            <span className="text-xs font-bold text-warm-muted">g</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTempGrams(quantityGrams);
              setIsEditingGrams(true);
            }}
            className="bg-warm-card border border-warm-borderDark hover:border-warm-emerald rounded-xl px-2.5 py-1 text-xs font-bold text-warm-charcoal transition-all hover:scale-105"
            title="Clique para editar gramatura"
          >
            {quantityGrams} <span className="text-warm-muted font-normal">g</span>
          </button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remover ${name}`}
          className="text-warm-muted hover:text-warm-rose h-7 w-7 p-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
