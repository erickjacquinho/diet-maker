'use client';

import { useState } from 'react';
import { DataTable, type DataTableSortState } from '@/components/molecules/DataTable';
import type { FoodItem } from '@/lib/tacoStore';
import { useFoodTableColumns } from './useFoodTableColumns';

export interface FoodTableSectionProps {
  data: FoodItem[];
  sorting?: DataTableSortState | null;
  setSorting?: (sorting: DataTableSortState | null) => void;
  pageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
  onToggleFavorite: (id: string) => void;
  onEditCustomFood: (food: FoodItem) => void;
}

export function FoodTableSection({
  data,
  sorting: controlledSorting,
  setSorting,
  pageIndex: controlledPageIndex,
  onPageChange,
  onToggleFavorite,
  onEditCustomFood,
}: FoodTableSectionProps) {
  const [internalSorting, setInternalSorting] = useState<DataTableSortState | null>(null);
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const columns = useFoodTableColumns({ onToggleFavorite, onEditCustomFood });
  const sorting = controlledSorting === undefined ? internalSorting : controlledSorting;
  const updateSorting = setSorting ?? setInternalSorting;
  const pageIndex = controlledPageIndex ?? internalPageIndex;
  const updatePageIndex = onPageChange ?? setInternalPageIndex;

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(food) => food.id}
      caption="Tabela de alimentos"
      ariaLabel="Tabela de alimentos"
      emptyMessage="Nenhum alimento encontrado com os filtros atuais."
      sort={{ state: sorting, onChange: updateSorting }}
      pagination={{ pageIndex, pageSize: 15, onPageChange: updatePageIndex }}
      className="border border-border-subtle rounded-control overflow-hidden bg-surface shadow-none"
    />
  );
}
