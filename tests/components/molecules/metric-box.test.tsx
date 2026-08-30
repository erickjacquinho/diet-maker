import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricBox } from "@/components/molecules/MetricBox";

describe("MetricBox Surface composition", () => {
  it("keeps its content API while composing a raised Surface", () => {
    render(
      <MetricBox
        label="Peso"
        value="82 kg"
        caption="Atual"
        surface="raised"
        data-testid="metric"
      />,
    );

    const root = screen.getByTestId("metric");
    expect(root).toHaveClass("bg-surface", "rounded-surface", "shadow-none");
    expect(screen.getByText("Peso")).toBeInTheDocument();
    expect(screen.getByText("82 kg")).toBeInTheDocument();
    expect(screen.getByText("Atual")).toBeInTheDocument();
  });

  it("keeps semantic tinting at the molecule while reusing Surface geometry", () => {
    render(
      <MetricBox
        label="Proteínas"
        value="150 g"
        tone="protein"
        surface="tinted"
        data-testid="metric-tinted"
      />,
    );

    const root = screen.getByTestId("metric-tinted");
    expect(root).toHaveClass("bg-macro-protein-soft/50", "border-macro-protein-border", "rounded-surface");
    expect(screen.getByText("150 g")).toHaveClass("text-macro-protein");
  });

  it("does not create a second box for the inline mode", () => {
    render(<MetricBox label="Kcal" value="2.200" surface="inline" data-testid="metric-inline" />);

    const root = screen.getByTestId("metric-inline");
    expect(root).not.toHaveClass("bg-surface", "bg-surface-subtle", "rounded-surface", "shadow-none");
  });
});
