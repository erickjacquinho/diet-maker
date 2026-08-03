import { describe, expect, it } from "vitest";

import { tokenNames } from "@/design-system";

describe("canonical token contract", () => {
  it("publishes the reference, system, and component layers", () => {
    expect(tokenNames.reference).toContain("ref.color.blue.700");
    expect(tokenNames.system).toContain("sys.color.action.primary");
    expect(tokenNames.component).toContain("cmp.button.primary.background");
  });

  it("does not publish legacy aliases", () => {
    expect(JSON.stringify(tokenNames)).not.toMatch(/stone|emerald|warm-bg|color-bg-app/);
  });
});
