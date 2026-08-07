import React from 'react';
import { Search, RotateCcw, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateButton } from '@/components/atoms';

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
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Base de Alimentos TACO</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Exibindo {filteredCount} de {totalCount} alimentos cadastrados.
          </p>
        </div>

        <CreateButton onClick={onOpenCreateModal}>Novo Alimento Customizado</CreateButton>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categoriesList.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={preparoFilter} onValueChange={setPreparoFilter}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Preparo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Preparos</SelectItem>
            {preparosList.map((prep) => (
              <SelectItem key={prep} value={prep}>
                {prep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select value={macroPreset} onValueChange={(val: any) => setMacroPreset(val)}>
            <SelectTrigger className="bg-white flex-1">
              <SelectValue placeholder="Filtro Macro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Macros</SelectItem>
              <SelectItem value="high-protein">Alta Proteína (&gt;15g)</SelectItem>
              <SelectItem value="high-carb">Alto Carbo (&gt;30g)</SelectItem>
              <SelectItem value="high-fat">Alta Gordura (&gt;15g)</SelectItem>
              <SelectItem value="high-fiber">Rico em Fibras (&gt;3g)</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="secondary" size="compact" iconOnly onClick={resetFilters} title="Limpar Filtros">
            <RotateCcw className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
