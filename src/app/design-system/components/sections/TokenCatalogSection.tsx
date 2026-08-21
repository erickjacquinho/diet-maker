"use client";

import { useEffect, useMemo, useState } from "react";
import { Surface } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { tokenCssVariables, tokenNames, textStyle, textStyleIds } from "@/design-system";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

type TokenKind = "color" | "dimension" | "shadow";

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
  const layer = id.startsWith("ref.") ? "reference" : id.startsWith("sys.") ? "system" : "component";
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
const typographySamples = ["page-title", "section-title", "card-title", "body", "body-secondary", "field-label", "metric-hero", "caption"] as const;

function useResolvedTokenValues(samples: TokenSample[]) {
  const variables = useMemo(() => [...new Set(samples.map((sample) => sample.variable))], [samples]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(variables.map((variable) => [variable, styles.getPropertyValue(variable).trim()])));
  }, [variables]);

  return values;
}

function SectionHeading({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border-divider pb-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">{icon}</span>
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
        <code className="truncate font-mono text-style-legal text-primary">{token.variable}</code>
        <span className={textStyle("legal")}>{resolvedValue || "valor canônico"}</span>
      </div>
    </Card>
  );
}

export function TokenCatalogSection() {
  const resolvedValues = useResolvedTokenValues(allTokenSamples);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="tokens-heading">
      <h2 className="sr-only">Camadas de tokens</h2>
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
        <h2 className="sr-only">Text styles</h2>
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
              <code className="font-mono text-style-legal text-primary">{styleId}</code>
              <span className={textStyle(styleId)}>{styleId === "metric-hero" ? "1.850 kcal" : "NutriDiet"}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
