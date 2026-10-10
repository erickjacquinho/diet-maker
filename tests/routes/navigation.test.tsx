import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { routeAcceptanceMatrix } from "./route-acceptance-matrix";

describe("route navigation contract", () => {
  it("keeps all nine stable URLs backed by app files", () => {
    expect(routeAcceptanceMatrix).toHaveLength(9);
    for (const route of routeAcceptanceMatrix) {
      const source = readFileSync(route.file, "utf8");
      expect(source).not.toMatch(/warm-|text-\[[^]]+\]|rounded-(?:xl|2xl|3xl|full)/);
    }
  });
});
