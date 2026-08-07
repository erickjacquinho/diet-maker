"use client";

import { Eye, Code2 } from "lucide-react";
import { ViewMode } from "./types";

interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border border-stone-300 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900 shadow-sm">
      <button
        type="button"
        onClick={() => onModeChange("client-showcase")}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
          mode === "client-showcase"
            ? "bg-white text-blue-700 shadow dark:bg-stone-800 dark:text-blue-400"
            : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        }`}
      >
        <Eye className="h-4 w-4" />
        <span>Modo Showcase Cliente</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("dev-spec")}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
          mode === "dev-spec"
            ? "bg-white text-blue-700 shadow dark:bg-stone-800 dark:text-blue-400"
            : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        }`}
      >
        <Code2 className="h-4 w-4" />
        <span>Modo Dev Spec & Tokens</span>
      </button>
    </div>
  );
}
