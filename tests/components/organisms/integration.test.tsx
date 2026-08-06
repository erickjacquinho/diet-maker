import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("organism and template integration", () => {
  it("keeps organisms below templates and app", () => {
    for (const file of ["MacroTrackerHeader", "MealCardContainer", "SidebarNav", "PatientListTable"]) {
      const source = readFileSync(`src/components/organisms/${file}.tsx`, "utf8");
      expect(source).not.toMatch(/@\/components\/templates|@\/app\//);
      expect(source).toMatch(/@\/components\/(ui|atoms|molecules)/);
    }
    for (const file of ["AppLayoutShell", "DietBuilderTemplate"]) {
      const source = readFileSync(`src/components/templates/${file}.tsx`, "utf8");
      expect(source).not.toMatch(/@\/app\//);
    }
  });
});
