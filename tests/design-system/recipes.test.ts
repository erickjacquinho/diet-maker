import { describe, expect, it } from "vitest";

import { recipes } from "@/design-system";

describe("canonical component recipes", () => {
  it("creates the documented button variants and sizes", () => {
    expect(recipes.button({ variant: "primary", size: "standard", state: "default" })).toContain("bg-primary");
    expect(recipes.button({ variant: "danger", size: "compact", state: "loading" })).toContain("cursor-wait");
  });

  it("uses semantic classes without local visual values", () => {
    const samples = [
      recipes.button(),
      recipes.input(),
      recipes.badge({ tone: "protein" }),
      recipes.card(),
      recipes.tableRow({ state: "selected" }),
    ];
    expect(samples.join(" ")).not.toMatch(/#[0-9a-f]{3,8}|\[[^\]]+\]|rounded-(?:xl|2xl|3xl|full)|transition-all/i);
  });
});
