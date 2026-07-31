import { cva } from "class-variance-authority";

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const motion = "transition-colors duration-fast ease-standard motion-reduce:duration-0 motion-reduce:transform-none";

const button = cva(`inline-flex items-center justify-center gap-2 rounded-control border ${focus} ${motion} disabled:pointer-events-none disabled:opacity-disabled`, {
  variants: {
    variant: {
      primary: "border-primary bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed",
      secondary: "border-border-control bg-surface text-text-primary hover:border-border-hover hover:bg-surface-hover",
      ghost: "border-transparent bg-transparent text-primary hover:bg-primary-soft",
      danger: "border-error bg-error text-on-primary hover:bg-error",
    },
    size: {
      compact: "h-control-compact px-3 text-style-button-label-compact font-semibold",
      standard: "h-control-standard px-4 text-style-button-label font-semibold",
    },
    state: {
      default: "",
      disabled: "pointer-events-none opacity-disabled",
      loading: "cursor-wait",
    },
  },
  defaultVariants: { variant: "primary", size: "standard", state: "default" },
});

const input = cva(`w-full rounded-control border border-input bg-surface px-3 text-style-field-value text-text-primary placeholder:text-text-muted ${focus} ${motion} disabled:opacity-disabled`, {
  variants: {
    size: { compact: "h-control-compact", standard: "h-control-standard" },
    state: { default: "", error: "border-error-border aria-invalid:border-error-border", "read-only": "bg-surface-subtle", disabled: "bg-disabled-soft" },
  },
  defaultVariants: { size: "standard", state: "default" },
});

const badge = cva("inline-flex min-h-6 items-center gap-1 rounded-compact border px-2 py-1 text-style-legal font-semibold", {
  variants: {
    tone: {
      default: "border-border-subtle bg-surface-subtle text-text-secondary",
      primary: "border-primary-border bg-primary-soft text-primary",
      info: "border-info-border bg-info-soft text-info",
      success: "border-success-border bg-success-soft text-success",
      warning: "border-warning-border bg-warning-soft text-warning",
      error: "border-error-border bg-error-soft text-error",
      protein: "border-macro-protein-border bg-macro-protein-soft text-macro-protein",
      carbohydrate: "border-macro-carbohydrate-border bg-macro-carbohydrate-soft text-macro-carbohydrate",
      fat: "border-macro-fat-border bg-macro-fat-soft text-macro-fat",
    },
  },
  defaultVariants: { tone: "default" },
});

const card = cva("rounded-surface border border-border-subtle bg-surface text-text-primary", {
  variants: { density: { compact: "p-3", standard: "p-4", featured: "p-5" }, interactive: { true: `${focus} ${motion} hover:border-border-hover`, false: "" } },
  defaultVariants: { density: "standard", interactive: false },
});

const tableRow = cva("min-h-table-row border-b border-border-divider", {
  variants: { state: { default: "bg-surface", selected: "bg-primary-soft", disabled: "text-disabled", loading: "bg-surface-subtle" } },
  defaultVariants: { state: "default" },
});

export const recipes = { button, iconButton: button, input, textarea: input, badge, card, tableRow } as const;
