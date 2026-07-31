import type { ComponentTokenId, ReferenceTokenId, SystemTokenId } from "./types";

export { recipes } from "./recipes";
export { textStyle, textStyleIds, textStyles } from "./text-styles";
export type * from "./types";

const reference = ["ref.color.blue.700", "ref.space.4", "ref.radius.6", "ref.duration.120", "ref.font.plus-jakarta-sans"] as const satisfies readonly ReferenceTokenId[];
const system = ["sys.color.action.primary", "sys.color.text.primary", "sys.space.component", "sys.radius.control", "sys.motion.feedback"] as const satisfies readonly SystemTokenId[];
const component = ["cmp.button.primary.background", "cmp.input.border.default", "cmp.card.padding.default"] as const satisfies readonly ComponentTokenId[];

export const tokenNames = { reference, system, component } as const;
