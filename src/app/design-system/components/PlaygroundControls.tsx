"use client";

import { ComponentPropertyControl } from "./types";
import { SlidersHorizontal } from "lucide-react";

interface PlaygroundControlsProps {
  controls: ComponentPropertyControl[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export function PlaygroundControls({ controls, values, onChange }: PlaygroundControlsProps) {
  if (controls.length === 0) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
        <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span>Controles do Componente (Knobs / Props)</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {controls.map((control) => (
          <div key={control.name} className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {control.label}
            </label>

            {control.type === "select" && control.options && (
              <select
                value={values[control.name] ?? control.defaultValue}
                onChange={(e) => onChange(control.name, e.target.value)}
                className="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-800 shadow-sm focus:border-blue-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                {control.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {control.type === "boolean" && (
              <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(values[control.name] ?? control.defaultValue)}
                  onChange={(e) => onChange(control.name, e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-stone-600 dark:text-stone-400">Ativado</span>
              </label>
            )}

            {control.type === "text" && (
              <input
                type="text"
                value={values[control.name] ?? control.defaultValue}
                onChange={(e) => onChange(control.name, e.target.value)}
                className="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-800 shadow-sm focus:border-blue-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
