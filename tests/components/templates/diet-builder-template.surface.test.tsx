import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DietBuilderTemplate } from "@/components/templates/DietBuilderTemplate";

describe("DietBuilderTemplate Surface composition", () => {
  it("keeps the diet context in a canonical Surface shell", () => {
    render(
      <DietBuilderTemplate
        patientId="patient-1"
        macroTrackerData={{
          patientInitials: "AL",
          patientName: "Ana Lima",
          patientWeightKg: 68,
          patientGoalDescription: "Manutenção",
          metrics: [],
        }}
        mealsData={[]}
        dietModeProps={{
          mode: "simple",
          onModeChange: vi.fn(),
          variationsCount: 2,
          onVariationsCountChange: vi.fn(),
          variations: [],
          activeVariationId: "var-1",
          onSelectVariation: vi.fn(),
        }}
      />,
    );

    const contextCard = screen.getByTestId("diet-context-card");
    expect(contextCard.firstElementChild).toHaveClass("bg-surface", "rounded-surface", "shadow-none");
    expect(screen.getByText(/Nenhuma Refeição Cadastrada/i)).toBeInTheDocument();
  });
});
