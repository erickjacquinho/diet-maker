import React from 'react';
import { Search, RotateCcw, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SelectField, CreateButton } from '@/components/atoms';

interface FoodFilterHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: 'all' | 'favorites' | 'custom';
  setActiveTab: (tab: 'all' | 'favorites' | 'custom') => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  preparoFilter: string;
  setPreparoFilter: (prep: string) => void;
  macroPreset: 'all' | 'high-protein' | 'high-carb' | 'high-fat' | 'high-fiber';
  setMacroPreset: (preset: 'all' | 'high-protein' | 'high-carb' | 'high-fat' | 'high-fiber') => void;
  categoriesList: string[];
  preparosList: string[];
  resetFilters: () => void;
  onOpenCreateModal: () => void;
}

export function FoodFilterHeader({
  totalCount,
  filteredCount,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  categoryFilter,
  setCategoryFilter,
  preparoFilter,
  setPreparoFilter,
  macroPreset,
  setMacroPreset,
  categoriesList,
  preparosList,
  resetFilters,
  onOpenCreateModal,
}: FoodFilterHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title & Actions */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-success" />
            <h1 className="text-style-section-title font-bold text-text-primary tracking-tight">Base de Alimentos TACO</h1>
          </div>
          <p className="text-style-body-secondary text-text-secondary mt-1">
            Exibindo {filteredCount} de {totalCount} alimentos cadastrados.
          </p>
        </div>

        <CreateButton onClick={onOpenCreateModal}>Novo Alimento Customizado</CreateButton>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <Button
          variant={activeTab === 'all' ? 'primary' : 'quiet'}
          size="compact"
          onClick={() => setActiveTab('all')}
        >
          Todos os Alimentos
        </Button>
        <Button
          variant={activeTab === 'favorites' ? 'primary' : 'quiet'}
          size="compact"
          onClick={() => setActiveTab('favorites')}
        >
          Favoritos
        </Button>
        <Button
          variant={activeTab === 'custom' ? 'primary' : 'quiet'}
          size="compact"
          onClick={() => setActiveTab('custom')}
        >
          Customizados
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-5 gap-3 bg-surface-subtle p-3 rounded-control border border-border-subtle items-center">
        <div className="relative col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-surface"
          />
        </div>

        <SelectField
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          placeholder="Categoria"
          aria-label="Filtrar por categoria"
          triggerClassName="bg-surface"
          options={[
            { value: 'all', label: 'Todas Categorias' },
            ...categoriesList.map((cat) => ({ value: cat, label: cat })),
          ]}
        />

        <SelectField
          value={preparoFilter}
          onValueChange={setPreparoFilter}
          placeholder="Preparo"
          aria-label="Filtrar por preparo"
          triggerClassName="bg-surface"
          options={[
            { value: 'all', label: 'Todos Preparos' },
            ...preparosList.map((prep) => ({ value: prep, label: prep })),
          ]}
        />

        <div className="flex gap-2 items-center">
          <SelectField
            value={macroPreset}
            onValueChange={(val) => setMacroPreset(val as any)}
            placeholder="Filtro Macro"
            aria-label="Filtrar por macronutrientes"
            triggerClassName="bg-surface flex-1"
            options={[
              { value: 'all', label: 'Todos Macros' },
              { value: 'high-protein', label: 'Alta Proteína (>15g)' },
              { value: 'high-carb', label: 'Alto Carbo (>30g)' },
              { value: 'high-fat', label: 'Alta Gordura (>15g)' },
              { value: 'high-fiber', label: 'Rico em Fibras (>3g)' },
            ]}
          />

          <Button variant="secondary" size="compact" iconOnly onClick={resetFilters} title="Limpar Filtros">
            <RotateCcw className="w-4 h-4 text-text-muted" />
          </Button>
        </div>
      </div>
    </div>
  );
}
