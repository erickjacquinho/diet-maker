import { useState, useEffect, useMemo, useCallback } from 'react';
import { SortingState } from '@tanstack/react-table';
import {
  getAllFoods,
  toggleFavoriteFood,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
  FoodItem,
} from '@/lib/tacoStore';
import { CustomFoodPayload } from '@/components/molecules/CustomFoodModal';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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

  const [sorting, setSorting] = useState<SortingState>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  useEffect(() => {
    setFoods(getAllFoods());
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavoriteFood(id);
    setFoods(getAllFoods());
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setEditingFoodId(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((food: FoodItem) => {
    setEditingFoodId(food.id);
    setIsModalOpen(true);
  }, []);

  const handleSaveCustomFood = useCallback((foodId: string | null, foodPayload: CustomFoodPayload) => {
    if (foodId) updateCustomFood(foodId, foodPayload);
    else addCustomFood(foodPayload);
    setFoods(getAllFoods());
    setIsModalOpen(false);
    setEditingFoodId(null);
  }, []);

  const handleDeleteCustomFood = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja excluir este alimento customizado?')) {
      deleteCustomFood(id);
      setFoods(getAllFoods());
      setIsModalOpen(false);
      setEditingFoodId(null);
    }
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
    return foods.filter((food) => {
      if (activeTab === 'favorites' && !food.isFavorite) return false;
      if (activeTab === 'custom' && !food.isCustom) return false;

      if (categoryFilter !== 'all' && food.category !== categoryFilter) return false;
      if (preparoFilter !== 'all' && food.preparo !== preparoFilter) return false;

      if (macroPreset === 'high-protein' && food.proteinG < 15) return false;
      if (macroPreset === 'high-carb' && food.carbsG < 30) return false;
      if (macroPreset === 'high-fat' && (food.fatsG || 0) < 15) return false;
      if (macroPreset === 'high-fiber' && (food.fiberG || 0) < 3) return false;

      if (searchTerm.trim()) {
        const query = normalizeText(searchTerm.trim());
        const nameNorm = normalizeText(food.name);
        const catNorm = normalizeText(food.category || '');
        return nameNorm.includes(query) || catNorm.includes(query);
      }

      return true;
    });
  }, [foods, activeTab, categoryFilter, preparoFilter, macroPreset, searchTerm]);

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
    isModalOpen,
    setIsModalOpen,
    editingFoodId,
    editingFood,
    handleToggleFavorite,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveCustomFood,
    handleDeleteCustomFood,
    resetFilters,
  };
}
