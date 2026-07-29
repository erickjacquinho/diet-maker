'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, Copy, Utensils, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface DietPreset {
  id: string;
  title: string;
  category: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  mealsCount: number;
  description: string;
}

const PRESETS_KEY = 'nutridiet_presets';

export default function PresetsPage() {
  const [presets, setPresets] = useState<DietPreset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Emagrecimento',
    targetKcal: 2000,
    proteinG: 160,
    carbsG: 200,
    fatsG: 60,
    mealsCount: 5,
    description: '',
  });

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
      targetKcal: 2000,
      proteinG: 160,
      carbsG: 200,
      fatsG: 60,
      mealsCount: 5,
      description: '',
    });
  };

  const filteredPresets = presets.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles size={20} className="text-warm-emerald" />
            <h1 className="font-black text-2xl text-warm-charcoal tracking-tight">Presets de Dietas</h1>
          </div>
          <p className="text-xs text-warm-muted mt-1 font-medium">
            Biblioteca global de protocolos nutricionais completos para duplicação e aplicação rápida em pacientes.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="flex items-center space-x-2 shrink-0 bg-warm-emerald text-white hover:bg-warm-emerald/90 font-bold"
        >
          <Plus size={16} />
          <span>Criar Novo Preset</span>
        </Button>
      </div>

      {/* Search Input */}
      {presets.length > 0 && (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-muted z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar preset por nome ou categoria (ex: Low Carb, Bulking)..."
            className="pl-11 pr-4 bg-warm-card border-warm-border text-xs"
          />
        </div>
      )}

      {/* Empty State vs Presets Grid */}
      {filteredPresets.length === 0 ? (
        <Card className="bg-warm-card border-warm-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <CardContent className="p-0 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-warm-inner border border-warm-border flex items-center justify-center mx-auto text-warm-muted">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-black text-base text-warm-charcoal">Nenhum preset cadastrado</h3>
              <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                Sua biblioteca de protocolos inteiros está em branco. Crie seu primeiro preset de dieta reutilizável.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="inline-flex items-center space-x-2 text-xs font-bold bg-warm-emerald text-white hover:bg-warm-emerald/90"
            >
              <Plus size={16} />
              <span>Criar Primeiro Preset</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPresets.map((preset) => (
            <Card
              key={preset.id}
              className="bg-warm-card border-warm-border rounded-2xl p-5 hover:border-warm-charcoal/30 transition-all flex flex-col justify-between space-y-4"
            >
              <CardContent className="p-0 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="text-[10px] font-extrabold bg-warm-emerald/10 text-warm-emerald">
                      {preset.category}
                    </Badge>
                    <span className="text-[11px] font-semibold text-warm-muted flex items-center space-x-1">
                      <Utensils size={12} />
                      <span>{preset.mealsCount} refeições</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-warm-charcoal leading-snug">{preset.title}</h3>
                  <p className="text-xs text-warm-muted leading-relaxed line-clamp-2">{preset.description}</p>
                </div>

                {/* Macro Summary */}
                <div className="grid grid-cols-4 gap-1.5 p-3 bg-warm-inner border border-warm-border rounded-xl text-center">
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Kcal</span>
                    <span className="font-black text-xs text-warm-charcoal">{preset.targetKcal}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Prot</span>
                    <span className="font-black text-xs text-rose-700">{preset.proteinG}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Carb</span>
                    <span className="font-black text-xs text-amber-700">{preset.carbsG}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted block uppercase">Gord</span>
                    <span className="font-black text-xs text-emerald-700">{preset.fatsG}g</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-warm-border">
                  <span className="text-[10px] text-warm-muted font-medium">Reutilizável em 1 clique</span>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(preset.id)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold"
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-warm-card border-warm-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-warm-border pb-3">
            <DialogTitle className="font-black text-base text-warm-charcoal">Novo Preset de Dieta</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePreset} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Título do Protocolo</label>
              <Input
                type="text"
                required
                placeholder="Ex: Protocolo Cutting Low Carb 1800kcal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-warm-inner border-warm-border text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Categoria</label>
              <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                <SelectTrigger className="bg-warm-inner border-warm-border text-xs">
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

            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Kcal</label>
                <Input
                  type="number"
                  value={formData.targetKcal}
                  onChange={(e) => setFormData({ ...formData, targetKcal: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Prot (g)</label>
                <Input
                  type="number"
                  value={formData.proteinG}
                  onChange={(e) => setFormData({ ...formData, proteinG: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Carb (g)</label>
                <Input
                  type="number"
                  value={formData.carbsG}
                  onChange={(e) => setFormData({ ...formData, carbsG: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-warm-muted block mb-1">Gord (g)</label>
                <Input
                  type="number"
                  value={formData.fatsG}
                  onChange={(e) => setFormData({ ...formData, fatsG: Number(e.target.value) })}
                  className="bg-warm-inner border-warm-border text-xs font-bold text-center p-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">Descrição Breve</label>
              <textarea
                rows={2}
                placeholder="Orientações e indicações deste preset..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-warm-inner border border-warm-border rounded-xl text-xs text-warm-charcoal focus:outline-none focus:ring-2 focus:ring-warm-charcoal resize-none"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="flex-1 text-xs font-bold bg-warm-emerald text-white hover:bg-warm-emerald/90">
                Salvar Preset
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

