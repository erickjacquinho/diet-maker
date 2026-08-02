import { describe, expect, it } from "vitest";

import { textStyle, textStyleContract, textStyleContracts, textStyleIds } from "@/design-system";

describe("canonical text styles", () => {
  it("covers the documented catalogue through named classes", () => {
    expect(textStyleIds).toContain("page-title");
    expect(textStyleIds).toContain("table-number");
    expect(textStyle("page-title")).toContain("text-style-page-title");
  });

  it("contains no arbitrary typography or forbidden weights", () => {
    for (const id of textStyleIds) {
      expect(textStyle(id)).not.toMatch(/text-\[|leading-|tracking-\[|font-(?:black|extrabold)/);
    }
  });

  it("publishes a complete contract for every style", () => {
    for (const id of textStyleIds) {
      const contract = textStyleContract(id);
      expect(contract.className).toBe(textStyle(id));
      expect(contract.allowedElements.length).toBeGreaterThan(0);
      expect(contract.tones.length).toBeGreaterThan(0);
      expect(contract.forbiddenAlternatives.length).toBeGreaterThan(0);
      expect(textStyleContracts[id]).toBe(contract);
    }
  });
});
