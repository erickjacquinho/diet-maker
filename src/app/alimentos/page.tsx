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
import { CreateButton, EditIconButton, DeleteIconButton, IconButton } from '@/components/atoms';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { CustomFoodModal, type CustomFoodPayload } from '@/components/molecules/CustomFoodModal';

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

  useEffect(() => {
    setFoods(getAllFoods());
  }, []);

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteFood(id);
    setFoods(getAllFoods());
  };

  const handleOpenCreateModal = () => {
    setEditingFoodId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food: FoodItem) => {
    setEditingFoodId(food.id);
    setIsModalOpen(true);
  };

  const handleSaveCustomFood = (foodId: string | null, foodPayload: CustomFoodPayload) => {
    if (foodId) updateCustomFood(foodId, foodPayload);
    else addCustomFood(foodPayload);
    setFoods(getAllFoods());
    setIsModalOpen(false);
    setEditingFoodId(null);
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
            <Button
              type="button"
              onMouseDown={() => setActiveReorderId(food.id)}
              onMouseUp={() => setActiveReorderId(null)}
              onTouchStart={() => setActiveReorderId(food.id)}
              onTouchEnd={() => setActiveReorderId(null)}
              onClick={() => setActiveReorderId((prev) => (prev === food.id ? null : food.id))}
              aria-label={`Reordenar ${food.name}`}
              className={`p-1 rounded-control cursor-grab active:cursor-grabbing transition-opacity duration-fast text-text-muted hover:text-text-primary ${
                isActivated
                  ? 'opacity-full text-success bg-success/10 ring-1 ring-success/30'
                  : 'invisible group-hover/row:visible'
              }`}
              title="Reordenar alimento"
            >
              <GripVertical size={14} />
            </Button>
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
            <IconButton
              onClick={() => handleToggleFavorite(food.id)}
              className="h-6 w-6 p-0 hover:bg-surface-hover rounded-surface transition-colors"
              title={food.isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Star
                size={14}
                className={food.isFavorite ? 'fill-warning text-warning-soft0' : 'text-text-muted/50 hover:text-text-muted'}
              />
            </IconButton>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent text-style-legal text-text-primary"
          >
            <span>Alimento</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-success font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-success font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-text-muted opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold text-text-primary text-style-legal">{row.original.name}</span>,
      },
      {
        accessorKey: 'preparo',
        header: ({ column }) => (
          <Button
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent text-style-legal text-text-primary"
          >
            <span>Preparo</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-success font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-success font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-text-muted opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-style-legal font-bold border-border-subtle bg-surface-subtle text-text-primary px-2 py-0.5 rounded-control">
            {row.original.preparo}
          </Badge>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <Button
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent text-style-legal text-text-primary"
          >
            <span>Categoria</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-success font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-success font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-text-muted opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-text-muted font-semibold text-style-legal">{row.original.category}</span>,
      },
      {
        accessorKey: 'source',
        header: () => <span className="text-center block text-style-legal font-bold text-text-primary">Origem</span>,
        cell: ({ row }) => (
          <Badge
            variant={row.original.source === 'TACO' ? 'secondary' : 'default'}
            className={`text-style-chart-micro font-bold px-2 py-0.5 rounded-control tracking-overline ${
              row.original.source === 'TACO'
                ? 'bg-surface-subtle text-text-muted border border-border-subtle'
                : 'bg-success/10 text-success border border-success/20'
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
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-style-legal text-text-primary"
          >
            <span>Kcal</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-success font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-success font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 text-text-muted opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-text-primary text-style-legal">{row.original.kcal} <span className="text-style-legal text-text-muted font-bold">kcal</span></div>,
      },
      {
        accessorKey: 'proteinG',
        header: ({ column }) => (
          <Button
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-macro-protein text-style-legal"
          >
            <span>Proteína</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-macro-protein font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-macro-protein font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-macro-protein text-style-legal">{row.original.proteinG}g</div>,
      },
      {
        accessorKey: 'carbsG',
        header: ({ column }) => (
          <Button
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-macro-carbohydrate text-style-legal"
          >
            <span>Carbo</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-macro-carbohydrate font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-macro-carbohydrate font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-macro-carbohydrate text-style-legal">{row.original.carbsG}g</div>,
      },
      {
        accessorKey: 'fatsG',
        header: ({ column }) => (
          <Button
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-macro-fat text-style-legal"
          >
            <span>Gordura</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-macro-fat font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-macro-fat font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-macro-fat text-style-legal">{row.original.fatsG}g</div>,
      },
      {
        accessorKey: 'fiberG',
        header: ({ column }) => (
          <Button
            variant="quiet"
            size="compact"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-6 font-bold hover:bg-transparent ml-auto text-style-legal text-text-primary"
          >
            <span>Fibra</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} className="ml-1 text-success font-bold" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} className="ml-1 text-success font-bold" />
            ) : (
              <ArrowUpDown size={12} className="ml-1 opacity-subdued" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="text-right text-text-muted font-medium text-style-legal">{row.original.fiberG}g</div>,
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
    <div className="p-4 p-6 max-w-7xl mx-auto flex flex-col gap-4">
      {/* Header Bar */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-control bg-success/10 text-success">
            <BookOpen size={20} />
          </div>
          <h1 className="font-bold text-style-subsection-title text-text-primary tracking-tight">Tabela de Alimentos (TACO)</h1>
        </div>
        <p className="text-style-legal text-text-muted font-medium mt-1">
          Biblioteca oficial TACO e alimentos customizados para prescrição de dietas.
        </p>
      </div>

      {/* Filter Controls Card */}
      <Card className="p-4">
        <CardContent className="p-0 flex flex-col gap-3">
          {/* Row 1: Primary Tabs, Clear Button & Create Button */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Button
                type="button"
                size="compact"
                onClick={() => setActiveTab('all')}
                className={
                  activeTab === 'all'
                    ? 'bg-primary text-on-primary shadow-floating'
                    : 'bg-surface-subtle text-text-muted hover:text-text-primary hover:bg-surface-hover border border-border-subtle'
                }
              >
                Todos ({foods.length})
              </Button>
              <Button
                type="button"
                size="compact"
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-1.5 ${
                  activeTab === 'favorites'
                    ? 'bg-primary text-on-primary shadow-floating'
                    : 'bg-surface-subtle text-text-muted hover:text-text-primary hover:bg-surface-hover border border-border-subtle'
                }`}
              >
                <Star size={12} className="fill-warning text-warning" />
                <span>Favoritos ⭐ ({foods.filter((f) => f.isFavorite).length})</span>
              </Button>
              <Button
                type="button"
                size="compact"
                onClick={() => setActiveTab('custom')}
                className={
                  activeTab === 'custom'
                    ? 'bg-primary text-on-primary shadow-floating'
                    : 'bg-surface-subtle text-text-muted hover:text-text-primary hover:bg-surface-hover border border-border-subtle'
                }
              >
                Customizados ({foods.filter((f) => f.source === 'CUSTOM').length})
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isFiltered && (
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  onClick={resetFilters}
                  className="text-error hover:text-error hover:bg-error-soft flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Limpar filtros</span>
                </Button>
              )}

              <CreateButton
                onClick={handleOpenCreateModal}
                icon={<Plus size={14} />}
              >
                Cadastrar alimento
              </CreateButton>
            </div>
          </div>

          {/* Row 2: Search Input & Select Dropdowns */}
          <div className="grid grid-cols-1 grid-cols-12 gap-2.5">
            {/* Search */}
            <div className="col-span-6 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10 pointer-events-none" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisa rápida (ex: pao, feijao, frango, grelhado)..."
                className="pl-8 pr-3 bg-surface-subtle border-border-subtle text-style-legal h-9 rounded-control text-text-primary placeholder:text-text-muted focus-visible:ring-success"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="col-span-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-surface-subtle border-border-subtle text-style-legal h-9 rounded-control text-text-primary font-semibold">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border-subtle text-text-primary text-style-legal shadow-floating">
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
            <div className="col-span-3">
              <Select value={preparoFilter} onValueChange={setPreparoFilter}>
                <SelectTrigger className="bg-surface-subtle border-border-subtle text-style-legal h-9 rounded-control text-text-primary font-semibold">
                  <SelectValue placeholder="Preparo" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border-subtle text-text-primary text-style-legal shadow-floating">
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
          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
            <span className="text-style-legal font-bold text-text-muted tracking-overline shrink-0 flex items-center gap-1">
              <Filter size={11} className="text-success" />
              <span>Macros:</span>
            </span>

            <Button
              type="button"
              size="compact"
              onClick={() => setMacroPreset(macroPreset === 'high-protein' ? 'all' : 'high-protein')}
              className={`shrink-0 ${
                macroPreset === 'high-protein'
                  ? 'bg-macro-protein text-on-primary shadow-floating'
                  : 'bg-surface-subtle text-macro-protein border border-macro-protein-border hover:bg-macro-protein-soft'
              }`}
            >
              🥩 Proteína alta
            </Button>

            <Button
              type="button"
              size="compact"
              onClick={() => setMacroPreset(macroPreset === 'high-carb' ? 'all' : 'high-carb')}
              className={`shrink-0 ${
                macroPreset === 'high-carb'
                  ? 'bg-macro-carbohydrate text-on-primary shadow-floating'
                  : 'bg-surface-subtle text-macro-carbohydrate border border-macro-carbohydrate-border hover:bg-macro-carbohydrate-soft'
              }`}
            >
              🍞 Carboidrato alto
            </Button>

            <Button
              type="button"
              size="compact"
              onClick={() => setMacroPreset(macroPreset === 'high-fat' ? 'all' : 'high-fat')}
              className={`shrink-0 ${
                macroPreset === 'high-fat'
                  ? 'bg-macro-fat text-on-primary shadow-floating'
                  : 'bg-surface-subtle text-macro-fat border border-macro-fat-border hover:bg-macro-fat-soft'
              }`}
            >
              🧀 Gordura alta
            </Button>

            <Button
              type="button"
              size="compact"
              onClick={() => setMacroPreset(macroPreset === 'high-fiber' ? 'all' : 'high-fiber')}
              className={`shrink-0 ${
                macroPreset === 'high-fiber'
                  ? 'bg-info text-on-info shadow-floating'
                  : 'bg-surface-subtle text-info border border-info-border hover:bg-info-soft'
              }`}
            >
              🌾 Fibra alta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-subtle/80 border-b border-border-subtle">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-border-subtle hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-2.5 px-3 select-none text-style-legal font-bold text-text-muted tracking-overline">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-border-subtle text-text-primary font-medium">
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-8 text-center text-text-muted font-semibold text-style-legal italic">
                    Nenhum alimento encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="group/row hover:bg-surface-hover transition-colors border-b border-border-subtle/60">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 px-3 text-style-legal">
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
        <div className="py-3 px-4 border-t border-border-subtle bg-surface-subtle/50 flex flex-col flex-row items-center justify-between gap-3 text-style-legal">
          <div className="flex items-center gap-2 text-text-muted font-medium text-style-legal">
            <span>
              <strong className="text-text-primary font-bold">{filteredFoods.length}</strong> alimentos
            </span>
            <span>•</span>
            <span>
              Página <strong className="text-text-primary font-bold">{table.getState().pagination.pageIndex + 1}</strong> de{' '}
              <strong className="text-text-primary font-bold">{table.getPageCount() || 1}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted font-bold text-style-legal">Por página:</span>
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
                <SelectTrigger className="h-7 w-20 bg-surface border-border-subtle text-style-legal font-bold text-text-primary rounded-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border-subtle text-text-primary text-style-legal">
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>

            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <IconButton
                variant="secondary"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-7 w-7 bg-surface border-border-subtle text-text-primary hover:bg-surface-hover rounded-surface"
                title="Primeira Página"
              >
                <ChevronsLeft size={14} />
              </IconButton>
              <IconButton
                variant="secondary"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-7 w-7 bg-surface border-border-subtle text-text-primary hover:bg-surface-hover rounded-surface"
                title="Página Anterior"
              >
                <ChevronLeft size={14} />
              </IconButton>
              <IconButton
                variant="secondary"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7 bg-surface border-border-subtle text-text-primary hover:bg-surface-hover rounded-surface"
                title="Próxima Página"
              >
                <ChevronRight size={14} />
              </IconButton>
              <IconButton
                variant="secondary"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7 bg-surface border-border-subtle text-text-primary hover:bg-surface-hover rounded-surface"
                title="Última Página"
              >
                <ChevronsRight size={14} />
              </IconButton>
            </div>
          </div>
        </div>
      </Card>

      <CustomFoodModal
        open={isModalOpen}
        food={foods.find((food) => food.id === editingFoodId) ?? null}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingFoodId(null);
        }}
        onSave={handleSaveCustomFood}
        onDelete={handleDeleteCustomFood}
      />
    </div>
  );
}

