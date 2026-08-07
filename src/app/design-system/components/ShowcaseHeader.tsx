"use client";

import { Sparkles, Layers, Box, Component, CheckCircle2 } from "lucide-react";
import { ViewModeToggle } from "./ViewModeToggle";
import { ViewMode } from "./types";

interface ShowcaseHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ShowcaseHeader({ viewMode, onViewModeChange }: ShowcaseHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 p-8 text-stone-100 shadow-2xl">
      {/* Subtle mineral background accent gradient */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span>NutriDiet Living Visual System v2.0</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
            Galeria da Linha Visual & Componentes
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-stone-400">
            Apresentação interativa dos tokens de design, hierarquia atômica e especificações visuais do NutriDiet. Projetado com estética mineral refinada e acessibilidade total WCAG 2.2 AA.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <ViewModeToggle mode={viewMode} onViewModeChange={onViewModeChange} />

          <div className="flex items-center gap-4 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-400" />
              <strong className="text-stone-200">3</strong> Camadas de Tokens
            </span>
            <span className="flex items-center gap-1.5">
              <Box className="h-4 w-4 text-emerald-400" />
              <strong className="text-stone-200">30+</strong> Componentes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <strong className="text-stone-200">WCAG AA</strong> Conformidade
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
