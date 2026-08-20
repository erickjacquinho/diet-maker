import { cva } from "class-variance-authority";

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const motion = "transition-colors duration-fast ease-standard motion-reduce:duration-0 motion-reduce:transform-none";

const button = cva(`inline-flex items-center justify-center gap-2 rounded-control border ${focus} ${motion} disabled:pointer-events-none disabled:opacity-disabled`, {
  variants: {
    variant: {
      primary: "border-primary bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-pressed",
      secondary: "border-border-control bg-surface text-text-primary hover:border-button-secondary-border-hover hover:bg-button-secondary-hover",
      quiet: "border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      destructive: "border-error bg-error text-on-error hover:bg-error/90 active:bg-error",
      "destructive-outline": "border-error bg-surface text-error hover:border-error hover:bg-error hover:text-white active:bg-error active:text-white disabled:border-border-subtle disabled:bg-disabled-soft disabled:text-disabled",
    },
    size: {
      compact: "h-control-compact px-3 text-style-button-label-compact font-semibold",
      standard: "h-control-standard px-4 text-style-button-label font-semibold",
    },
    iconOnly: {
      true: "p-0",
      false: "",
    },
    state: {
      default: "",
      disabled: "pointer-events-none opacity-disabled",
      loading: "cursor-wait",
    },
  },
  compoundVariants: [
    { size: "compact", iconOnly: true, className: "w-control-compact" },
    { size: "standard", iconOnly: true, className: "w-control-standard" },
  ],
  defaultVariants: { variant: "primary", size: "standard", iconOnly: false, state: "default" },
});

const input = cva(`w-full rounded-control border border-input bg-surface px-3 text-style-field-value text-text-primary placeholder:text-text-muted ${focus} ${motion} disabled:opacity-disabled`, {
  variants: {
    size: { compact: "h-control-compact", standard: "h-control-standard" },
    state: { default: "", error: "border-error-border aria-invalid:border-error-border", "read-only": "bg-surface-subtle", disabled: "bg-disabled-soft" },
  },
  defaultVariants: { size: "standard", state: "default" },
});

const textarea = cva(`w-full min-h-[80px] rounded-control border border-input bg-surface px-3 py-2 text-style-field-value text-text-primary placeholder:text-text-muted ${focus} ${motion} disabled:opacity-disabled`, {
  variants: {
    state: { default: "", error: "border-error-border aria-invalid:border-error-border", "read-only": "bg-surface-subtle", disabled: "bg-disabled-soft" },
  },
  defaultVariants: { state: "default" },
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

const surface = cva("rounded-surface border text-text-primary shadow-none", {
  variants: {
    variant: {
      default: "border-border-subtle bg-surface",
      subtle: "border-border-divider bg-surface-subtle",
    },
    density: {
      compact: "p-3",
      standard: "p-4",
      highlight: "p-5",
    },
  },
  defaultVariants: { variant: "default", density: "standard" },
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

export const recipes = { button, iconButton: button, input, textarea, badge, card, surface, tableRow, avatar, progress } as const;

export type ButtonRecipeProps = Parameters<typeof button>[0];
export type InputRecipeProps = Parameters<typeof input>[0];
export type TextareaRecipeProps = Parameters<typeof textarea>[0];
export type BadgeRecipeProps = Parameters<typeof badge>[0];
export type CardRecipeProps = Parameters<typeof card>[0];
export type SurfaceRecipeProps = Parameters<typeof surface>[0];
