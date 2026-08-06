'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, Copy, Utensils, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  calculatePresetCalories,
  calculateMacroGrams,
  MacroMode,
} from '@/lib/presetUtils';

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
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false);


  const [formData, setFormData] = useState({
    title: '',
    category: 'Emagrecimento',
    proteinMode: 'absoluto' as MacroMode,
    proteinValue: 160,
    carbsMode: 'absoluto' as MacroMode,
    carbsValue: 200,
    fatsMode: 'absoluto' as MacroMode,
    fatsValue: 60,
    referenceWeight: 70,
    mealsCount: 5,
    description: '',
  });

  const proteinG = calculateMacroGrams(
    { mode: formData.proteinMode, value: formData.proteinValue },
    formData.referenceWeight
  );
  const carbsG = calculateMacroGrams(
    { mode: formData.carbsMode, value: formData.carbsValue },
    formData.referenceWeight
  );
  const fatsG = calculateMacroGrams(
    { mode: formData.fatsMode, value: formData.fatsValue },
    formData.referenceWeight
  );

  const calculatedKcal = calculatePresetCalories(proteinG, carbsG, fatsG);

  const hasMultiplicative =
    formData.proteinMode === 'multiplicativo' ||
    formData.carbsMode === 'multiplicativo' ||
    formData.fatsMode === 'multiplicativo';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRESETS_KEY);
      if (saved) setPresets(JSON.parse(saved));
    } catch {
      setPresets([]);
    }
  }, []);

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newPreset: DietPreset = {
      ...formData,
      proteinG,
      carbsG,
      fatsG,
      targetKcal: calculatedKcal,
      id: `preset-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    const updated = [newPreset, ...presets];
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
    setIsModalOpen(false);
    setFormData({
      title: '',
      category: 'Emagrecimento',
      proteinMode: 'absoluto',
      proteinValue: 160,
      carbsMode: 'absoluto',
      carbsValue: 200,
      fatsMode: 'absoluto',
      fatsValue: 60,
      referenceWeight: 70,
      mealsCount: 5,
      description: '',
    });
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
                    <span className="font-bold text-style-legal text-warning">
                      {preset.carbsMode === 'multiplicativo' ? `${preset.carbsValue ?? preset.carbsG}g/kg` : `${preset.carbsG}g`}
                    </span>
                  </div>
                  <div>
                    <span className="text-style-chart-micro font-bold text-text-muted block tracking-label">Gord</span>
                    <span className="font-bold text-style-legal text-success">
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
                        ? 'bg-success text-on-success hover:bg-success border-transparent shadow-floating scale-[1.02]'
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

      {/* Modal Criar Preset Shadcn Dialog */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open && (formData.title.trim() || formData.description.trim())) {
            setIsConfirmDiscardOpen(true);
          } else {
            setIsModalOpen(open);
          }
        }}
      >
        <DialogContent
          onInteractOutside={(e) => {
            if (formData.title.trim() || formData.description.trim()) {
              e.preventDefault();
              setIsConfirmDiscardOpen(true);
            }
          }}
          className="max-w-md bg-surface border-border-subtle p-6 rounded-surface max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="font-bold text-style-body text-text-primary">Novo Preset de Dieta</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePreset} className="flex flex-col gap-3.5 pt-2">
            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Título do Protocolo</label>
              <Input
                type="text"
                required
                placeholder="Ex: Protocolo Cutting Low Carb 1800kcal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-surface-subtle border-border-subtle text-style-legal"
              />
            </div>

            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Categoria</label>
              <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                <SelectTrigger className="bg-surface-subtle border-border-subtle text-style-legal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emagrecimento">Emagrecimento / Cutting</SelectItem>
                  <SelectItem value="Hipertrofia">Hipertrofia / Bulking</SelectItem>
                  <SelectItem value="Manutenção">Manutenção / Saude</SelectItem>
                  <SelectItem value="Jejum Intermitente">Jejum Intermitente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Macronutrientes Section Header */}
            <div className="flex flex-col gap-2.5">
              <label className="text-style-legal font-bold text-text-primary block">Macronutrientes</label>

              {/* Proteína */}
              <div className="p-2.5 bg-surface-subtle border border-border-subtle rounded-control flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-style-legal font-bold text-macro-protein flex items-center gap-1">
                    <span>Proteínas</span>
                    {formData.proteinMode === 'multiplicativo' && (
                      <span className="text-style-legal text-text-muted font-normal">({proteinG}g est.)</span>
                    )}
                  </span>
                  <span className="text-style-legal font-semibold text-text-muted">Modo de Cálculo</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={formData.proteinMode}
                    onValueChange={(val: MacroMode) => setFormData({ ...formData, proteinMode: val })}
                  >
                    <SelectTrigger className="bg-surface border-border-subtle text-style-legal h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absoluto">Absoluto (g)</SelectItem>
                      <SelectItem value="multiplicativo">Multiplicativo (g/kg)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    step={formData.proteinMode === 'multiplicativo' ? 0.1 : 1}
                    value={formData.proteinValue}
                    onChange={(e) => setFormData({ ...formData, proteinValue: Number(e.target.value) })}
                    placeholder={formData.proteinMode === 'multiplicativo' ? 'ex: 2.0' : 'ex: 160'}
                    className="bg-surface border-border-subtle text-style-legal font-bold text-center h-8"
                  />
                </div>
              </div>

              {/* Carboidratos */}
              <div className="p-2.5 bg-surface-subtle border border-border-subtle rounded-control flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-style-legal font-bold text-warning flex items-center gap-1">
                    <span>Carboidratos</span>
                    {formData.carbsMode === 'multiplicativo' && (
                      <span className="text-style-legal text-text-muted font-normal">({carbsG}g est.)</span>
                    )}
                  </span>
                  <span className="text-style-legal font-semibold text-text-muted">Modo de Cálculo</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={formData.carbsMode}
                    onValueChange={(val: MacroMode) => setFormData({ ...formData, carbsMode: val })}
                  >
                    <SelectTrigger className="bg-surface border-border-subtle text-style-legal h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absoluto">Absoluto (g)</SelectItem>
                      <SelectItem value="multiplicativo">Multiplicativo (g/kg)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    step={formData.carbsMode === 'multiplicativo' ? 0.1 : 1}
                    value={formData.carbsValue}
                    onChange={(e) => setFormData({ ...formData, carbsValue: Number(e.target.value) })}
                    placeholder={formData.carbsMode === 'multiplicativo' ? 'ex: 3.0' : 'ex: 200'}
                    className="bg-surface border-border-subtle text-style-legal font-bold text-center h-8"
                  />
                </div>
              </div>

              {/* Gorduras */}
              <div className="p-2.5 bg-surface-subtle border border-border-subtle rounded-control flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-style-legal font-bold text-success flex items-center gap-1">
                    <span>Gorduras</span>
                    {formData.fatsMode === 'multiplicativo' && (
                      <span className="text-style-legal text-text-muted font-normal">({fatsG}g est.)</span>
                    )}
                  </span>
                  <span className="text-style-legal font-semibold text-text-muted">Modo de Cálculo</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={formData.fatsMode}
                    onValueChange={(val: MacroMode) => setFormData({ ...formData, fatsMode: val })}
                  >
                    <SelectTrigger className="bg-surface border-border-subtle text-style-legal h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absoluto">Absoluto (g)</SelectItem>
                      <SelectItem value="multiplicativo">Multiplicativo (g/kg)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    step={formData.fatsMode === 'multiplicativo' ? 0.1 : 1}
                    value={formData.fatsValue}
                    onChange={(e) => setFormData({ ...formData, fatsValue: Number(e.target.value) })}
                    placeholder={formData.fatsMode === 'multiplicativo' ? 'ex: 0.8' : 'ex: 60'}
                    className="bg-surface border-border-subtle text-style-legal font-bold text-center h-8"
                  />
                </div>
              </div>
            </div>

            {/* Peso de Referência (visível se algum macro for multiplicativo) */}
            {hasMultiplicative && (
              <div className="p-2.5 bg-warning-soft border border-warning-border rounded-control flex items-center justify-between gap-2">
                <div>
                  <label className="text-style-legal font-bold text-text-primary block">Peso de Referência (kg)</label>
                  <span className="text-style-legal text-text-muted font-medium block">Estimativa para cálculo total (g/kg × kg)</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={formData.referenceWeight}
                  onChange={(e) => setFormData({ ...formData, referenceWeight: Number(e.target.value) })}
                  className="bg-surface border-border-subtle text-style-legal font-bold text-center w-20 h-8 shrink-0"
                />
              </div>
            )}

            {/* Auto-calculated Kcal Display */}
            <div className="p-3 bg-surface-subtle border border-border-subtle rounded-control flex items-center justify-between">
              <div>
                <span className="text-style-legal font-bold text-text-primary block">Calorias Totais (Calculadas)</span>
                <span className="text-style-legal text-text-muted font-medium block">Auto: (Prot × 4) + (Carb × 4) + (Gord × 9)</span>
              </div>
              <Badge variant="secondary" className="font-bold text-style-body-small text-success bg-success-soft border-none px-3 py-1 shrink-0">
                {calculatedKcal} kcal
              </Badge>
            </div>

            <div>
              <label className="text-style-legal font-bold text-text-primary block mb-1">Descrição Breve</label>
              <textarea
                rows={2}
                placeholder="Orientações e indicações deste preset..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border-subtle rounded-control text-style-legal text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="compact"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="compact" className="flex-1">
                Salvar Preset
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Descarte ao Clicar Fora */}
      <Dialog open={isConfirmDiscardOpen} onOpenChange={setIsConfirmDiscardOpen}>
        <DialogContent className="max-w-sm bg-surface border-border-subtle p-6 rounded-surface">
          <DialogHeader>
            <DialogTitle className="font-bold text-style-body text-text-primary">Descartar alterações?</DialogTitle>
            <div className="text-style-legal text-text-secondary pt-1">
              Você possui dados preenchidos no formulário de preset. Se fechar agora, todas as informações não salvas serão perdidas.
            </div>
          </DialogHeader>
          <div className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="compact"
              onClick={() => setIsConfirmDiscardOpen(false)}
              className="flex-1"
            >
              Continuar Editando
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="compact"
              onClick={() => {
                setIsConfirmDiscardOpen(false);
                setIsModalOpen(false);
                setFormData({
                  title: '',
                  category: 'Emagrecimento',
                  proteinMode: 'absoluto',
                  proteinValue: 160,
                  carbsMode: 'absoluto',
                  carbsValue: 200,
                  fatsMode: 'absoluto',
                  fatsValue: 60,
                  referenceWeight: 70,
                  mealsCount: 5,
                  description: '',
                });
              }}
              className="flex-1"
            >
              Descartar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
