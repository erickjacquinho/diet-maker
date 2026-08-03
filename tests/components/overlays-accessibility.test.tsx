import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("overlay accessibility contract", () => {
  it("uses Radix primitives for focus management and dismissal", () => {
    for (const file of ["dialog", "sheet", "popover", "select", "dropdown-menu", "tooltip"]) {
      const source = readFileSync(`src/components/ui/${file}.tsx`, "utf8");
      expect(source).toMatch(/@radix-ui\/react-/);
      expect(source).toMatch(/Portal|Content|Trigger/);
    }
    for (const file of ["FoodSearchModal", "ReadOnlyDietModal"]) {
      const source = readFileSync(`src/components/molecules/${file}.tsx`, "utf8");
      expect(source).toContain("Dialog");
      expect(source).toMatch(/onClose|onOpenChange/);
    }
  });
});
