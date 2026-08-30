import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MacroMetricCard } from "@/components/molecules/MacroMetricCard";

describe("MacroMetricCard Surface composition", () => {
  it("composes the subtle Surface while preserving macro anatomy", () => {
    const { container } = render(
      <MacroMetricCard
        label="Proteínas"
        currentValue="150g"
        targetValue="160g"
        statusBadgeText="94%"
        percentage={94}
        gPerKgRatio="2.1 g/kg"
        gPerKgMeta="2.0"
        macroColor="emerald"
      />,
    );

    expect(container.firstElementChild).toHaveClass("bg-surface-subtle", "rounded-surface", "shadow-none");
    expect(screen.getByText("Proteínas")).toBeInTheDocument();
    expect(screen.getByText("150g")).toBeInTheDocument();
    expect(screen.getByText("/ 160g")).toBeInTheDocument();
    expect(screen.getByText("94%")).toBeInTheDocument();
    expect(screen.getByText("2.1 g/kg")).toBeInTheDocument();
    expect(screen.getByText("150g").parentElement).toContainElement(screen.getByText("2.1 g/kg"));
  });
});
