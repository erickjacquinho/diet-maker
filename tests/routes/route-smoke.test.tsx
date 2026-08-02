import { describe, expect, it } from "vitest";
import { routeAcceptanceMatrix } from "./route-acceptance-matrix";

describe("route smoke inventory", () => {
  it("defines deterministic smoke coverage for every route", () => {
    for (const route of routeAcceptanceMatrix) {
      expect(route.path).toMatch(/^\//);
      expect(route.states).toContain("default");
    }
  });
});
