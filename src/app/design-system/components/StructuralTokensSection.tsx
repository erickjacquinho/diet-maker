"use client";

import { StructuralTokenSpec } from "./types";
import { MoveRight, Square, Sun } from "lucide-react";

interface StructuralTokensSectionProps {
  tokens: StructuralTokenSpec[];
}

export function StructuralTokensSection({ tokens }: StructuralTokensSectionProps) {
  const spacingTokens = tokens.filter((t) => t.type === "spacing");
  const radiusTokens = tokens.filter((t) => t.type === "radius");
  const shadowTokens = tokens.filter((t) => t.type === "shadow");

  return (
    <div className="space-y-8">
      {/* Spacing Scale */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
          <MoveRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Escala de Espaçamento e Margens (--ref-space-*)</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spacingTokens.map((token) => (
            <div key={token.id} className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/50">
              <div
                className="h-8 rounded bg-blue-600 dark:bg-blue-500"
                style={{ width: token.value === "0" ? "2px" : token.value }}
              />
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{token.name}</div>
                <div className="font-mono text-[11px] text-stone-500">{token.cssVariable}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
          <Square className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span>Raios de Curvatura de Bordas (--sys-radius-*)</span>
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {radiusTokens.map((token) => (
            <div key={token.id} className="flex flex-col items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 p-4 text-center dark:border-stone-800 dark:bg-stone-800/50">
              <div
                className="h-16 w-16 border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/50"
                style={{ borderRadius: token.value }}
              />
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{token.name}</span>
              <span className="font-mono text-[11px] text-stone-500">{token.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shadow & Elevation */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
          <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span>Sombras & Elevação Visual (--sys-shadow-*)</span>
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {shadowTokens.map((token) => (
            <div
              key={token.id}
              className="rounded-xl border border-stone-100 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
              style={{ boxShadow: token.value }}
            >
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100">{token.name}</div>
              <div className="mt-1 font-mono text-xs text-stone-500">{token.cssVariable}</div>
              <div className="mt-2 text-xs text-stone-400">Box Shadow Value: {token.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
