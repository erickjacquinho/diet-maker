import { describe, expect, it } from "vitest";
import { verifyLegacy } from "../../scripts/verify-design-system-legacy.mjs";

describe("legacy auditor integration", () => {
  it("returns zero findings for the migrated runtime", async () => {
    const result = await verifyLegacy(process.cwd(), { mode: "strict" });
    expect(result.findings).toEqual([]);
  });

  it("keeps all ten rule codes represented by fixtures", async () => {
    const result = await verifyLegacy(process.cwd(), { paths: ["tests/fixtures/design-system-legacy"] });
    expect(new Set(result.findings.map((finding) => finding.code))).toEqual(new Set(Array.from({ length: 10 }, (_, index) => `LEG${String(index + 1).padStart(3, "0")}`)));
  });
});
