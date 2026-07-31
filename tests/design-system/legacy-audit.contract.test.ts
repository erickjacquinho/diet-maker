import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const script = path.join(root, "scripts/verify-design-system-legacy.mjs");
const fixtures = path.join(root, "tests/fixtures/design-system-legacy");

describe("legacy audit CLI contract", () => {
  it.each(Array.from({ length: 10 }, (_, index) => `LEG${String(index + 1).padStart(3, "0")}`))("reports %s through the public JSON interface", (code) => {
    const result = spawnSync(process.execPath, [script, "--strict", "--json", "--paths", path.join(fixtures, `${code}.fixture.tsx`)], { cwd: root, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout).findings.map((finding: { code: string }) => finding.code)).toContain(code);
  });

  it("uses exit code 2 for invalid scope configuration", () => {
    const result = spawnSync(process.execPath, [script, "--strict", "--paths", "missing-scope"], { cwd: root, encoding: "utf8" });
    expect(result.status).toBe(2);
  });

  it("is clean for the canonical foundation configuration", () => {
    const output = execFileSync(process.execPath, [script, "--strict", "--json", "--paths", "src/app/globals.css,tailwind.config.js,components.json"], { cwd: root, encoding: "utf8" });
    expect(JSON.parse(output).findings).toEqual([]);
  });
});
