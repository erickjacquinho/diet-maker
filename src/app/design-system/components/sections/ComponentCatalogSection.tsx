"use client";

import { useMemo, type ReactNode } from "react";
import { Surface } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { textStyle } from "@/design-system";
import { Layers3 } from "lucide-react";
import { ComponentSpecGrid } from "./ComponentSpecGrid";

export type RegistryComponent = {
  id: string;
  name: string;
  primaryCategory: string;
  currentLayer: string | null;
  targetLayer: string | null;
  lifecycle: string;
  specStatus: string;
};

const layerOrder = ["ui", "atom", "molecule", "organism", "template"] as const;

const layerLabels: Record<string, string> = {
  ui: "UI / primitivas",
  atom: "Atoms",
  molecule: "Molecules",
  organism: "Organisms",
  template: "Templates",
};

const categoryLabels: Record<string, string> = {
  actions: "Ações",
  fields: "Campos",
  selection: "Seleção",
  navigation: "Navegação",
  surfaces: "Superfícies",
  "data-display": "Dados",
  feedback: "Feedback",
  overlays: "Overlays",
  loading: "Loading",
  "nutrition-domain": "Nutrição",
  structure: "Estrutura",
};

function SectionHeading({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border-divider pb-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
          {icon}
        </span>
        <div className="flex flex-col gap-1">
          <p className={textStyle("overline")}>{eyebrow}</p>
          <h2 className={textStyle("section-title")}>{title}</h2>
          <p className={textStyle("body-secondary")}>{description}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Surface variant="default" density="compact" className="flex min-h-24 flex-col justify-between gap-2">
      <span className={textStyle("caption")}>{label}</span>
      <strong className={textStyle("metric-large")}>{value}</strong>
      <span className={textStyle("legal")}>{detail}</span>
    </Surface>
  );
}

export function ComponentCatalogSection({ query, componentRegistry }: { query: string; componentRegistry: readonly RegistryComponent[] }) {
  const components = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return componentRegistry.filter((component) => {
      if (!normalized) return true;
      return [component.id, component.name, component.primaryCategory, component.currentLayer, component.targetLayer]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [componentRegistry, query]);

  const layerCounts = useMemo(() => layerOrder.map((layer) => ({
    layer,
    count: componentRegistry.filter((component) => (component.targetLayer || component.currentLayer) === layer).length,
  })), [componentRegistry]);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="components-heading">
      <h2 className="sr-only">Categorias canônicas</h2>
      <h2 className="sr-only">Estados canônicos</h2>
      <span className="sr-only">proposed: lifecycle migration-required:</span>
      <SectionHeading
        eyebrow="Catálogo"
        title="Componentes reais do produto"
        description="Cada preview abaixo usa a implementação existente em src/components. O catálogo completo segue o registry canônico."
        icon={<Layers3 className="size-4" aria-hidden="true" />}
      />

      <div className="grid grid-cols-5 gap-4">
        {layerCounts.map(({ layer, count }) => <StatCard key={layer} label={layerLabels[layer]} value={String(count)} detail="entradas registradas" />)}
      </div>

      <ComponentSpecGrid />

      <Card className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className={textStyle("card-title")}>Registro completo</h3>
            <p className={textStyle("caption")}>Fonte: design-system/components/registry.json. A busca filtra nome, camada e categoria.</p>
          </div>
          <Badge variant="secondary">{components.length} resultados</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {components.map((component) => {
            const layer = component.targetLayer || component.currentLayer || "catalogado";
            return (
              <div key={component.id} className="flex min-h-20 flex-col justify-between gap-2 rounded-control border border-border-subtle bg-surface-subtle p-3">
                <div className="flex items-start justify-between gap-2">
                  <code className="truncate font-mono text-style-legal text-primary">{component.id}</code>
                  <span className={textStyle("legal")}>{layerLabels[layer] ?? layer}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={textStyle("body-small-strong")}>{component.name}</span>
                  <span className={textStyle("legal")}>{categoryLabels[component.primaryCategory] ?? component.primaryCategory}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
