export const textStyleIds = [
  "page-title", "page-subtitle", "section-title", "subsection-title", "card-title", "dialog-title", "empty-title",
  "body-large", "body", "body-strong", "body-secondary", "body-small", "body-small-strong", "body-quote",
  "caption", "caption-strong", "helper", "legal", "field-label", "field-value", "field-placeholder",
  "validation-error", "validation-success", "button-label", "button-label-compact", "nav-item", "tab-label",
  "link-inline", "badge-label", "metric-hero", "metric-large", "metric-standard", "metric-compact", "metric-unit",
  "table-header", "table-cell", "table-cell-strong", "table-number", "metadata", "data-id", "overline",
  "chart-label", "chart-micro",
] as const;

export type TextStyleId = (typeof textStyleIds)[number];
export type MacroKind = "protein" | "carbohydrate" | "fat";
export type ControlSize = "compact" | "standard";
export type SurfaceVariant = "default" | "subtle";
export type SurfaceDensity = "compact" | "standard" | "highlight";
export type SurfaceElevationPolicy = "shadow-none";
export type RecipeState = "default" | "hover" | "pressed" | "focus-visible" | "selected" | "disabled" | "loading" | "error" | "empty" | "read-only";
export type RecipeVariant = "primary" | "secondary" | "quiet" | "destructive" | "destructive-outline";
export type Tone = "default" | "secondary" | "muted" | "primary" | "info" | "success" | "warning" | "error" | MacroKind | "inverse";

export type ReferenceTokenId = `ref.${"color" | "space" | "radius" | "duration" | "font"}.${string}`;
export type SystemTokenId = `sys.${"color" | "space" | "radius" | "motion" | "shadow" | "z" | "opacity" | "ease" | "backdrop"}.${string}`;
export type ComponentTokenId = `cmp.${string}`;
export type TokenId = ReferenceTokenId | SystemTokenId | ComponentTokenId;

export type TokenLayer = "reference" | "system" | "component";

export interface TextStyleContract {
  id: TextStyleId;
  className: string;
  allowedElements: readonly (keyof HTMLElementTagNameMap)[];
  tones: readonly Tone[];
  forbiddenAlternatives: readonly string[];
  color: string;
  weight: 400 | 500 | 600 | 700;
  size: string;
  lineHeight: string;
}

export interface LegacyFinding {
  code: `LEG${string}`;
  rule: string;
  path: string;
  line: number;
  message: string;
  severity: "error" | "warning";
}

export interface MigrationCheckpoint {
  id: `MIG-${string}`;
  stage: string;
  inputs: string[];
  commands: string[];
  result: "blocked" | "passed" | "rolled-back";
  commit: string;
}
