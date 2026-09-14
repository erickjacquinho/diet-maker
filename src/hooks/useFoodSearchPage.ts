import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DataTableSortState } from '@/components/molecules/DataTable';
import { listTacoFoodItems, toggleFavoriteFood, scoreFoodItem, toFoodItem, type FoodItem } from '@/lib/library-ui-adapter';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { CustomFoodPayload } from '@/components/molecules/CustomFoodModal';

function customFoodInputFromPayload(payload: CustomFoodPayload) {
  const match = payload.name.match(/^(.*?)(?:\s*\((\d+(?:\.\d+)?)(g|ml|un|unit)\))?$/i);
  const unit = (match?.[3]?.toLowerCase() === 'un' ? 'unit' : match?.[3]?.toLowerCase() || 'g') as 'g' | 'ml' | 'unit';
  const foodState = /cozid/i.test(payload.preparo) ? 'COOKED' : /cru|innatura/i.test(payload.preparo) ? 'RAW' : /assad|grelhad|frit/i.test(payload.preparo) ? 'PREPARED' : 'AS_SOLD';
  return {
    name: match?.[1]?.trim() || payload.name.trim(), description: '', brand: undefined, measurementBasis: unit === 'ml' ? 'PER_100ML' as const : unit === 'unit' ? 'PER_UNIT' as const : 'PER_100G' as const,
    foodState: foodState as 'RAW' | 'COOKED' | 'PREPARED' | 'AS_SOLD', servingReference: match?.[2] ? { quantity: match[2], unit } : undefined,
    referenceNutrients: { protein: String(payload.proteinG), carbs: String(payload.carbsG), fat: String(payload.fatsG), fiber: String(payload.fiberG) },
  };
}

export function useFoodSearchPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'custom'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [preparoFilter, setPreparoFilter] = useState('all');
  const [macroPreset, setMacroPreset] = useState<
    'all' | 'high-protein' | 'high-carb' | 'high-fat' | 'high-fiber'
  >('all');

  const [sorting, setSorting] = useState<DataTableSortState | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [pendingDeleteCustomFoodId, setPendingDeleteCustomFoodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshFoods = useCallback(async () => {
    setIsLoading(true);
    try {
      const application = await getBrowserLibraryApplication();
      const customFoods = await application.listCustomFoods();
      setFoods([...listTacoFoodItems(), ...customFoods.map(toFoodItem)]);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'A biblioteca de alimentos não pôde ser carregada.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFoods();
  }, [refreshFoods]);

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavoriteFood(id);
    void refreshFoods();
  }, [refreshFoods]);

  const handleOpenCreateModal = useCallback(() => {
    setEditingFoodId(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((food: FoodItem) => {
    setEditingFoodId(food.id);
    setIsModalOpen(true);
  }, []);

  const handleSaveCustomFood = useCallback(async (foodId: string | null, foodPayload: CustomFoodPayload) => {
    try {
      const application = await getBrowserLibraryApplication();
      const input = customFoodInputFromPayload(foodPayload);
      if (foodId) {
        const current = foods.find((food) => food.id === foodId);
        await application.updateCustomFood(foodId, current?.libraryVersion ?? 1, input);
      } else {
        await application.createCustomFood(input);
      }
      await refreshFoods();
      setIsModalOpen(false);
      setEditingFoodId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'O alimento não pôde ser salvo.');
    }
  }, [foods, refreshFoods]);

  const handleDeleteCustomFood = useCallback((id: string) => {
    setPendingDeleteCustomFoodId(id);
  }, []);

  const handleCancelDeleteCustomFood = useCallback(() => {
    setPendingDeleteCustomFoodId(null);
  }, []);

  const handleConfirmDeleteCustomFood = useCallback(async () => {
    if (pendingDeleteCustomFoodId === null) return;
    try {
      const current = foods.find((food) => food.id === pendingDeleteCustomFoodId);
      const application = await getBrowserLibraryApplication();
      await application.deleteCustomFood(pendingDeleteCustomFoodId, current?.libraryVersion ?? 1);
      await refreshFoods();
      setIsModalOpen(false);
      setEditingFoodId(null);
      setPendingDeleteCustomFoodId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'O alimento não pôde ser excluído.');
    }
  }, [foods, pendingDeleteCustomFoodId, refreshFoods]);

  const handleDeleteCustomFoodDialogChange = useCallback((open: boolean) => {
    if (!open) setPendingDeleteCustomFoodId(null);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPreparoFilter('all');
    setMacroPreset('all');
  }, []);

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

  const filteredFoods = useMemo(() => {
    const filtered = foods.filter((food) => {
      if (activeTab === 'favorites' && !food.isFavorite) return false;
      if (activeTab === 'custom' && !food.isCustom) return false;

      if (categoryFilter !== 'all' && food.category !== categoryFilter) return false;
      if (preparoFilter !== 'all' && food.preparo !== preparoFilter) return false;

      if (macroPreset === 'high-protein' && food.proteinG < 15) return false;
      if (macroPreset === 'high-carb' && food.carbsG < 30) return false;
      if (macroPreset === 'high-fat' && (food.fatsG || 0) < 15) return false;
      if (macroPreset === 'high-fiber' && (food.fiberG || 0) < 3) return false;

      if (searchTerm.trim()) {
        return scoreFoodItem(food, searchTerm) > 0;
      }

      return true;
    });

    if (searchTerm.trim() && !sorting) {
      return [...filtered].sort((a, b) => scoreFoodItem(b, searchTerm) - scoreFoodItem(a, searchTerm));
    }

    return filtered;
  }, [foods, activeTab, categoryFilter, preparoFilter, macroPreset, searchTerm, sorting]);

  useEffect(() => {
    setPageIndex(0);
  }, [activeTab, categoryFilter, preparoFilter, macroPreset, searchTerm, sorting]);

  useEffect(() => {
    setPageIndex((currentPage) => Math.min(currentPage, Math.max(0, Math.ceil(filteredFoods.length / 15) - 1)));
  }, [filteredFoods.length]);

  const editingFood = useMemo(() => {
    return foods.find((f) => f.id === editingFoodId) || null;
  }, [foods, editingFoodId]);

  return {
    foods,
    filteredFoods,
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
    sorting,
    setSorting,
    pageIndex,
    setPageIndex,
    isModalOpen,
    setIsModalOpen,
    editingFoodId,
    editingFood,
    handleToggleFavorite,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveCustomFood,
    handleDeleteCustomFood,
    isDeleteCustomFoodConfirmationOpen: pendingDeleteCustomFoodId !== null,
    handleCancelDeleteCustomFood,
    handleConfirmDeleteCustomFood,
    handleDeleteCustomFoodDialogChange,
    resetFilters,
    isLoading,
    errorMessage,
  };
}
