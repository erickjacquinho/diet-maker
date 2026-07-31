import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DesignSystemPage from "@/app/design-system/page";

describe("canonical design system route", () => {
  it("presents runtime tokens, text styles, recipes, and registry lifecycle honestly", () => {
    render(<DesignSystemPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Design System canônico" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Camadas de tokens" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Text styles" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recipes e estados" })).toBeInTheDocument();
    expect(screen.getByText(/proposed:/)).toBeInTheDocument();
    expect(screen.getByText(/migration-required:/)).toBeInTheDocument();
  });

  it("does not expose the replaced runtime as current", () => {
    const { container } = render(<DesignSystemPage />);
    expect(container.textContent).not.toMatch(/primitiveTokens|semanticTokens|Swiss Warm Minimalist|Inter/);
  });
});
