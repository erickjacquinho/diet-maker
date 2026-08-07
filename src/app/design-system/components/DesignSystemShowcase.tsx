"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar, ProgressBar, Surface } from "@/components/atoms";
import { DatePickerField, MetricBox, PatientBadgeHeader, TacoSearchInput } from "@/components/molecules";
import { MacroTrackerHeader, MetricBoxGroup } from "@/components/organisms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { tokenCssVariables, tokenNames, textStyle, textStyleIds } from "@/design-system";
import { cn } from "@/lib/utils";
import { Activity, Check, Layers3, Palette, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";

type ShowcaseTab = "overview" | "tokens" | "components" | "compositions";
type TokenKind = "color" | "dimension" | "shadow";

type RegistryComponent = {
  id: string;
  name: string;
  primaryCategory: string;
  currentLayer: string | null;
  targetLayer: string | null;
  lifecycle: string;
  specStatus: string;
};

type TokenSample = {
  id: string;
  label: string;
  variable: string;
  kind: TokenKind;
  previewClass: string;
};

const variableMaps = {
  reference: tokenCssVariables.reference as Record<string, string>,
  system: tokenCssVariables.system as Record<string, string>,
  component: tokenCssVariables.component as Record<string, string>,
};

const tokenVariable = (id: string) => {
  const layer = id.startsWith("ref.")
    ? "reference"
    : id.startsWith("sys.")
      ? "system"
      : "component";

  return variableMaps[layer][id] ?? `--${id.replaceAll(".", "-")}`;
};

const tokenSamples: Array<{ title: string; description: string; tokens: TokenSample[] }> = [
  {
    title: "Base e ação",
    description: "A base quente do produto e a cor reservada para ações, foco e seleção.",
    tokens: [
      { id: "ref.color.warm.15", label: "Canvas", variable: tokenVariable("ref.color.warm.15"), kind: "color", previewClass: "bg-canvas" },
      { id: "ref.color.warm.0", label: "Surface", variable: tokenVariable("ref.color.warm.0"), kind: "color", previewClass: "bg-surface" },
      { id: "ref.color.warm.950", label: "Text primary", variable: tokenVariable("ref.color.warm.950"), kind: "color", previewClass: "bg-text-primary" },
      { id: "ref.color.blue.700", label: "Primary", variable: tokenVariable("ref.color.blue.700"), kind: "color", previewClass: "bg-primary" },
      { id: "ref.color.blue.800", label: "Primary hover", variable: tokenVariable("ref.color.blue.800"), kind: "color", previewClass: "bg-primary-hover" },
      { id: "sys.color.border.subtle", label: "Border subtle", variable: tokenVariable("sys.color.border.subtle"), kind: "color", previewClass: "bg-border-subtle" },
    ],
  },
  {
    title: "Nutrição e feedback",
    description: "Semântica cromática usada para leitura rápida de macros, estados e consequências.",
    tokens: [
      { id: "ref.color.protein.500", label: "Proteína", variable: tokenVariable("ref.color.protein.500"), kind: "color", previewClass: "bg-macro-protein" },
      { id: "ref.color.carbohydrate.500", label: "Carboidrato", variable: tokenVariable("ref.color.carbohydrate.500"), kind: "color", previewClass: "bg-macro-carbohydrate" },
      { id: "ref.color.fat.500", label: "Gordura", variable: tokenVariable("ref.color.fat.500"), kind: "color", previewClass: "bg-macro-fat" },
      { id: "ref.color.success.500", label: "Success", variable: tokenVariable("ref.color.success.500"), kind: "color", previewClass: "bg-success" },
      { id: "ref.color.warning.500", label: "Warning", variable: tokenVariable("ref.color.warning.500"), kind: "color", previewClass: "bg-warning" },
      { id: "ref.color.error.500", label: "Error", variable: tokenVariable("ref.color.error.500"), kind: "color", previewClass: "bg-error" },
    ],
  },
  {
    title: "Geometria e comportamento",
    description: "Escalas de espaçamento, raio, movimento e elevação consumidas pela interface.",
    tokens: [
      { id: "ref.space.1", label: "Space 1", variable: tokenVariable("ref.space.1"), kind: "dimension", previewClass: "w-1" },
      { id: "ref.space.4", label: "Space 4", variable: tokenVariable("ref.space.4"), kind: "dimension", previewClass: "w-4" },
      { id: "ref.space.8", label: "Space 8", variable: tokenVariable("ref.space.8"), kind: "dimension", previewClass: "w-8" },
      { id: "sys.radius.compact", label: "Radius compact", variable: tokenVariable("sys.radius.compact"), kind: "dimension", previewClass: "rounded-compact" },
      { id: "sys.radius.control", label: "Radius control", variable: tokenVariable("sys.radius.control"), kind: "dimension", previewClass: "rounded-control" },
      { id: "sys.radius.surface", label: "Radius surface", variable: tokenVariable("sys.radius.surface"), kind: "dimension", previewClass: "rounded-surface" },
      { id: "sys.motion.fast", label: "Motion fast", variable: tokenVariable("sys.motion.fast"), kind: "dimension", previewClass: "bg-primary" },
      { id: "sys.shadow.floating", label: "Shadow floating", variable: tokenVariable("sys.shadow.floating"), kind: "shadow", previewClass: "shadow-floating" },
    ],
  },
];

const allTokenSamples = tokenSamples.flatMap((group) => group.tokens);

const typographySamples = [
  "page-title",
  "section-title",
  "card-title",
  "body",
  "body-secondary",
  "field-label",
  "metric-hero",
  "caption",
] as const;

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

function useResolvedTokenValues(samples: TokenSample[]) {
  const variables = useMemo(() => [...new Set(samples.map((sample) => sample.variable))], [samples]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(variables.map((variable) => [variable, styles.getPropertyValue(variable).trim()])));
  }, [variables]);

  return values;
}

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

function TokenTile({ token, resolvedValue }: { token: TokenSample; resolvedValue?: string }) {
  return (
    <Card className="flex min-h-28 flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className={textStyle("body-small-strong")}>{token.label}</span>
        {token.kind === "color" ? (
          <span aria-hidden="true" className={cn("size-7 rounded-control border border-border-subtle", token.previewClass)} />
        ) : (
          <span aria-hidden="true" className={cn("flex h-7 min-w-7 items-center justify-center rounded-control border border-border-subtle bg-surface-subtle px-1", token.previewClass)} />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <code className="truncate font-mono text-xs text-primary">{token.variable}</code>
        <span className={textStyle("legal")}>{resolvedValue || "valor canônico"}</span>
      </div>
    </Card>
  );
}

function TokenCatalog() {
  const resolvedValues = useResolvedTokenValues(allTokenSamples);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="tokens-heading">
      <SectionHeading
        eyebrow="Fundamentos"
        title="Tokens que dão forma ao produto"
        description="Amostra visual das variáveis canônicas. Os valores exibidos são lidos diretamente do sistema carregado pela aplicação."
        icon={<Palette className="size-4" aria-hidden="true" />}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Reference" value={String(tokenNames.reference.length)} detail="valores de base" />
        <StatCard label="System" value={String(tokenNames.system.length)} detail="intenções semânticas" />
        <StatCard label="Component" value={String(tokenNames.component.length)} detail="escopos específicos" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {tokenSamples.map((group) => (
          <Card key={group.title} className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1">
              <h3 className={textStyle("card-title")}>{group.title}</h3>
              <p className={textStyle("caption")}>{group.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {group.tokens.map((token) => <TokenTile key={token.id} token={token} resolvedValue={resolvedValues[token.variable]} />)}
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className={textStyle("card-title")}>Tipografia canônica</h3>
            <p className={textStyle("caption")}>Plus Jakarta Sans, pesos 400–700 e estilos de texto exportados pelo sistema.</p>
          </div>
          <Badge variant="secondary">{textStyleIds.length} estilos</Badge>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {typographySamples.map((styleId) => (
            <div key={styleId} className="flex min-h-24 flex-col justify-between gap-3 rounded-control border border-border-subtle bg-surface-subtle p-3">
              <code className="font-mono text-xs text-primary">{styleId}</code>
              <span className={textStyle(styleId)}>{styleId === "metric-hero" ? "1.850 kcal" : "NutriDiet"}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function ComponentSpecCard({ id, layer, category, children, description }: { id: string; layer: string; category: string; children: ReactNode; description: string }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="gap-2 border-b border-border-divider p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate">{id}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="secondary">{layer}</Badge>
        </div>
        <span className={textStyle("legal")}>{category}</span>
      </CardHeader>
      <CardContent className="flex min-h-40 items-center justify-center bg-surface-subtle p-6">
        {children}
      </CardContent>
    </Card>
  );
}

function ComponentCatalog({ query, componentRegistry }: { query: string; componentRegistry: readonly RegistryComponent[] }) {
  const [inputValue, setInputValue] = useState("Paciente em acompanhamento");
  const [foodQuery, setFoodQuery] = useState("Frango grelhado");
  const [date, setDate] = useState("2026-08-07");

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
      <SectionHeading
        eyebrow="Catálogo"
        title="Componentes reais do produto"
        description="Cada preview abaixo usa a implementação existente em src/components. O catálogo completo segue o registry canônico."
        icon={<Layers3 className="size-4" aria-hidden="true" />}
      />

      <div className="grid grid-cols-5 gap-4">
        {layerCounts.map(({ layer, count }) => <StatCard key={layer} label={layerLabels[layer]} value={String(count)} detail="entradas registradas" />)}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ComponentSpecCard id="ui-button" layer="UI" category="Ações" description="Primitivo de comando com receitas canônicas.">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="standard">Salvar dieta</Button>
            <Button variant="secondary" size="standard">Cancelar</Button>
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="ui-input" layer="UI" category="Campos" description="Entrada textual com foco e altura do sistema.">
          <div className="flex w-full max-w-form flex-col gap-2">
            <label htmlFor="design-system-input" className={textStyle("field-label")}>Nome do paciente</label>
            <Input id="design-system-input" value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="ui-badge" layer="UI" category="Feedback" description="Status compacto com tons semânticos.">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="blue">Em acompanhamento</Badge>
            <Badge variant="emerald">Meta atingida</Badge>
            <Badge variant="amber">Atenção</Badge>
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="atom-avatar" layer="Atoms" category="Dados e identidade" description="Identidade visual compacta para contexto de paciente.">
          <div className="flex items-center gap-3">
            <Avatar initials="AM" size="sm" variant="inner" />
            <Avatar initials="CS" size="md" variant="emerald" />
            <Avatar initials="DR" size="lg" variant="charcoal" />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="atom-progress-bar" layer="Atoms" category="Loading e progresso" description="Progresso visual com cor semântica do produto.">
          <div className="flex w-full max-w-form flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className={textStyle("body-small-strong")}>Adesão da semana</span>
              <span className={textStyle("metric-compact")}>82%</span>
            </div>
            <ProgressBar value={82} colorVariant="emerald" />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="atom-surface" layer="Atoms" category="Superfícies" description="Superfície de produto baseada na receita canônica.">
          <Surface variant="subtle" density="standard" className="flex w-full max-w-form flex-col gap-2">
            <span className={textStyle("card-title")}>Resumo do paciente</span>
            <span className={textStyle("body-secondary")}>Acompanhamento ativo e dados prontos para revisão.</span>
          </Surface>
        </ComponentSpecCard>

        <ComponentSpecCard id="molecule-metric-box" layer="Molecules" category="Nutrição" description="Métrica nutricional composta com tom de macro.">
          <div className="grid w-full grid-cols-3 gap-3">
            <MetricBox label="Proteína" value="135g" tone="protein" caption="30% VET" />
            <MetricBox label="Carboidrato" value="190g" tone="carbohydrate" caption="45% VET" />
            <MetricBox label="Gordura" value="50g" tone="fat" caption="25% VET" />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="molecule-taco-search-input" layer="Molecules" category="Campos + nutrição" description="Busca real para a base TACO.">
          <div className="w-full max-w-form">
            <TacoSearchInput value={foodQuery} onChange={(event) => setFoodQuery(event.target.value)} />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="molecule-date-picker-field" layer="Molecules" category="Campos + seleção" description="Campo de data real com calendário e popover.">
          <div className="w-full max-w-form">
            <DatePickerField id="design-system-date" label="Data da consulta" value={date} onValueChange={setDate} />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="molecule-patient-badge-header" layer="Molecules" category="Dados e navegação" description="Cabeçalho de paciente usado nas telas clínicas.">
          <div className="w-full">
            <PatientBadgeHeader initials="AM" name="Ana Paula Mendes" weightKg={68.4} goalDescription="Redução de gordura · acompanhamento ativo" showAdjustGoals={false} compact />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="organism-metric-box-group" layer="Organisms" category="Nutrição + estrutura" description="Grupo de métricas composto pela implementação do produto.">
          <div className="w-full">
          <MetricBoxGroup items={[
              { label: "Proteína", value: "135g", tone: "protein", caption: "30% VET" },
              { label: "Carboidrato", value: "190g", tone: "carbohydrate", caption: "45% VET" },
              { label: "Gordura", value: "50g", tone: "fat", caption: "25% VET" },
            ] as const} />
          </div>
        </ComponentSpecCard>

        <ComponentSpecCard id="organism-macro-tracker-header" layer="Organisms" category="Nutrição + dados" description="Contexto clínico completo com métricas de macro.">
          <div className="w-full">
            <MacroTrackerHeader
              patientInitials="AM"
              patientName="Ana Paula Mendes"
              patientWeightKg={68.4}
              patientGoalDescription="Redução de gordura · 1.850 kcal/dia"
              showPatientContext={false}
              metrics={[
                { label: "Proteína", currentValue: "135g", targetValue: "150g", percentage: 90, macroColor: "blue", statusBadgeText: "OK", statusBadgeVariant: "blue" },
                { label: "Carboidrato", currentValue: "190g", targetValue: "210g", percentage: 90, macroColor: "amber", statusBadgeText: "OK", statusBadgeVariant: "amber" },
                { label: "Gordura", currentValue: "50g", targetValue: "60g", percentage: 83, macroColor: "teal", statusBadgeText: "OK", statusBadgeVariant: "teal" },
                { label: "Calorias", currentValue: "1.720", targetValue: "1.850 kcal", percentage: 93, macroColor: "emerald", statusBadgeText: "Meta", statusBadgeVariant: "emerald" },
              ]}
            />
          </div>
        </ComponentSpecCard>
      </div>

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
                  <code className="truncate font-mono text-xs text-primary">{component.id}</code>
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

function CompositionCatalog() {
  return (
    <section className="flex flex-col gap-6" aria-labelledby="compositions-heading">
      <SectionHeading
        eyebrow="Composição"
        title="O sistema em contexto clínico"
        description="Composições pequenas, reais e reconhecíveis para mostrar como as camadas se encaixam no fluxo de nutrição."
        icon={<Activity className="size-4" aria-hidden="true" />}
      />

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className={textStyle("card-title")}>Resumo de metas</h3>
              <p className={textStyle("caption")}>Molecules + organisms + tokens nutricionais.</p>
            </div>
            <Badge variant="emerald">Ativo</Badge>
          </div>
          <MetricBoxGroup items={[
            { label: "Proteína", value: "135g", tone: "protein", caption: "30% VET" },
            { label: "Carboidrato", value: "190g", tone: "carbohydrate", caption: "45% VET" },
            { label: "Gordura", value: "50g", tone: "fat", caption: "25% VET" },
            { label: "Calorias", value: "1.850", tone: "default", caption: "VET diário" },
          ] as const} />
          <div className="flex items-center justify-between gap-4">
            <span className={textStyle("body-secondary")}>Adesão dos últimos 7 dias</span>
            <strong className={textStyle("validation-success")}>92%</strong>
          </div>
          <ProgressBar value={92} colorVariant="emerald" />
        </Card>

        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className={textStyle("card-title")}>Contexto do paciente</h3>
              <p className={textStyle("caption")}>Identidade, navegação e ação no mesmo bloco.</p>
            </div>
            <Badge variant="blue">Consulta</Badge>
          </div>
          <PatientBadgeHeader initials="CS" name="Carlos Silva" weightKg={82.5} goalDescription="Hipertrofia · plano normocalórico" />
          <div className="flex items-center justify-between gap-3 border-t border-border-divider pt-4">
            <span className={textStyle("body-secondary")}>Última atualização: hoje</span>
            <Button variant="primary" size="compact"><Check data-icon="inline-start" aria-hidden="true" />Abrir ficha</Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function DesignSystemShowcase({ componentRegistry, categoryCount }: { componentRegistry: readonly RegistryComponent[]; categoryCount: number }) {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("overview");
  const [query, setQuery] = useState("");

  const componentCount = componentRegistry.length;
  const totalTokenCount = tokenNames.reference.length + tokenNames.system.length + tokenNames.component.length;

  return (
    <main className="min-h-screen bg-canvas px-6 py-8 text-text-primary">
      <div className="mx-auto flex w-full max-w-container-page flex-col gap-8">
        <header className="grid grid-cols-2 items-end gap-8 border-b border-border-divider pb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-control bg-primary text-on-primary">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
              </span>
              <span className={textStyle("overline")}>NutriDiet / Design System</span>
            </div>
            <div className="flex flex-col gap-3">
              <h1 className={textStyle("page-title")}>A linguagem visual do produto, retratada na própria interface.</h1>
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
            <TokenCatalog />
            <ComponentCatalog query={query} componentRegistry={componentRegistry} />
            <CompositionCatalog />
          </div>
        )}
        {activeTab === "tokens" && <TokenCatalog />}
        {activeTab === "components" && <ComponentCatalog query={query} componentRegistry={componentRegistry} />}
        {activeTab === "compositions" && <CompositionCatalog />}

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
