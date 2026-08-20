'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { CreateButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePresetModal, type CreatePresetData } from '@/components/molecules/CreatePresetModal';
import { PresetCard } from './PresetCard';
import {
  type DietPreset,
  getPresetsFromStorage,
  savePresetToStorage,
} from '@/lib/presetsStore';

export default function PresetsPage() {
  const [presets, setPresets] = useState<DietPreset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setPresets(getPresetsFromStorage());
  }, []);

  const handleCreatePreset = (formData: CreatePresetData) => {
    savePresetToStorage(formData);
    setPresets(getPresetsFromStorage());
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
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
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

      {presets.length > 0 && (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar preset por nome ou categoria (ex: Low Carb, Bulking)..."
            className="pl-11 pr-4"
          />
        </div>
      )}

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
            <PresetCard
              key={preset.id}
              preset={preset}
              isCopied={copiedId === preset.id}
              onCopy={handleCopy}
            />
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
