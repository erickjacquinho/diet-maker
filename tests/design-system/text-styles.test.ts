import { describe, expect, it } from "vitest";

import { textStyle, textStyleIds } from "@/design-system";

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
});
