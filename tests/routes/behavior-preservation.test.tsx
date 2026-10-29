import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { routeAcceptanceMatrix } from "./route-acceptance-matrix";

describe("static alias implementation inspection (not browser navigation)", () => {
  it("inspects redirects and the dashboard aliases' query forwarding", () => {
    for (const route of routeAcceptanceMatrix.filter((entry) => entry.kind === 'alias')) {
      const source = readFileSync(route.file, 'utf8');
      expect(source).toMatch(/redirect\(/);
      if (route.destination === '/dashboard') expect(source).toMatch(/searchParams/);
      else expect(source).toContain(`redirect('${route.destination}')`);
    }
  });
});
