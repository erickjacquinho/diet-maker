import { textStyleIds, type TextStyleId } from "./types";

const tone = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
} as const;

const title = "font-bold tracking-tight text-text-primary";
const tabular = "tabular-nums lining-nums";

export const textStyles: Readonly<Record<TextStyleId, string>> = {
  "page-title": `text-style-page-title ${title}`,
  "page-subtitle": `text-style-page-subtitle font-regular ${tone.secondary}`,
  "section-title": `text-style-section-title ${title}`,
  "subsection-title": `text-style-subsection-title font-bold ${tone.primary}`,
  "card-title": `text-style-card-title font-semibold ${tone.primary}`,
  "dialog-title": `text-style-dialog-title ${title}`,
  "empty-title": `text-style-empty-title font-semibold ${tone.primary}`,
  "body-large": `text-style-body-large font-regular ${tone.primary}`,
  body: `text-style-body font-regular ${tone.primary}`,
  "body-strong": `text-style-body font-semibold ${tone.primary}`,
  "body-secondary": `text-style-body font-regular ${tone.secondary}`,
  "body-small": `text-style-body-small font-regular ${tone.primary}`,
  "body-small-strong": `text-style-body-small font-semibold ${tone.primary}`,
  "body-quote": `text-style-body-small font-regular italic ${tone.secondary}`,
  caption: `text-style-caption font-regular ${tone.secondary}`,
  "caption-strong": `text-style-caption font-semibold ${tone.secondary}`,
  helper: `text-style-caption font-regular ${tone.muted}`,
  legal: `text-style-legal font-regular ${tone.muted}`,
  "field-label": `text-style-field-label font-semibold ${tone.primary}`,
  "field-value": `text-style-field-value font-regular ${tone.primary}`,
  "field-placeholder": `text-style-field-value font-regular ${tone.muted}`,
  "validation-error": "text-style-caption font-medium text-error",
  "validation-success": "text-style-caption font-medium text-success",
  "button-label": "text-style-button-label font-semibold",
  "button-label-compact": "text-style-button-label-compact font-semibold",
  "nav-item": "text-style-nav-item font-semibold",
  "tab-label": "text-style-tab-label font-semibold",
  "link-inline": "text-style-body font-medium text-primary",
  "badge-label": "text-style-legal font-semibold",
  "metric-hero": `text-style-metric-hero font-bold tracking-tight ${tone.primary} ${tabular}`,
  "metric-large": `text-style-section-title font-bold tracking-tight ${tone.primary} ${tabular}`,
  "metric-standard": `text-style-field-value font-bold ${tabular}`,
  "metric-compact": `text-style-legal font-semibold ${tabular}`,
  "metric-unit": `text-style-legal font-regular ${tone.muted}`,
  "table-header": `text-style-legal font-semibold tracking-label uppercase ${tone.secondary}`,
  "table-cell": `text-style-body-small font-regular ${tone.primary}`,
  "table-cell-strong": `text-style-body-small font-semibold ${tone.primary}`,
  "table-number": `text-style-body-small font-semibold ${tone.primary} ${tabular}`,
  metadata: `text-style-legal font-medium ${tone.muted}`,
  "data-id": `text-style-caption font-medium ${tone.muted} ${tabular}`,
  overline: `text-style-legal font-bold tracking-overline uppercase ${tone.secondary}`,
  "chart-label": `text-style-legal font-medium ${tone.secondary}`,
  "chart-micro": `text-style-chart-micro font-semibold ${tone.muted}`,
};

export function textStyle(styleId: TextStyleId): string {
  return textStyles[styleId];
}

export { textStyleIds };
