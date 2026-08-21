'use client';

import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Badge, FieldTrigger, IconButton, Surface } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
        <IconButton
          variant="quiet"
          onMouseDown={() => setIsActivated(true)}
          onMouseUp={() => setIsActivated(false)}
          onTouchStart={() => setIsActivated(true)}
          onTouchEnd={() => setIsActivated(false)}
          onClick={() => setIsActivated((prev) => !prev)}
          aria-label={`Reordenar ${name}`}
          title="Reordenar alimento"
          className={cn(
            'h-7 w-7 p-0 cursor-grab active:cursor-grabbing transition-opacity duration-fast text-text-muted hover:text-text-primary',
            isActive
              ? 'opacity-full text-success bg-success-soft ring-1 ring-success'
              : 'invisible group-hover/row:visible'
          )}
        >
          <GripVertical size={14} />
        </IconButton>

        <div>
          <div className="text-style-legal font-bold text-text-primary">{name}</div>
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            <Badge variant="protein" className="px-1.5 py-0 font-bold text-style-legal">P: {protein}g</Badge>
            <Badge variant="carbohydrate" className="px-1.5 py-0 font-bold text-style-legal">C: {carbs}g</Badge>
            <Badge variant="fat" className="px-1.5 py-0 font-bold text-style-legal">G: {fats}g</Badge>
            <Badge variant="default" className="px-1.5 py-0 font-bold text-style-legal text-text-muted">{kcal} kcal</Badge>
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
              size="compact"
              value={tempGrams}
              onChange={(e) => setTempGrams(Number(e.target.value))}
              onBlur={handleSaveGrams}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveGrams();
              }}
              className="w-16 px-1 text-center text-style-field-value font-bold"
              autoFocus
            />
            <span className="text-style-legal font-bold text-text-muted">g</span>
          </div>
        ) : (
          <FieldTrigger
            size="compact"
            onClick={() => {
              setTempGrams(quantityGrams);
              setIsEditingGrams(true);
            }}
            className="w-auto px-2.5 font-bold text-style-legal"
            title="Clique para editar gramatura"
          >
            {quantityGrams} <span className="text-text-muted font-normal">g</span>
          </FieldTrigger>
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

