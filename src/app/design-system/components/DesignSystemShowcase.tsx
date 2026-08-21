"use client";

import { useState } from "react";
import { Surface } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tokenNames, textStyle } from "@/design-system";
import { cn } from "@/lib/utils";
import { Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { TokenCatalogSection } from "./sections/TokenCatalogSection";
import { ComponentCatalogSection, type RegistryComponent } from "./sections/ComponentCatalogSection";
import { CompositionGallerySection } from "./sections/CompositionGallerySection";

type ShowcaseTab = "overview" | "tokens" | "components" | "compositions";

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Surface variant="default" density="compact" className="flex min-h-24 flex-col justify-between gap-2">
      <span className={textStyle("caption")}>{label}</span>
      <strong className={textStyle("metric-large")}>{value}</strong>
      <span className={textStyle("legal")}>{detail}</span>
    </Surface>
  );
}

function DesignSystemShowcase({ componentRegistry, categoryCount }: { componentRegistry: readonly RegistryComponent[]; categoryCount: number }) {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("overview");
  const [query, setQuery] = useState("");

  const componentCount = componentRegistry.length;
  const totalTokenCount = tokenNames.reference.length + tokenNames.system.length + tokenNames.component.length;

  return (
    <main className="min-h-screen bg-canvas px-8 py-6 text-text-primary">
      <div className="mx-auto flex w-full max-w-container-workflow flex-col gap-8">
        <header className="grid grid-cols-2 items-end gap-8 border-b border-border-divider pb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-control bg-primary text-on-primary">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
              </span>
              <span className={textStyle("overline")}>NutriDiet / Design System</span>
            </div>
            <div className="flex flex-col gap-3">
              <h1 className={textStyle("page-title")}>Design System canônico</h1>
              <p className={cn(textStyle("body-large"), "max-w-reading")}>Tokens canônicos, componentes reais e composições clínicas em uma página de referência objetiva para designers e desenvolvedores.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="blue">Canônico</Badge>
              <span className={textStyle("caption")}>Claro · Desktop ≥ 1024px · WCAG 2.2 AA</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Tokens" value={String(totalTokenCount)} detail="3 camadas ativas" />
            <StatCard label="Componentes" value={String(componentCount)} detail="registry canônico" />
            <StatCard label="Categorias" value={String(categoryCount)} detail="contratos visuais" />
            <StatCard label="Estados" value="10" detail="matriz obrigatória" />
          </div>
        </header>

        <nav className="flex items-center justify-between gap-4" aria-label="Seções do design system">
          <div className="flex items-center gap-2" role="tablist" aria-label="Conteúdo do design system">
            {([
              ["overview", "Visão geral"],
              ["tokens", "Tokens"],
              ["components", "Componentes"],
              ["compositions", "Composições"],
            ] as const).map(([tab, label]) => (
              <Button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                variant={activeTab === tab ? "secondary" : "quiet"}
                size="compact"
                onClick={() => setActiveTab(tab)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="relative flex w-full max-w-form items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-text-muted" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no catálogo de componentes" className="pl-9" aria-label="Buscar no catálogo de componentes" />
          </div>
        </nav>

        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            <TokenCatalogSection />
            <ComponentCatalogSection query={query} componentRegistry={componentRegistry} />
            <CompositionGallerySection />
          </div>
        )}
        {activeTab === "tokens" && <TokenCatalogSection />}
        {activeTab === "components" && <ComponentCatalogSection query={query} componentRegistry={componentRegistry} />}
        {activeTab === "compositions" && <CompositionGallerySection />}

        <footer className="flex items-center justify-between gap-4 border-t border-border-divider pt-4">
          <span className={textStyle("legal")}>Fonte visual: src/design-system · Fonte de componentes: registry.json</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-success" aria-hidden="true" />
            <span className={textStyle("legal")}>Tokens sem valores locais</span>
          </span>
        </footer>
      </div>
    </main>
  );
}

export { DesignSystemShowcase };
