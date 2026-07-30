'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Flame,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  RotateCcw,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreateButton, EditIconButton, DeleteIconButton } from '@/components/atoms';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AutoKcalSection } from '@/components/molecules/AutoKcalSection';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAllFoods,
  toggleFavoriteFood,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
  FoodItem,
} from '@/lib/tacoStore';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'custom'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [preparoFilter, setPreparoFilter] = useState('all');
  const [macroPreset, setMacroPreset] = useState<
    'all' | 'high-protein' | 'high-carb' | 'high-fat' | 'high-fiber'
  >('all');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [activeReorderId, setActiveReorderId] = useState<string | null>(null);

  // Custom Food Form State
  const [formData, setFormData] = useState({
    name: '',
    portion: '',
    unit: 'g',
    preparo: 'inNatura',
    category: 'Suplementos',
    proteinG: '',
    carbsG: '',
    fatsG: '',
    fiberG: '',
    isFavorite: false,
  });

  useEffect(() => {
    setFoods(getAllFoods());
  }, []);

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteFood(id);
    setFoods(getAllFoods());
  };

  const handleOpenCreateModal = () => {
    setEditingFoodId(null);
    setFormData({
      name: '',
      portion: '',
      unit: 'g',
      preparo: 'inNatura',
      category: 'Suplementos',
      proteinG: '',
      carbsG: '',
      fatsG: '',
      fiberG: '',
      isFavorite: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food: FoodItem) => {
    setEditingFoodId(food.id);

    let cleanName = food.name;
    let portionVal = '';
    let unitVal = 'g';
    const match = food.name.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    if (match) {
      if (match[1]) cleanName = match[1].trim();
      if (match[2]) {
        const portionMatch = match[2].match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
        if (portionMatch) {
          portionVal = portionMatch[1];
          unitVal = portionMatch[2] || 'g';
        } else {
          unitVal = match[2];
        }
      }
    }

    const validUnits = ['g', 'ml', 'un', 'scoop', 'fatia', 'colher (sopa)', 'colher (chá)', 'xícara', 'porção'];
    const safeUnit = validUnits.includes(unitVal) ? unitVal : 'g';

    const validCategories = [
      'Carnes, Pescados & Ovos',
      'Verduras & Legumes',
      'Frutas',
      'Cereais & Tubérculos',
      'Leguminosas',
      'Leite & Derivados',
      'Gorduras, Nozes & Sementes',
      'Doces, Bebidas & Processados',
      'Suplementos',
      'Manipulados & Produtos',
    ];
    const safeCategory = validCategories.includes(food.category) ? food.category : 'Suplementos';

    setFormData({
      name: cleanName,
      portion: portionVal,
      unit: safeUnit,
      preparo: food.preparo || 'Personalizado',
      category: safeCategory,
      proteinG: String(food.proteinG ?? ''),
      carbsG: String(food.carbsG ?? ''),
      fatsG: String(food.fatsG ?? ''),
      fiberG: String(food.fiberG ?? ''),
      isFavorite: food.isFavorite || false,
    });
    setIsModalOpen(true);
  };


  // Automatic Calorie Calculation via Atwater Factors: (4 * P) + (4 * C) + (9 * G)
  const calculatedKcal = Math.round(
    (Number(formData.proteinG) || 0) * 4 +
      (Number(formData.carbsG) || 0) * 4 +
      (Number(formData.fatsG) || 0) * 9
  );

  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const portionVal = formData.portion.trim();
    const portionStr = portionVal ? `${portionVal}${formData.unit}` : formData.unit;
    const fullName = `${formData.name.trim()} (${portionStr})`;

    const foodPayload = {
      name: fullName,
      preparo: formData.preparo.trim() || 'Personalizado',
      category: formData.category,
      kcal: calculatedKcal,
      proteinG: Number(formData.proteinG) || 0,
      carbsG: Number(formData.carbsG) || 0,
      fatsG: Number(formData.fatsG) || 0,
      fiberG: Number(formData.fiberG) || 0,
      isFavorite: formData.isFavorite,
    };

    if (editingFoodId) {
      updateCustomFood(editingFoodId, foodPayload);
    } else {
      addCustomFood(foodPayload);
    }

    setFoods(getAllFoods());
    setIsModalOpen(false);
    setEditingFoodId(null);
    setFormData({
      name: '',
      portion: '',
      unit: 'g',
      preparo: 'inNatura',
      category: 'Suplementos',
      proteinG: '',
      carbsG: '',
      fatsG: '',
      fiberG: '',
      isFavorite: false,
    });
  };

  const handleDeleteCustomFood = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este alimento customizado?')) {
      deleteCustomFood(id);
      setFoods(getAllFoods());
      setIsModalOpen(false);
      setEditingFoodId(null);
    }
  };

  // Extract unique categories and preparo values for dropdowns
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set).sort();
  }, [foods]);

  const preparosList = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => {
      if (f.preparo) set.add(f.preparo);
    });
    return Array.from(set).sort();
  }, [foods]);

  // Filtered dataset
  const filteredFoods = useMemo(() => {
    const normSearch = normalizeText(searchTerm.trim());

    return foods.filter((food) => {
      // Tab filter
      if (activeTab === 'favorites' && !food.isFavorite) return false;
      if (activeTab === 'custom' && food.source !== 'CUSTOM') return false;

      // Category filter
      if (categoryFilter !== 'all' && food.category !== categoryFilter) return false;

      // Preparo filter
      if (preparoFilter !== 'all' && food.preparo !== preparoFilter) return false;

      // Macro presets
      if (macroPreset === 'high-protein' && food.proteinG < 15) return false;
      if (macroPreset === 'high-carb' && food.carbsG < 25) return false;
      if (macroPreset === 'high-fat' && food.fatsG < 15) return false;
      if (macroPreset === 'high-fiber' && food.fiberG < 4) return false;

      // Diacritic-insensitive search
      if (normSearch) {
        const normName = normalizeText(food.name);
        const normCat = normalizeText(food.category);
        const normPrep = normalizeText(food.preparo);
        const matches = normName.includes(normSearch) || normCat.includes(normSearch) || normPrep.includes(normSearch);
        if (!matches) return false;
      }

      return true;
    });
  }, [foods, activeTab, categoryFilter, preparoFilter, macroPreset, searchTerm]);

  const resetFilters = () => {
    setSearchTerm('');
    setActiveTab('all');
    setCategoryFilter('all');
    setPreparoFilter('all');
    setMacroPreset('all');
    setSorting([]);
  };

  // Define TanStack Table Columns
  const columns = useMemo<ColumnDef<FoodItem>[]>(
    () => [
      {
        id: 'reorder',
        header: () => <span className="sr-only">Reordenar</span>,
        cell: ({ row }) => {
          const food = row.original;
          const isActivated = activeReorderId === food.id;
          return (
            <button
              type="button"
              onMouseDown={() => setActiveReorderId(food.id)}
              onMouseUp={() => setActiveReorderId(null)}
              onTouchStart={() => setActiveReorderId(food.id)}
              onTouchEnd={() => setActiveReorderId(null)}
              onClick={() => setActiveReorderId((prev) => (prev === food.id ? null : food.id))}
              aria-label={`Reordenar ${food.name}`}
              className={`p-1 rounded-md cursor-grab active:cursor-grabbing transition-opacity duration-150 text-warm-muted hover:text-warm-charcoal ${
                isActivated
                  ? 'opacity-100 text-warm-emerald bg-warm-emerald/10 ring-1 ring-warm-emerald/30'
                  : 'opacity-0 group-hover/row:opacity-100'
              }`}
              title="Reordenar alimento"
            >
              <GripVertical size={14} />
            </button>
          );
        },
        enableSorting: false,
      },
      {
        id: 'favorite',
        header: () => <span title="Favoritos">⭐</span>,
        cell: ({ row }) => {
          const food = row.original;
          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleFavorite(food.id)}
              className="h-6 w-6 p-0 hover:bg-warm-inner/80 rounded-lg transition-colors"
              title={food.isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Star
                size={14}
                className={food.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-warm-muted/50 hover:text-warm-muted'}
              />
            </Button>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent text-xs text-warm-charcoal"
          >
            <span>Alimento</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-warm-muted opacity-60" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold text-warm-charcoal text-xs">{row.original.name}</span>,
      },
      {
        accessorKey: 'preparo',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent text-xs text-warm-charcoal"
          >
            <span>Preparo</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-warm-muted opacity-60" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-bold border-warm-border bg-warm-inner text-warm-charcoal px-2 py-0.5 rounded-md">
            {row.original.preparo}
          </Badge>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent text-xs text-warm-charcoal"
          >
            <span>Categoria</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-warm-muted opacity-60" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-warm-muted font-semibold text-xs">{row.original.category}</span>,
      },
      {
        accessorKey: 'source',
        header: () => <span className="text-center block text-xs font-bold text-warm-charcoal">Origem</span>,
        cell: ({ row }) => (
          <Badge
            variant={row.original.source === 'TACO' ? 'secondary' : 'default'}
            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
              row.original.source === 'TACO'
                ? 'bg-warm-inner text-warm-muted border border-warm-border'
                : 'bg-warm-emerald/10 text-warm-emerald border border-warm-emerald/20'
            }`}
          >
            {row.original.source}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'kcal',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-xs text-warm-charcoal"
          >
            <span>Kcal</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-warm-muted opacity-60" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-black text-warm-charcoal text-xs">{row.original.kcal} <span className="text-[10px] text-warm-muted font-bold">kcal</span></div>,
      },
      {
        accessorKey: 'proteinG',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-blue-600 text-xs"
          >
            <span>Proteína</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-blue-600 font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-blue-600 font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-blue-600 text-xs">{row.original.proteinG}g</div>,
      },
      {
        accessorKey: 'carbsG',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-orange-500 text-xs"
          >
            <span>Carbo</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-orange-500 font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-orange-500 font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-orange-500 text-xs">{row.original.carbsG}g</div>,
      },
      {
        accessorKey: 'fatsG',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-emerald-700 text-xs"
          >
            <span>Gordura</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-emerald-700 font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-emerald-700 font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-emerald-700 text-xs">{row.original.fatsG}g</div>,
      },
      {
        accessorKey: 'fiberG',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-xs text-warm-charcoal"
          >
            <span>Fibra</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right text-warm-muted font-medium text-xs">{row.original.fiberG}g</div>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const food = row.original;
          if (food.source !== 'CUSTOM') return null;
          return (
            <EditIconButton
              onClick={() => handleOpenEditModal(food)}
              title="Editar Alimento Customizado"
            />
          );

        },
        enableSorting: false,
      },
    ],
    [activeReorderId]
  );

  const table = useReactTable({
    data: filteredFoods,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const isFiltered =
    searchTerm !== '' ||
    categoryFilter !== 'all' ||
    preparoFilter !== 'all' ||
    macroPreset !== 'all' ||
    activeTab !== 'all' ||
    sorting.length > 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-warm-emerald/10 text-warm-emerald">
              <BookOpen size={20} />
            </div>
            <h1 className="font-black text-xl text-warm-charcoal tracking-tight">Tabela de Alimentos (TACO)</h1>
          </div>
          <p className="text-xs text-warm-muted font-medium mt-1">
            Biblioteca oficial TACO e alimentos customizados para prescrição de dietas.
          </p>
        </div>
        <CreateButton
          onClick={handleOpenCreateModal}
          icon={<Plus size={14} />}
        >
          Cadastrar Alimento
        </CreateButton>
      </div>

      {/* Filter Controls Card */}
      <Card className="bg-warm-card border-warm-border p-4 rounded-2xl shadow-xs">
        <CardContent className="p-0 space-y-3">
          {/* Row 1: Primary Tabs & Clear Button */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-warm-border pb-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-warm-charcoal text-white shadow-xs'
                    : 'bg-warm-inner text-warm-muted hover:text-warm-charcoal hover:bg-warm-border/60 border border-warm-border'
                }`}
              >
                Todos ({foods.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'favorites'
                    ? 'bg-warm-charcoal text-white shadow-xs'
                    : 'bg-warm-inner text-warm-muted hover:text-warm-charcoal hover:bg-warm-border/60 border border-warm-border'
                }`}
              >
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>Favoritos ⭐ ({foods.filter((f) => f.isFavorite).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'custom'
                    ? 'bg-warm-charcoal text-white shadow-xs'
                    : 'bg-warm-inner text-warm-muted hover:text-warm-charcoal hover:bg-warm-border/60 border border-warm-border'
                }`}
              >
                Customizados ({foods.filter((f) => f.source === 'CUSTOM').length})
              </button>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          {/* Row 2: Search Input & Select Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Search */}
            <div className="md:col-span-6 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-muted z-10 pointer-events-none" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisa rápida (ex: pao, feijao, frango, grelhado)..."
                className="pl-8 pr-3 bg-warm-inner border-warm-border text-xs h-9 rounded-xl text-warm-charcoal placeholder:text-warm-muted focus-visible:ring-warm-emerald"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="md:col-span-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-warm-inner border-warm-border text-xs h-9 rounded-xl text-warm-charcoal font-semibold">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-warm-card border-warm-border text-warm-charcoal text-xs shadow-md">
                  <SelectItem value="all">Todas as Categorias ({categoriesList.length})</SelectItem>
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preparo Dropdown Filter */}
            <div className="md:col-span-3">
              <Select value={preparoFilter} onValueChange={setPreparoFilter}>
                <SelectTrigger className="bg-warm-inner border-warm-border text-xs h-9 rounded-xl text-warm-charcoal font-semibold">
                  <SelectValue placeholder="Preparo" />
                </SelectTrigger>
                <SelectContent className="bg-warm-card border-warm-border text-warm-charcoal text-xs shadow-md">
                  <SelectItem value="all">Todos os Preparos ({preparosList.length})</SelectItem>
                  {preparosList.map((prep) => (
                    <SelectItem key={prep} value={prep}>
                      {prep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Essential Macro Preset Shortcuts */}
          <div className="flex items-center space-x-2 pt-1 overflow-x-auto">
            <span className="text-[10px] font-black text-warm-muted uppercase tracking-wider shrink-0 flex items-center space-x-1">
              <Filter size={11} className="text-warm-emerald" />
              <span>Macros:</span>
            </span>

            <button
              type="button"
              onClick={() => setMacroPreset(macroPreset === 'high-protein' ? 'all' : 'high-protein')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                macroPreset === 'high-protein'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-warm-inner text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              🥩 Proteína Alta
            </button>

            <button
              type="button"
              onClick={() => setMacroPreset(macroPreset === 'high-carb' ? 'all' : 'high-carb')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                macroPreset === 'high-carb'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-warm-inner text-amber-600 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              🍞 Carboidrato Alto
            </button>

            <button
              type="button"
              onClick={() => setMacroPreset(macroPreset === 'high-fat' ? 'all' : 'high-fat')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                macroPreset === 'high-fat'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-warm-inner text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              🧀 Gordura Alta
            </button>

            <button
              type="button"
              onClick={() => setMacroPreset(macroPreset === 'high-fiber' ? 'all' : 'high-fiber')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                macroPreset === 'high-fiber'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-warm-inner text-teal-700 border border-teal-200 hover:bg-teal-50'
              }`}
            >
              🌾 Fibra Alta
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet Table */}
      <Card className="bg-warm-card border-warm-border rounded-2xl overflow-hidden shadow-xs p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-warm-inner/80 border-b border-warm-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-warm-border hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-2.5 px-3 select-none text-[10px] uppercase font-black text-warm-muted tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-warm-border text-warm-charcoal font-medium">
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-8 text-center text-warm-muted font-semibold text-xs italic">
                    Nenhum alimento encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="group/row hover:bg-warm-inner/50 transition-colors border-b border-warm-border/60">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 px-3 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Compact Pagination Bar */}
        <div className="py-3 px-4 border-t border-warm-border bg-warm-inner/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-warm-muted font-medium text-[11px]">
            <span>
              <strong className="text-warm-charcoal font-bold">{filteredFoods.length}</strong> alimentos
            </span>
            <span>•</span>
            <span>
              Página <strong className="text-warm-charcoal font-bold">{table.getState().pagination.pageIndex + 1}</strong> de{' '}
              <strong className="text-warm-charcoal font-bold">{table.getPageCount() || 1}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-warm-muted font-bold text-[10px]">Por página:</span>
              <Select
                value={table.getState().pagination.pageSize > 100 ? 'all' : String(table.getState().pagination.pageSize)}
                onValueChange={(val) => {
                  if (val === 'all') {
                    table.setPageSize(filteredFoods.length || 999999);
                  } else {
                    table.setPageSize(Number(val));
                  }
                }}
              >
                <SelectTrigger className="h-7 w-20 bg-warm-card border-warm-border text-xs font-bold text-warm-charcoal rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-warm-card border-warm-border text-warm-charcoal text-xs">
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>

            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-7 w-7 bg-warm-card border-warm-border text-warm-charcoal hover:bg-warm-inner rounded-lg"
                title="Primeira Página"
              >
                <ChevronsLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-7 w-7 bg-warm-card border-warm-border text-warm-charcoal hover:bg-warm-inner rounded-lg"
                title="Página Anterior"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7 bg-warm-card border-warm-border text-warm-charcoal hover:bg-warm-inner rounded-lg"
                title="Próxima Página"
              >
                <ChevronRight size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7 bg-warm-card border-warm-border text-warm-charcoal hover:bg-warm-inner rounded-lg"
                title="Última Página"
              >
                <ChevronsRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal Cadastro/Edição de Alimento Customizado Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-warm-card border-warm-border p-6 rounded-2xl shadow-xl">
          <DialogHeader className="border-b border-warm-border pb-3 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="font-black text-base text-warm-charcoal">
                {editingFoodId ? 'Editar Alimento Customizado' : 'Novo Alimento Customizado'}
              </DialogTitle>
              <p className="text-[11px] text-warm-muted font-medium mt-0.5">
                {editingFoodId
                  ? 'Atualize os dados e composição nutricional do alimento.'
                  : 'Cadastre um produto comercial ou suplemento manipulado na biblioteca.'}
              </p>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveCustomFood} className="space-y-3.5 pt-2">
            {/* Row 1: Name, Portion & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <div className="md:col-span-6">
                <label className="text-xs font-bold text-warm-charcoal block mb-1">
                  Nome do Alimento / Suplemento <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Ex: Whey Protein 80% Max"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-warm-inner border-warm-border text-xs h-9 rounded-xl text-warm-charcoal font-medium placeholder:text-warm-muted focus:border-warm-emerald"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-warm-charcoal block mb-1">
                  Qtd. Porção
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 100 ou 1"
                  value={formData.portion}
                  onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                  className="bg-warm-inner border-warm-border text-xs font-bold h-9 rounded-xl text-warm-charcoal"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-warm-charcoal block mb-1">
                  Unidade
                </label>
                <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                  <SelectTrigger className="bg-warm-inner border-warm-border text-xs font-bold h-9 rounded-xl text-warm-charcoal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-warm-card border-warm-border text-warm-charcoal text-xs">
                    <SelectItem value="g">g (Grama)</SelectItem>
                    <SelectItem value="ml">ml (Mililitro)</SelectItem>
                    <SelectItem value="un">un (Unidade)</SelectItem>
                    <SelectItem value="scoop">scoop (Dosador)</SelectItem>
                    <SelectItem value="fatia">fatia (Fatia)</SelectItem>
                    <SelectItem value="colher (sopa)">colher (sopa)</SelectItem>
                    <SelectItem value="colher (chá)">colher (chá)</SelectItem>
                    <SelectItem value="xícara">xícara</SelectItem>
                    <SelectItem value="porção">porção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Category and Preparo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <div className="md:col-span-6">
                <label className="text-xs font-bold text-warm-charcoal block mb-1">Categoria</label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="bg-warm-inner border-warm-border text-xs h-9 rounded-xl text-warm-charcoal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-warm-card border-warm-border text-warm-charcoal text-xs">
                    <SelectItem value="Carnes, Pescados & Ovos">Carnes, Pescados & Ovos</SelectItem>
                    <SelectItem value="Verduras & Legumes">Verduras & Legumes</SelectItem>
                    <SelectItem value="Frutas">Frutas</SelectItem>
                    <SelectItem value="Cereais & Tubérculos">Cereais & Tubérculos</SelectItem>
                    <SelectItem value="Leguminosas">Leguminosas</SelectItem>
                    <SelectItem value="Leite & Derivados">Leite & Derivados</SelectItem>
                    <SelectItem value="Gorduras, Nozes & Sementes">Gorduras, Nozes & Sementes</SelectItem>
                    <SelectItem value="Doces, Bebidas & Processados">Doces, Bebidas & Processados</SelectItem>
                    <SelectItem value="Suplementos">Suplementos</SelectItem>
                    <SelectItem value="Manipulados & Produtos">Manipulados & Produtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-6">
                <label className="text-xs font-bold text-warm-charcoal block mb-1">Forma de Preparo</label>
                <Input
                  type="text"
                  placeholder="Ex: Grelhado, Cozido, Cru, Air Fryer"
                  value={formData.preparo}
                  onChange={(e) => setFormData({ ...formData, preparo: e.target.value })}
                  className="bg-warm-inner border-warm-border text-xs h-9 rounded-xl text-warm-charcoal"
                />
              </div>
            </div>

            <AutoKcalSection
              title="Macronutrientes da Porção & Calorias Calculadas"
              proteinG={Number(formData.proteinG) || 0}
              carbsG={Number(formData.carbsG) || 0}
              fatsG={Number(formData.fatsG) || 0}
              onProteinChange={(val) => setFormData({ ...formData, proteinG: String(val) })}
              onCarbsChange={(val) => setFormData({ ...formData, carbsG: String(val) })}
              onFatsChange={(val) => setFormData({ ...formData, fatsG: String(val) })}
            />

            {/* FIBER */}
            <div>
              <label className="text-xs font-semibold text-warm-muted block mb-1">Fibra Alimentar (opcional)</label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="Ex: 2"
                value={formData.fiberG}
                onChange={(e) => setFormData({ ...formData, fiberG: e.target.value })}
                className="bg-warm-inner border-warm-border text-xs font-bold h-9 rounded-xl text-warm-charcoal"
              />
            </div>

            <div className="pt-2 flex items-center space-x-2">
              {editingFoodId && (
                <button
                  type="button"
                  onClick={() => handleDeleteCustomFood(editingFoodId)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                  title="Excluir Alimento"
                >
                  <Trash2 size={13} />
                  <span>Excluir</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-warm-inner hover:bg-warm-border text-warm-charcoal rounded-xl text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-warm-emerald hover:bg-warm-emerald/90 text-white rounded-xl text-xs font-bold transition-colors shadow-xs border-none"
              >
                {editingFoodId ? 'Salvar Alterações' : 'Salvar Alimento'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

