'use client';

import React from 'react';
import { useFoodSearchPage } from '@/hooks/useFoodSearchPage';
import { FoodFilterHeader } from '@/components/organisms/foods/FoodFilterHeader';
import { FoodTableSection } from '@/components/organisms/foods/FoodTableSection';
import { CustomFoodModal } from '@/components/molecules/CustomFoodModal';

export default function FoodsPage() {
  const {
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
    editingFood,
    handleToggleFavorite,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveCustomFood,
    handleDeleteCustomFood,
    resetFilters,
  } = useFoodSearchPage();

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
      <FoodFilterHeader
        totalCount={foods.length}
        filteredCount={filteredFoods.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        preparoFilter={preparoFilter}
        setPreparoFilter={setPreparoFilter}
        macroPreset={macroPreset}
        setMacroPreset={setMacroPreset}
        categoriesList={categoriesList}
        preparosList={preparosList}
        resetFilters={resetFilters}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <FoodTableSection
        data={filteredFoods}
        sorting={sorting}
        setSorting={setSorting}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        onToggleFavorite={handleToggleFavorite}
        onEditCustomFood={handleOpenEditModal}
      />

      <CustomFoodModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        food={editingFood}
        onSave={handleSaveCustomFood}
        onDelete={(foodId) => handleDeleteCustomFood(foodId)}
      />
    </div>
  );
}
