import { cva } from "class-variance-authority";

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const motion = "transition-colors duration-fast ease-standard motion-reduce:duration-0 motion-reduce:transform-none";

const button = cva(`inline-flex items-center justify-center gap-2 rounded-control border ${focus} ${motion} disabled:pointer-events-none disabled:opacity-disabled`, {
  variants: {
    variant: {
      primary: "border-primary bg-primary text-on-primary text-white hover:bg-primary-hover active:bg-primary-pressed",
      secondary: "border-border-control bg-surface text-text-primary hover:border-border-hover hover:bg-surface-hover",
      quiet: "border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      destructive: "border-error bg-error text-on-error text-white hover:bg-error/90 active:bg-error",
      ghost: "border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      danger: "border-error bg-error text-on-error text-white hover:bg-error/90 active:bg-error",
      default: "border-primary bg-primary text-on-primary text-white hover:bg-primary-hover active:bg-primary-pressed",
      outline: "border-border-control bg-surface text-text-primary hover:border-border-hover hover:bg-surface-hover",
      terracotta: "border-primary bg-primary text-on-primary text-white hover:bg-primary-hover",
      emerald: "border-primary bg-primary text-on-primary text-white hover:bg-primary-hover",
      link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
    },
    size: {
      compact: "h-control-compact px-3 text-style-button-label-compact font-semibold",
      standard: "h-control-standard px-4 text-style-button-label font-semibold",
      default: "h-control-standard px-4 text-style-button-label font-semibold",
      sm: "h-control-compact px-3 text-style-button-label-compact font-semibold",
      lg: "h-control-standard px-6 text-style-button-label font-semibold",
      icon: "h-control-standard w-control-standard p-0",
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

const avatar = cva("inline-flex shrink-0 items-center justify-center rounded-round border text-style-body-small font-bold", {
  variants: {
    size: { compact: "h-8 w-8", standard: "h-9 w-9", large: "h-11 w-11" },
    tone: {
      primary: "border-primary bg-primary text-on-primary",
      success: "border-success bg-success text-on-primary",
      neutral: "border-border-hover bg-surface-subtle text-text-primary",
    },
  },
  defaultVariants: { size: "standard", tone: "neutral" },
});

const progress = cva("w-full overflow-hidden rounded-round bg-border-subtle", {
  variants: {
    tone: {
      primary: "[&>[role=progressbar]]:bg-primary",
      success: "[&>[role=progressbar]]:bg-success",
      error: "[&>[role=progressbar]]:bg-error",
      warning: "[&>[role=progressbar]]:bg-warning",
      info: "[&>[role=progressbar]]:bg-info",
      protein: "[&>[role=progressbar]]:bg-macro-protein",
      carbohydrate: "[&>[role=progressbar]]:bg-macro-carbohydrate",
      fat: "[&>[role=progressbar]]:bg-macro-fat",
    },
    size: { compact: "h-2", standard: "h-3" },
  },
  defaultVariants: { tone: "success", size: "compact" },
});

export const recipes = { button, iconButton: button, input, textarea: input, badge, card, tableRow, avatar, progress } as const;

export type ButtonRecipeProps = Parameters<typeof button>[0];
export type InputRecipeProps = Parameters<typeof input>[0];
export type BadgeRecipeProps = Parameters<typeof badge>[0];
export type CardRecipeProps = Parameters<typeof card>[0];
