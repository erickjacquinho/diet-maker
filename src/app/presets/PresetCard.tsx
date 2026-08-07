'use client';

import React from 'react';
import { Copy, Utensils, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { MacroMode } from '@/lib/presetUtils';

export interface DietPreset {
  id: string;
  title: string;
  category: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  proteinMode?: MacroMode;
  proteinValue?: number;
  carbsMode?: MacroMode;
  carbsValue?: number;
  fatsMode?: MacroMode;
  fatsValue?: number;
  referenceWeight?: number;
  mealsCount: number;
  description: string;
}

export function PresetCard({
  preset,
  isCopied,
  onCopy,
}: {
  preset: DietPreset;
  isCopied: boolean;
  onCopy: (id: string) => void;
}) {
  return (
    <Card className="bg-surface border-border-subtle rounded-surface p-5 hover:border-border-hover transition-colors duration-standard flex flex-col justify-between gap-4">
      <CardContent className="p-0 gap-4 flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Badge variant="default" className="text-style-legal font-bold bg-success/10 text-success">
              {preset.category}
            </Badge>
            <span className="text-style-legal font-semibold text-text-muted flex items-center gap-1">
              <Utensils size={12} />
              <span>{preset.mealsCount} refeições</span>
            </span>
          </div>
          <h3 className="font-bold text-style-body-small text-text-primary leading-snug">{preset.title}</h3>
          <p className="text-style-legal text-text-muted leading-relaxed line-clamp-2">{preset.description}</p>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-3 bg-surface-subtle border border-border-subtle rounded-control text-center">
          <div>
            <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Kcal</span>
            <span className="font-bold text-style-legal text-text-primary">{preset.targetKcal}</span>
          </div>
          <div>
            <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Prot</span>
            <span className="font-bold text-style-legal text-macro-protein">
              {preset.proteinMode === 'multiplicativo' ? `${preset.proteinValue ?? preset.proteinG}g/kg` : `${preset.proteinG}g`}
            </span>
          </div>
          <div>
            <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Carb</span>
            <span className="font-bold text-style-legal text-macro-carbohydrate">
              {preset.carbsMode === 'multiplicativo' ? `${preset.carbsValue ?? preset.carbsG}g/kg` : `${preset.carbsG}g`}
            </span>
          </div>
          <div>
            <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Gord</span>
            <span className="font-bold text-style-legal text-macro-fat">
              {preset.fatsMode === 'multiplicativo' ? `${preset.fatsValue ?? preset.fatsG}g/kg` : `${preset.fatsG}g`}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
          <span className="text-style-legal text-text-muted font-medium">Reutilizável em 1 clique</span>
          <Button
            size="compact"
            variant="primary"
            onClick={() => onCopy(preset.id)}
            className={`inline-flex items-center gap-1.5 text-style-legal font-bold transition-colors duration-standard ${
              isCopied ? 'bg-success text-on-success hover:bg-success border-transparent shadow-floating' : ''
            }`}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? 'Copiado!' : 'Aplicar Preset'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
