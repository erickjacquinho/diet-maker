'use client';

import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Button, IconButton, Surface } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
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
    <Surface variant="subtle" density="compact" className="group/row flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onMouseDown={() => setIsActivated(true)}
          onMouseUp={() => setIsActivated(false)}
          onTouchStart={() => setIsActivated(true)}
          onTouchEnd={() => setIsActivated(false)}
          onClick={() => setIsActivated((prev) => !prev)}
          aria-label={`Reordenar ${name}`}
          className={`p-1 rounded-control cursor-grab active:cursor-grabbing transition-opacity duration-fast text-text-muted hover:text-text-primary ${
            isActive
              ? 'opacity-full text-success bg-success/10 ring-1 ring-success/30'
              : 'invisible group-hover/row:visible'
          }`}
          title="Reordenar alimento"
        >
          <GripVertical size={14} />
        </Button>

        <div>
          <div className="text-style-legal font-bold text-text-primary">{name}</div>
          <div className="mt-1 flex items-center gap-1 flex-wrap">
              <Badge variant="outline" className="border-macro-protein-border bg-macro-protein-soft text-macro-protein font-bold text-style-legal px-1.5 py-0">P: {protein}g</Badge>
              <Badge variant="outline" className="border-macro-carbohydrate-border bg-macro-carbohydrate-soft text-macro-carbohydrate font-bold text-style-legal px-1.5 py-0">C: {carbs}g</Badge>
              <Badge variant="outline" className="border-macro-fat-border bg-macro-fat-soft text-macro-fat font-bold text-style-legal px-1.5 py-0">G: {fats}g</Badge>
              <Badge variant="outline" className="border-border-subtle bg-surface-subtle text-text-muted font-bold text-style-legal px-1.5 py-0">{kcal} kcal</Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditingGrams ? (
          <div className="flex items-center gap-1">
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
              className="w-16 h-7 px-1 text-center bg-surface border border-success rounded-surface text-style-legal font-bold text-text-primary focus:outline-none"
              autoFocus
            />
            <span className="text-style-legal font-bold text-text-muted">g</span>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => {
              setTempGrams(quantityGrams);
              setIsEditingGrams(true);
            }}
            className="bg-surface border border-border-hover hover:border-success rounded-control px-2.5 py-1 text-style-legal font-bold text-text-primary transition-colors duration-standard"
            title="Clique para editar gramatura"
          >
            {quantityGrams} <span className="text-text-muted font-normal">g</span>
          </Button>
        )}

        <IconButton
          variant="quiet"
          onClick={onRemove}
          aria-label={`Remover ${name}`}
          className="text-text-muted hover:text-error h-7 w-7 p-0"
        >
          <Trash2 size={14} />
        </IconButton>
      </div>
    </Surface>
  );
};
