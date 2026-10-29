import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { routeAcceptanceMatrix } from "./route-acceptance-matrix";

describe("static page route metadata", () => {
  it("maps unique URLs to App Router files and declares evidence limits", () => {
    expect(new Set(routeAcceptanceMatrix.map((route) => route.path)).size).toBe(routeAcceptanceMatrix.length);
    for (const route of routeAcceptanceMatrix) {
      const derived = `/${route.file.replace(/^src\/app\//, '').replace(/(?:\/)?page\.tsx$/, '')
        .split('/').filter((segment) => !/^\(.*\)$/.test(segment)).join('/')}`;
      expect(route.path).toBe(derived);
      expect(route.parameters).toEqual([...route.path.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1]));
      expect(route.states.length).toBeGreaterThan(0);
      if (route.kind === 'alias') {
        expect(route.states).toEqual(['redirect']);
        expect(route.destination).toMatch(/^\//);
      }
      if (route.evidence.kind !== 'gap') expect(route.evidence.files.length).toBeGreaterThan(0);
      for (const file of route.evidence.files) expect(existsSync(file), file).toBe(true);
    }
  });
});
