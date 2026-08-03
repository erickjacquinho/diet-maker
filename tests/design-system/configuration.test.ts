import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("design system configuration", () => {
  it("loads only the canonical token runtime globally", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain('@import "../design-system/tokens.css"');
    expect(css).not.toMatch(/Inter|box-shadow:\s*none\s*!important|background-image:\s*none\s*!important/);
  });

  it("keeps Tailwind as semantic aliases without dark mode or legacy palettes", () => {
    const tailwind = read("tailwind.config.js");
    expect(tailwind).not.toMatch(/darkMode|\bwarm\s*:|\bstone\s*:|font-black|Inter/);
    expect(tailwind).toContain("--sys-color-action-primary");
  });

  it("keeps shadcn on the generic project aliases", () => {
    const config = JSON.parse(read("components.json"));
    expect(config.rsc).toBe(true);
    expect(config.aliases.ui).toBe("@/components/ui");
    expect(config.iconLibrary).toBe("lucide");
  });
});
