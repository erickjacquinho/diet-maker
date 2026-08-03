import { describe, expect, it } from "vitest";
import { verifyLegacy } from "../../scripts/verify-design-system-legacy.mjs";

const ruleCodes = Array.from({ length: 17 }, (_, index) => `LEG${String(index + 1).padStart(3, "0")}`);

describe("legacy auditor integration", () => {
  it("returns zero findings for the migrated runtime", async () => {
    const result = await verifyLegacy(process.cwd(), { mode: "strict" });
    expect(result.findings).toEqual([]);
  });

  it("keeps all seventeen rule codes represented by fixtures", async () => {
    const result = await verifyLegacy(process.cwd(), { paths: ["tests/fixtures/design-system-legacy"] });
    expect(new Set(result.findings.map((finding) => finding.code))).toEqual(new Set(ruleCodes));
  });

  it("exempts shadcn primitives under src/components/ui from all rules", async () => {
    const result = await verifyLegacy(process.cwd(), { paths: ["src/components/ui"] });
    expect(result.findings).toEqual([]);
  });

  it("exempts the canonical layer under src/design-system from all rules", async () => {
    const result = await verifyLegacy(process.cwd(), { paths: ["src/design-system"] });
    expect(result.findings).toEqual([]);
  });
});
