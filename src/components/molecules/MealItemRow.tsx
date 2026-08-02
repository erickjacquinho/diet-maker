'use client';

import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="group/row flex items-center justify-between bg-surface-subtle border border-border-subtle rounded-control p-3">
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          onMouseDown={() => setIsActivated(true)}
          onMouseUp={() => setIsActivated(false)}
          onTouchStart={() => setIsActivated(true)}
          onTouchEnd={() => setIsActivated(false)}
          onClick={() => setIsActivated((prev) => !prev)}
          aria-label={`Reordenar ${name}`}
          className={`p-1 rounded-md cursor-grab active:cursor-grabbing transition-opacity duration-150 text-text-muted hover:text-text-primary ${
            isActive
              ? 'opacity-100 text-success bg-success/10 ring-1 ring-success/30'
              : 'opacity-0 group-hover/row:opacity-100'
          }`}
          title="Reordenar alimento"
        >
          <GripVertical size={14} />
        </Button>

        <div>
          <div className="text-xs font-bold text-text-primary">{name}</div>
          <div className="text-style-legal text-text-secondary mt-0.5 flex items-center space-x-1.5">
            <span className="text-macro-protein font-bold">P: {protein}g</span>
            <span className="text-text-muted font-normal">•</span>
            <span className="text-warning font-bold">C: {carbs}g</span>
            <span className="text-text-muted font-normal">•</span>
            <span className="text-info font-bold">G: {fats}g</span>
            <span className="text-text-muted font-normal">•</span>
            <span>{kcal} kcal</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isEditingGrams ? (
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              min={1}
              max={5000}
              value={tempGrams}
              onChange={(e) => setTempGrams(Number(e.target.value))}
              onBlur={handleSaveGrams}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveGrams();
              }}
              className="w-16 h-7 px-1 text-center bg-surface border border-success rounded-lg text-xs font-bold text-text-primary focus:outline-none"
              autoFocus
            />
            <span className="text-xs font-bold text-text-muted">g</span>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => {
              setTempGrams(quantityGrams);
              setIsEditingGrams(true);
            }}
            className="bg-surface border border-border-hover hover:border-success rounded-control px-2.5 py-1 text-xs font-bold text-text-primary transition-colors duration-standard hover:scale-105"
            title="Clique para editar gramatura"
          >
            {quantityGrams} <span className="text-text-muted font-normal">g</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remover ${name}`}
          className="text-text-muted hover:text-error h-7 w-7 p-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
