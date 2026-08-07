"use client";

import { Search, Filter, X } from "lucide-react";

interface ShowcaseSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function ShowcaseSearch({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
}: ShowcaseSearchProps) {
  const tags = ["Botões & Ações", "Controles de Entrada", "Macronutrientes", "Métricas", "Pacientes", "Status"];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar componentes ou tokens por nome (ex: Button, MetricBox, Protein)..."
          className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-9 py-2 text-sm text-stone-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:focus:border-blue-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <Filter className="h-4 w-4 text-stone-400 shrink-0" />
        {tags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(isSelected ? null : tag)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
