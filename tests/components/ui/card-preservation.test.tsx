import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ui Card preservation", () => {
  it("keeps the Shadcn primitive free of product and nutrition rules", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/ui/card.tsx"), "utf8");

    expect(source).not.toMatch(/Surface|MetricBox|MacroMetric|nutrition|protein|carbohydrate|fat/i);
    expect(source).toContain("recipes.card");
  });
});
