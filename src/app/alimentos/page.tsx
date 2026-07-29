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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllFoods, toggleFavoriteFood, addCustomFood, FoodItem } from '@/lib/tacoStore';

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

  // New Custom Food Form State
  const [formData, setFormData] = useState({
    name: '',
    portion: '',
    unit: 'g',
    preparo: 'In Natura',
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

  // Automatic Calorie Calculation via Atwater Factors: (4 * P) + (4 * C) + (9 * G)
  const calculatedKcal = Math.round(
    (Number(formData.proteinG) || 0) * 4 +
      (Number(formData.carbsG) || 0) * 4 +
      (Number(formData.fatsG) || 0) * 9
  );

  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const portionVal = formData.portion.trim();
    const portionStr = portionVal ? `${portionVal}${formData.unit}` : formData.unit;
    const fullName = `${formData.name.trim()} (${portionStr})`;

    addCustomFood({
      name: fullName,
      preparo: formData.preparo.trim() || 'In Natura',
      category: formData.category,
      kcal: calculatedKcal,
      proteinG: Number(formData.proteinG) || 0,
      carbsG: Number(formData.carbsG) || 0,
      fatsG: Number(formData.fatsG) || 0,
      fiberG: Number(formData.fiberG) || 0,
      isFavorite: formData.isFavorite,
    });

    setFoods(getAllFoods());
    setIsModalOpen(false);
    setFormData({
      name: '',
      portion: '',
      unit: 'g',
      preparo: 'In Natura',
      category: 'Suplementos',
      proteinG: '',
      carbsG: '',
      fatsG: '',
      fiberG: '',
      isFavorite: false,
    });
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
        id: 'favorite',
        header: () => <span title="Favoritos">⭐</span>,
        cell: ({ row }) => {
          const food = row.original;
          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleFavorite(food.id)}
              className="h-6 w-6 p-0 hover:bg-warm-inner"
              title={food.isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Star
                size={14}
                className={food.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-warm-muted'}
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
            className="p-0 h-6 font-bold hover:bg-transparent text-xs"
          >
            <span>Alimento</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
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
            className="p-0 h-6 font-bold hover:bg-transparent text-xs"
          >
            <span>Preparo</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-semibold border-warm-border/80 px-1.5 py-0">
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
            className="p-0 h-6 font-bold hover:bg-transparent text-xs"
          >
            <span>Categoria</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-warm-muted font-medium text-xs">{row.original.category}</span>,
      },
      {
        accessorKey: 'source',
        header: () => <span className="text-center block text-xs">Origem</span>,
        cell: ({ row }) => (
          <Badge
            variant={row.original.source === 'TACO' ? 'secondary' : 'default'}
            className={`text-[9px] font-extrabold px-1.5 py-0 ${
              row.original.source === 'TACO'
                ? 'bg-warm-border/50 text-warm-muted'
                : 'bg-warm-emerald/10 text-warm-emerald'
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
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-xs"
          >
            <span>Kcal</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-warm-emerald font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-warm-emerald font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-black text-warm-charcoal text-xs">{row.original.kcal} kcal</div>,
      },
      {
        accessorKey: 'proteinG',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-rose-700 text-xs"
          >
            <span>Proteína</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-rose-700 font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-rose-700 font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-rose-700 text-xs">{row.original.proteinG}g</div>,
      },
      {
        accessorKey: 'carbsG',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-amber-700 text-xs"
          >
            <span>Carbo</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-amber-700 font-black" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-amber-700 font-black" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-amber-700 text-xs">{row.original.carbsG}g</div>,
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
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-xs"
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
        cell: ({ row }) => <div className="text-right text-warm-muted text-xs">{row.original.fiberG}g</div>,
      },
    ],
    []
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
      {/* Compact Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BookOpen size={20} className="text-warm-emerald" />
          <h1 className="font-black text-xl text-warm-charcoal tracking-tight">Tabela de Alimentos (TACO)</h1>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="flex items-center space-x-1.5 shrink-0 bg-warm-emerald text-white hover:bg-warm-emerald/90 font-bold h-8 text-xs"
        >
          <Plus size={14} />
          <span>Cadastrar Alimento</span>
        </Button>
      </div>

      {/* Ultra Compact Filter Controls Card */}
      <Card className="bg-warm-card border-warm-border p-3 rounded-xl shadow-xs">
        <CardContent className="p-0 space-y-3">
          {/* Row 1: Primary Tabs & Clear Button */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-warm-border pb-2">
            <div className="flex items-center space-x-1 overflow-x-auto">
              <Button
                size="sm"
                variant={activeTab === 'all' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('all')}
                className="text-xs h-7 px-2.5 font-bold shrink-0"
              >
                Todos ({foods.length})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'favorites' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('favorites')}
                className="text-xs h-7 px-2.5 font-bold flex items-center space-x-1 shrink-0"
              >
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>Favoritos ⭐ ({foods.filter((f) => f.isFavorite).length})</span>
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'custom' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('custom')}
                className="text-xs h-7 px-2.5 font-bold shrink-0"
              >
                Customizados ({foods.filter((f) => f.source === 'CUSTOM').length})
              </Button>
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center space-x-1 h-7 px-2"
              >
                <RotateCcw size={12} />
                <span>Limpar Filtros</span>
              </Button>
            )}
          </div>

          {/* Row 2: Search Input & Select Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            {/* Diacritic Insensitive Search */}
            <div className="md:col-span-6 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-muted z-10 pointer-events-none" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisa rápida (ex: pao, feijao, frango, grelhado)..."
                className="pl-8 pr-3 bg-warm-inner border-warm-border text-xs h-8"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="md:col-span-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-warm-inner border-warm-border text-xs h-8">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger className="bg-warm-inner border-warm-border text-xs h-8">
                  <SelectValue placeholder="Preparo" />
                </SelectTrigger>
                <SelectContent>
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
          <div className="flex items-center space-x-1.5 pt-0.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider shrink-0 flex items-center space-x-1">
              <Filter size={11} />
              <span>Filtros:</span>
            </span>

            <Button
              size="sm"
              variant={macroPreset === 'high-protein' ? 'default' : 'outline'}
              onClick={() => setMacroPreset(macroPreset === 'high-protein' ? 'all' : 'high-protein')}
              className="text-xs h-7 px-2 font-bold text-rose-700 shrink-0"
            >
              🥩 Proteína Alta
            </Button>

            <Button
              size="sm"
              variant={macroPreset === 'high-carb' ? 'default' : 'outline'}
              onClick={() => setMacroPreset(macroPreset === 'high-carb' ? 'all' : 'high-carb')}
              className="text-xs h-7 px-2 font-bold text-amber-700 shrink-0"
            >
              🍞 Carboidrato Alto
            </Button>

            <Button
              size="sm"
              variant={macroPreset === 'high-fat' ? 'default' : 'outline'}
              onClick={() => setMacroPreset(macroPreset === 'high-fat' ? 'all' : 'high-fat')}
              className="text-xs h-7 px-2 font-bold text-emerald-700 shrink-0"
            >
              🧀 Gordura Alta
            </Button>

            <Button
              size="sm"
              variant={macroPreset === 'high-fiber' ? 'default' : 'outline'}
              onClick={() => setMacroPreset(macroPreset === 'high-fiber' ? 'all' : 'high-fiber')}
              className="text-xs h-7 px-2 font-bold text-teal-700 shrink-0"
            >
              🌾 Fibra Alta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet Table (Clean & Compact) */}
      <Card className="bg-warm-card border-warm-border rounded-xl overflow-hidden shadow-xs p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-warm-inner border-b border-warm-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-2 px-3 select-none text-[10px] uppercase font-bold text-warm-muted">
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
                  <TableCell colSpan={columns.length} className="py-6 text-center text-warm-muted font-semibold text-xs">
                    Nenhum alimento encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-warm-inner/60 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 px-3 text-xs">
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
        <div className="py-2 px-3 border-t border-warm-border bg-warm-inner/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-warm-muted font-medium text-[11px]">
            <span>
              <strong className="text-warm-charcoal">{filteredFoods.length}</strong> alimentos
            </span>
            <span>•</span>
            <span>
              Página <strong className="text-warm-charcoal">{table.getState().pagination.pageIndex + 1}</strong> de{' '}
              <strong className="text-warm-charcoal">{table.getPageCount() || 1}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-warm-muted font-medium text-[10px]">Por página:</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(val) => table.setPageSize(Number(val))}
              >
                <SelectTrigger className="h-7 w-20 bg-warm-card border-warm-border text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value={String(filteredFoods.length || 597)}>Todos</SelectItem>
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
                className="h-7 w-7"
                title="Primeira Página"
              >
                <ChevronsLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-7 w-7"
                title="Página Anterior"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7"
                title="Próxima Página"
              >
                <ChevronRight size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7"
                title="Última Página"
              >
                <ChevronsRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal Cadastro de Alimento Customizado Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-warm-card border-warm-border p-5 rounded-xl">
          <DialogHeader className="border-b border-warm-border pb-2.5 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="font-black text-base text-warm-charcoal">Novo Alimento Customizado</DialogTitle>
              <p className="text-[11px] text-warm-muted">Cadastre um produto comercial ou suplemento manipulado.</p>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateCustomFood} className="space-y-3 pt-1">
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
                  className="bg-warm-inner border-warm-border text-xs h-8"
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
                  className="bg-warm-inner border-warm-border text-xs font-bold h-8"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-warm-charcoal block mb-1">
                  Unidade
                </label>
                <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                  <SelectTrigger className="bg-warm-inner border-warm-border text-xs font-bold h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger className="bg-warm-inner border-warm-border text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  className="bg-warm-inner border-warm-border text-xs h-8"
                />
              </div>
            </div>

            {/* Row 3: MACRONUTRIENTS SIDE BY SIDE (3 COLUMNS) */}
            <div>
              <label className="text-xs font-bold text-warm-charcoal block mb-1">
                Macronutrientes da Porção (g)
              </label>
              <div className="grid grid-cols-3 gap-2.5 p-2.5 bg-warm-inner border border-warm-border rounded-lg">
                <div>
                  <label className="text-[10px] font-bold text-rose-700 block mb-1">Proteínas (g)</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ex: 24"
                    value={formData.proteinG}
                    onChange={(e) => setFormData({ ...formData, proteinG: e.target.value })}
                    className="bg-warm-card border-warm-border text-xs font-black text-center h-8"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-amber-700 block mb-1">Carboidratos (g)</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ex: 3"
                    value={formData.carbsG}
                    onChange={(e) => setFormData({ ...formData, carbsG: e.target.value })}
                    className="bg-warm-card border-warm-border text-xs font-black text-center h-8"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-700 block mb-1">Gorduras (g)</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ex: 1.5"
                    value={formData.fatsG}
                    onChange={(e) => setFormData({ ...formData, fatsG: e.target.value })}
                    className="bg-warm-card border-warm-border text-xs font-black text-center h-8"
                  />
                </div>
              </div>
            </div>

            {/* AUTOMATIC CALORIE CALCULATION CARD (NO INPUT) */}
            <div className="p-2.5 bg-warm-emerald/10 border border-warm-emerald/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame size={16} className="text-warm-emerald" />
                <div>
                  <span className="text-[10px] font-extrabold text-warm-charcoal block leading-none">
                    Calorias Calculadas Automaticamente
                  </span>
                  <span className="text-[9px] text-warm-muted font-medium">
                    Fatores de Atwater: (4 kcal/P) + (4 kcal/C) + (9 kcal/G)
                  </span>
                </div>
              </div>
              <div className="font-black text-sm text-warm-emerald">
                {calculatedKcal} <span className="text-xs">kcal</span>
              </div>
            </div>

            {/* Row 4: SEPARATE FIBER INPUT */}
            <div>
              <label className="text-xs font-semibold text-warm-muted block mb-1">Fibra Alimentar (opcional)</label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="Ex: 2"
                value={formData.fiberG}
                onChange={(e) => setFormData({ ...formData, fiberG: e.target.value })}
                className="bg-warm-inner border-warm-border text-xs font-bold h-8"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="sm"
                className="flex-1 text-xs h-8"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="flex-1 text-xs font-bold bg-warm-emerald text-white hover:bg-warm-emerald/90 h-8">
                Salvar Alimento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
