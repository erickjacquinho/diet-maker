import type { ComponentTokenId, ReferenceTokenId, SystemTokenId } from "./types";

export { recipes } from "./recipes";
export { textStyle, textStyleContract, textStyleContracts, textStyleIds, textStyles } from "./text-styles";
export type * from "./types";

const reference = [
  "ref.color.warm.0", "ref.color.warm.15", "ref.color.warm.25", "ref.color.warm.50", "ref.color.warm.100", "ref.color.warm.150", "ref.color.warm.200", "ref.color.warm.300", "ref.color.warm.500", "ref.color.warm.600", "ref.color.warm.700", "ref.color.warm.800", "ref.color.warm.950",
  "ref.color.blue.50", "ref.color.blue.100", "ref.color.blue.500", "ref.color.blue.700", "ref.color.blue.800", "ref.color.blue.900",
  "ref.color.protein.500", "ref.color.protein.50", "ref.color.protein.200", "ref.color.carbohydrate.500", "ref.color.carbohydrate.50", "ref.color.carbohydrate.200", "ref.color.fat.500", "ref.color.fat.50", "ref.color.fat.200",
  "ref.color.info.500", "ref.color.info.50", "ref.color.info.200", "ref.color.success.500", "ref.color.success.50", "ref.color.success.200", "ref.color.warning.500", "ref.color.warning.50", "ref.color.warning.200", "ref.color.error.500", "ref.color.error.50", "ref.color.error.200",
  "ref.space.0", "ref.space.1", "ref.space.2", "ref.space.3", "ref.space.4", "ref.space.5", "ref.space.6", "ref.space.8", "ref.space.10", "ref.space.12", "ref.space.16",
  "ref.radius.0", "ref.radius.4", "ref.radius.6", "ref.radius.8", "ref.radius.round", "ref.duration.0", "ref.duration.120", "ref.duration.160", "ref.duration.240", "ref.font.plus-jakarta-sans",
] as const satisfies readonly ReferenceTokenId[];
const system = [
  "sys.color.canvas", "sys.color.surface", "sys.color.surface.subtle", "sys.color.surface.hover", "sys.color.border.divider", "sys.color.border.subtle", "sys.color.border.hover", "sys.color.border.control.essential", "sys.color.text.primary", "sys.color.text.secondary", "sys.color.text.muted", "sys.color.disabled", "sys.color.disabled.soft", "sys.color.action.primary", "sys.color.action.primary.hover", "sys.color.action.primary.pressed", "sys.color.action.primary.focus", "sys.color.action.primary.soft", "sys.color.action.primary.border", "sys.color.on.primary", "sys.color.info", "sys.color.info.soft", "sys.color.info.border", "sys.color.on.info", "sys.color.success", "sys.color.success.soft", "sys.color.success.border", "sys.color.on.success", "sys.color.warning", "sys.color.warning.soft", "sys.color.warning.border", "sys.color.on.warning", "sys.color.error", "sys.color.error.soft", "sys.color.error.border", "sys.color.on.error", "sys.color.macro.protein", "sys.color.macro.protein.soft", "sys.color.macro.protein.border", "sys.color.macro.carbohydrate", "sys.color.macro.carbohydrate.soft", "sys.color.macro.carbohydrate.border", "sys.color.macro.fat", "sys.color.macro.fat.soft", "sys.color.macro.fat.border", "sys.color.macro.kcal", "sys.color.macro.kcal.soft", "sys.color.macro.kcal.border",
  "sys.space.component", "sys.radius.compact", "sys.radius.control", "sys.radius.surface", "sys.radius.round", "sys.motion.fast", "sys.motion.standard", "sys.motion.slow", "sys.ease.standard", "sys.ease.exit", "sys.shadow.floating", "sys.shadow.overlay", "sys.backdrop.overlay", "sys.opacity.disabled",
] as const satisfies readonly SystemTokenId[];
const component = ["cmp.button.primary.background", "cmp.button.primary.background.hover", "cmp.button.primary.background.pressed", "cmp.input.border.default", "cmp.card.padding.default"] as const satisfies readonly ComponentTokenId[];

export const tokenCssVariables = {
  reference: Object.fromEntries(reference.map((id) => [id, `--${id.replaceAll(".", "-")}`])),
  system: Object.fromEntries(system.map((id) => [id, `--${id.replaceAll(".", "-")}`])),
  component: Object.fromEntries(component.map((id) => [id, `--${id.replaceAll(".", "-")}`])),
} as const;

export const tokenNames = { reference, system, component } as const;
