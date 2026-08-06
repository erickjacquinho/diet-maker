'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, Copy, Utensils, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePresetModal, type CreatePresetData } from '@/components/molecules/CreatePresetModal';
import type { MacroMode } from '@/lib/presetUtils';

interface DietPreset {
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

const PRESETS_KEY = 'nutridiet_presets';

export default function PresetsPage() {
  const [presets, setPresets] = useState<DietPreset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRESETS_KEY);
      if (saved) setPresets(JSON.parse(saved));
    } catch {
      setPresets([]);
    }
  }, []);

  const handleCreatePreset = (formData: CreatePresetData) => {
    const newPreset: DietPreset = {
      ...formData,
      id: `preset-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    const updated = [newPreset, ...presets];
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const filteredPresets = presets.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-success" />
            <h1 className="font-bold text-style-section-title text-text-primary tracking-tight">Presets de Dietas</h1>
          </div>
          <p className="text-style-legal text-text-muted mt-1 font-medium">
            Biblioteca global de protocolos nutricionais completos para duplicação e aplicação rápida em pacientes.
          </p>
        </div>
        <CreateButton onClick={() => setIsModalOpen(true)}>
          Criar Novo Preset
        </CreateButton>
      </div>

      {/* Search Input */}
      {presets.length > 0 && (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar preset por nome ou categoria (ex: Low Carb, Bulking)..."
            className="pl-11 pr-4 bg-surface border-border-subtle text-style-legal"
          />
        </div>
      )}

      {/* Empty State vs Presets Grid */}
      {filteredPresets.length === 0 ? (
        <Card className="bg-surface border-border-subtle rounded-surface p-12 text-center max-w-md mx-auto flex flex-col gap-4 my-8">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Nenhum preset cadastrado</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                Sua biblioteca de protocolos inteiros está em branco. Crie seu primeiro preset de dieta reutilizável.
              </p>
            </div>
            <CreateButton onClick={() => setIsModalOpen(true)}>
              Criar Primeiro Preset
            </CreateButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filteredPresets.map((preset) => (
            <Card
              key={preset.id}
              className="bg-surface border-border-subtle rounded-surface p-5 hover:border-border-hover transition-colors duration-standard flex flex-col justify-between gap-4"
            >
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

                {/* Macro Summary */}
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
                    onClick={() => handleCopy(preset.id)}
                    className={`inline-flex items-center gap-1.5 text-style-legal font-bold transition-colors duration-standard ${
                      copiedId === preset.id
                        ? 'bg-success text-on-success hover:bg-success border-transparent shadow-floating'
                        : ''
                    }`}
                  >
                    {copiedId === preset.id ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedId === preset.id ? 'Copiado!' : 'Aplicar Preset'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePresetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleCreatePreset}
      />
    </div>
  );
}
