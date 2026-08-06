import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Surface Atomic composition", () => {
  it("does not import upward layers or nutrition-domain modules", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/atoms/Surface.tsx"), "utf8");

    expect(source).toContain("@/components/ui/card");
    expect(source).not.toMatch(/components\/(molecules|organisms|templates)|src\/app|nutrition|macro|MetricBox/i);
  });
});
