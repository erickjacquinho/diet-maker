export type TokenLayer = "reference" | "system" | "component";
export type TokenType = "color" | "typography" | "spacing" | "shadow" | "radius";

export interface ColorTokenSpec {
  id: string;
  name: string;
  layer: TokenLayer;
  cssVariable: string;
  hexValue: string;
  hslValue: string;
  contrastRatioOnDark: string;
  contrastRatioOnLight: string;
  wcagAa: boolean;
  wcagAaa: boolean;
  usageContext: string;
}

export interface TypographyTokenSpec {
  id: string;
  styleId: string;
  name: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  allowedElements: string[];
  sampleText: string;
}

export interface StructuralTokenSpec {
  id: string;
  name: string;
  type: "spacing" | "radius" | "shadow";
  cssVariable: string;
  value: string;
  pixelEquivalent?: string;
}

export type ComponentCategory = "atoms" | "molecules" | "organisms";
export type ComponentLifecycle = "stable" | "proposed" | "migration-required";

export interface ComponentPropertyControl {
  name: string;
  label: string;
  type: "select" | "boolean" | "text" | "number";
  options?: string[];
  defaultValue: any;
}

export interface ComponentCatalogItem {
  id: string;
  name: string;
  category: ComponentCategory;
  lifecycle: ComponentLifecycle;
  description: string;
  importPath: string;
  recipeName?: string;
  controls: ComponentPropertyControl[];
  supportedStates: string[];
  renderPreview: (props: Record<string, any>) => React.ReactNode;
}

export type ShowcaseTab = "all" | "tokens" | "atoms" | "molecules" | "organisms" | "compositions";
export type ViewMode = "client-showcase" | "dev-spec";
