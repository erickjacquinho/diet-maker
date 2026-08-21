import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = ["badge", "button", "calendar", "card", "dialog", "dropdown-menu", "input", "popover", "scroll-area", "select", "separator", "sheet", "spinner", "table", "tabs", "tooltip"];

describe("Shadcn primitive isolation", () => {
  it("does not import domain or ascending atomic layers", () => {
    for (const file of files) {
      const source = readFileSync(`src/components/ui/${file}.tsx`, "utf8");
      expect(source).not.toMatch(/@\/components\/(atoms|molecules|organisms|templates)/);
      expect(source).not.toMatch(/@\/app\//);
    }
  });
});
