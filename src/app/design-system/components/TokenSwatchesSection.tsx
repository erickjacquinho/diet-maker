"use client";

import { colorTokens, typographyTokens, structuralTokens } from "./showcase-registry";
import { TokenColorSwatch } from "./TokenColorSwatch";
import { TypographySpecimen } from "./TypographySpecimen";
import { StructuralTokensSection } from "./StructuralTokensSection";
import { ViewMode } from "./types";
import { Palette, Type, Layers } from "lucide-react";

interface TokenSwatchesSectionProps {
  viewMode: ViewMode;
}

export function TokenSwatchesSection({ viewMode }: TokenSwatchesSectionProps) {
  const referenceColors = colorTokens.filter((c) => c.layer === "reference");
  const systemColors = colorTokens.filter((c) => c.layer === "system");
  const componentColors = colorTokens.filter((c) => c.layer === "component");

  return (
    <div className="space-y-12">
      {/* 1. Cores por Camadas */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-3 dark:border-stone-800">
          <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Tokens de Cores por Camada
            </h2>
            <p className="text-xs text-stone-500">
              Sistema de cores canônico com verificação de contraste relativo em tempo real (WCAG 2.2 AA / AAA).
            </p>
          </div>
        </div>

        {/* Camada Reference */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            1. Camada Reference (Fundação Primitiva)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {referenceColors.map((token) => (
              <TokenColorSwatch key={token.id} token={token} viewMode={viewMode} />
            ))}
          </div>
        </div>

        {/* Camada System */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            2. Camada System (Semântica Global)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {systemColors.map((token) => (
              <TokenColorSwatch key={token.id} token={token} viewMode={viewMode} />
            ))}
          </div>
        </div>

        {/* Camada Component */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            3. Camada Component (Específica do Componente)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {componentColors.map((token) => (
              <TokenColorSwatch key={token.id} token={token} viewMode={viewMode} />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Tipografia */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-3 dark:border-stone-800">
          <Type className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Escala & Estilos Tipográficos
            </h2>
            <p className="text-xs text-stone-500">
              Hierarquia visual baseada em Plus Jakarta Sans, com contratos de elementos HTML permitidos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {typographyTokens.map((token) => (
            <TypographySpecimen key={token.id} token={token} viewMode={viewMode} />
          ))}
        </div>
      </section>

      {/* 3. Espaçamento & Geometria */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-3 dark:border-stone-800">
          <Layers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Espaçamento, Geometria & Elevação
            </h2>
            <p className="text-xs text-stone-500">
              Dimensões de controles, raios de bordas e profundidade de sombras do NutriDiet.
            </p>
          </div>
        </div>

        <StructuralTokensSection tokens={structuralTokens} />
      </section>
    </div>
  );
}
