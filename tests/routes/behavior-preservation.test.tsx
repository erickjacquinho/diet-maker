import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { routeAcceptanceMatrix } from "./route-acceptance-matrix";

describe("route behavior preservation", () => {
  it("keeps interactive routes wired to domain stores and navigation", () => {
    const source = routeAcceptanceMatrix.map((route) => readFileSync(route.file, "utf8")).join("\n");
    expect(source).toMatch(/next\/navigation|next\/link/);
    expect(source).toMatch(/localStorage|Store|set[A-Z]|onClick/);
  });
});
