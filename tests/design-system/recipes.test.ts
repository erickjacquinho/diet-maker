import { describe, expect, it } from "vitest";

import { recipes } from "@/design-system";

describe("canonical component recipes", () => {
  it("creates the documented button variants and sizes", () => {
    expect(recipes.button({ variant: "primary", size: "standard", state: "default" })).toContain("bg-primary");
    expect(recipes.button({ variant: "destructive", size: "compact", state: "loading" })).toContain("cursor-wait");
    expect(recipes.button({ variant: "destructive-outline", size: "standard", state: "default" })).toContain("border-error-border");
    expect(recipes.button({ variant: "destructive-outline", size: "standard", state: "default" })).toContain("hover:bg-error");
  });

  it("gives icon-only buttons square geometry from the recipe", () => {
    expect(recipes.button({ size: "standard", iconOnly: true })).toContain("w-control-standard");
    expect(recipes.button({ size: "compact", iconOnly: true })).toContain("w-control-compact");
  });

  it("creates the documented input and textarea recipes", () => {
    expect(recipes.input({ size: "standard", state: "default" })).toContain("h-control-standard");
    expect(recipes.input({ size: "compact", state: "default" })).toContain("h-control-compact");
    expect(recipes.textarea({ state: "default" })).toContain("min-h-[80px]");
    expect(recipes.textarea({ state: "error" })).toContain("border-error-border");
    expect(recipes.textarea({ state: "read-only" })).toContain("bg-surface-subtle");
  });

  it("uses semantic classes without local visual values", () => {
    const samples = [
      recipes.button(),
      recipes.input(),
      recipes.badge({ tone: "protein" }),
      recipes.card(),
      recipes.tableRow({ state: "selected" }),
    ];
    expect(samples.join(" ")).not.toMatch(/#[0-9a-f]{3,8}|\[[^\]]+\]|rounded-(?:xl|2xl|3xl|full)|transition-all/i);
  });
});
