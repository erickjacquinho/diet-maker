/**
 * @deprecated Compatibility facade for the historical catalogue page.
 * New consumers must import tokenNames, textStyle and recipes from "@/design-system".
 * Values remain owned by tokens.css; this module contains aliases only.
 */
const css = (name: string) => `var(--${name})`;

export const primitiveTokens = {
  colors: {
    stone: { 50: css("ref-color-warm-25"), 100: css("ref-color-warm-50"), 200: css("ref-color-warm-200"), 300: css("ref-color-warm-300"), 500: css("ref-color-warm-500"), 700: css("ref-color-warm-800"), 900: css("ref-color-warm-950") },
    warm: { 0: css("ref-color-warm-0"), 25: css("ref-color-warm-25"), 50: css("ref-color-warm-50"), 100: css("ref-color-warm-100"), 150: css("ref-color-warm-150"), 200: css("ref-color-warm-200"), 300: css("ref-color-warm-300"), 500: css("ref-color-warm-500"), 600: css("ref-color-warm-600"), 700: css("ref-color-warm-700"), 800: css("ref-color-warm-800"), 950: css("ref-color-warm-950") },
    blue: { 50: css("ref-color-blue-50"), 100: css("ref-color-blue-100"), 500: css("ref-color-blue-500"), 600: css("ref-color-blue-700"), 700: css("ref-color-blue-700"), 800: css("ref-color-blue-800"), 900: css("ref-color-blue-900") },
    emerald: { 50: css("ref-color-fat-50"), 600: css("ref-color-fat-500") },
    amber: { 50: css("ref-color-carbohydrate-50"), 600: css("ref-color-carbohydrate-500") },
    teal: { 50: css("ref-color-fat-50"), 600: css("ref-color-fat-500") },
    protein: { 50: css("ref-color-protein-50"), 200: css("ref-color-protein-200"), 500: css("ref-color-protein-500") },
    carbohydrate: { 50: css("ref-color-carbohydrate-50"), 200: css("ref-color-carbohydrate-200"), 500: css("ref-color-carbohydrate-500") },
    fat: { 50: css("ref-color-fat-50"), 200: css("ref-color-fat-200"), 500: css("ref-color-fat-500") },
  },
  typography: {
    fonts: { display: "Plus Jakarta Sans", body: "Plus Jakarta Sans", mono: "Plus Jakarta Sans" },
    sizes: { caption: "type-12", body: "type-14", title: "type-20", pageTitle: "type-28" },
    weights: { regular: "font-regular", medium: "font-medium", semibold: "font-semibold", bold: "font-bold" },
  },
  spacing: { 0: css("ref-space-0"), 1: css("ref-space-1"), 2: css("ref-space-2"), 3: css("ref-space-3"), 4: css("ref-space-4"), 5: css("ref-space-5"), 6: css("ref-space-6"), 8: css("ref-space-8"), 10: css("ref-space-10"), 12: css("ref-space-12"), 16: css("ref-space-16") },
  radii: { none: css("ref-radius-0"), compact: css("ref-radius-4"), control: css("ref-radius-6"), surface: css("ref-radius-8"), round: css("ref-radius-round") },
  transitions: { fast: css("sys-motion-fast"), normal: css("sys-motion-standard"), standard: css("sys-motion-standard"), slow: css("sys-motion-slow") },
} as const;

export const semanticTokens = {
  surfaces: { app: css("sys-color-canvas"), card: css("sys-color-surface"), inner: css("sys-color-surface-subtle") },
  text: { primary: css("sys-color-text-primary"), secondary: css("sys-color-text-secondary"), muted: css("sys-color-text-muted") },
  borders: { clean: css("sys-color-border-subtle"), focus: css("sys-color-action-primary-focus"), control: css("sys-color-border-control-essential"), emerald: css("sys-color-action-primary-focus") },
  macros: {
    protein: { main: css("sys-color-macro-protein"), bg: css("sys-color-macro-protein-soft") },
    carbohydrate: { main: css("sys-color-macro-carbohydrate"), bg: css("sys-color-macro-carbohydrate-soft") },
    fat: { main: css("sys-color-macro-fat"), bg: css("sys-color-macro-fat-soft") },
  },
} as const;

export const componentTokens = {
  button: { background: css("cmp-button-primary-background"), radius: css("sys-radius-control") },
  input: { border: css("cmp-input-border-default"), radius: css("sys-radius-control") },
  card: { padding: css("cmp-card-padding-default"), radius: css("sys-radius-surface") },
} as const;

export const designTokens = { primitive: primitiveTokens, semantic: semanticTokens, component: componentTokens } as const;
