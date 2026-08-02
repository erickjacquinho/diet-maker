import { describe, expect, it } from "vitest";
import { recipes, textStyle, tokenNames } from "@/design-system";

describe("closed design-system types", () => {
  it("keeps the runtime seam finite", () => {
    expect(tokenNames.reference.length).toBeGreaterThan(50);
    expect(tokenNames.system).toContain("sys.space.component");
    expect(recipes.button({ variant: "primary", size: "standard" })).toContain("bg-primary");
    expect(textStyle("body")).toContain("text-style-body");
  });

  it("documents compile-time rejection fixtures", () => {
    // @ts-expect-error invalid text style must not compile
    textStyle("text-2xl");
    // @ts-expect-error recipes expose no arbitrary color escape hatch
    recipes.button({ color: "#ff0000" });
    expect(true).toBe(true);
  });
});
