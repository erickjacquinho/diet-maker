import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Surface } from "@/components/atoms/Surface";
import { recipes } from "@/design-system";

describe("Surface atom", () => {
  it("composes children with the canonical default surface", () => {
    render(
      <Surface data-testid="surface" aria-label="Resumo">
        <span>Conteúdo</span>
      </Surface>,
    );

    const surface = screen.getByTestId("surface");
    expect(surface).toHaveTextContent("Conteúdo");
    expect(surface).toHaveAttribute("aria-label", "Resumo");
    expect(surface).toHaveClass("bg-surface", "rounded-surface", "shadow-none", "p-4");
  });

  it("supports named variants and canonical density without domain props", () => {
    render(
      <Surface data-testid="subtle" variant="subtle" density="highlight">
        Subtle
      </Surface>,
    );

    expect(screen.getByTestId("subtle")).toHaveClass("bg-surface-subtle", "p-5", "shadow-none");
    expect(screen.getByTestId("subtle")).not.toHaveAttribute("tone");
  });

  it("keeps the recipe free of local values and floating elevation", () => {
    const recipe = recipes.surface({ variant: "subtle", density: "compact" });

    expect(recipe).toContain("shadow-none");
    expect(recipe).toContain("p-3");
    expect(recipe).not.toMatch(/shadow-floating|shadow-overlay|#[0-9a-f]{3,8}|\[[^\]]+\]/i);
  });
});
