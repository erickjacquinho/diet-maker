import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const designTokens = [
  "text-primary", "text-secondary", "text-muted",
  "on-primary", "on-error", "on-warning", "on-success", "on-info",
  "canvas", "surface", "surface-subtle", "surface-hover",
  "disabled", "disabled-soft",
  "success", "success-soft", "success-border",
  "error", "error-soft", "error-border",
  "warning", "warning-soft", "warning-border",
  "info", "info-soft", "info-border",
  "macro-protein", "macro-protein-soft", "macro-protein-border",
  "macro-carbohydrate", "macro-carbohydrate-soft", "macro-carbohydrate-border",
  "macro-fat", "macro-fat-soft", "macro-fat-border",
  "primary", "primary-hover", "primary-pressed", "primary-focus", "primary-soft", "primary-border", "primary-foreground",
  "secondary", "secondary-foreground",
  "muted", "muted-foreground",
  "accent", "accent-foreground",
  "card", "card-foreground",
  "popover", "popover-foreground",
  "destructive", "destructive-foreground",
  "border", "border-divider", "border-subtle", "border-hover", "border-control",
  "input", "ring",
]

const fontSizes = [
  "style-page-title", "style-page-subtitle", "style-section-title", "style-subsection-title",
  "style-card-title", "style-dialog-title", "style-empty-title",
  "style-body-large", "style-body", "style-body-small",
  "style-caption", "style-legal",
  "style-field-label", "style-field-value",
  "style-button-label", "style-button-label-compact",
  "style-nav-item", "style-tab-label",
  "style-metric-hero", "style-chart-micro",
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: fontSizes }],
      "text-color": [{ text: designTokens }],
      "bg-color": [{ bg: designTokens }],
      "border-color": [{ border: designTokens }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
