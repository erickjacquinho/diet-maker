import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MacroTrackerHeader } from "@/components/organisms/MacroTrackerHeader";
import { MealCardContainer } from "@/components/organisms/MealCardContainer";

describe("Surface organism consumers", () => {
  it("uses Surface for the MacroTrackerHeader section shell", () => {
    const { container } = render(
      <MacroTrackerHeader
        patientInitials="AL"
        patientName="Ana Lima"
        patientWeightKg={68}
        patientGoalDescription="Manutenção"
        metrics={[]}
        showPatientContext={false}
      />,
    );

    expect(container.firstElementChild).toHaveClass("bg-surface", "rounded-surface", "shadow-none");
  });

  it("uses Surface for the MealCardContainer shell while preserving empty content", () => {
    const { container, getByText } = render(
      <MealCardContainer
        title="Café da manhã"
        time="08:00"
        kcal={420}
        proteinG={24}
        carbsG={48}
        fatsG={14}
        items={[]}
      />,
    );

    expect(container.firstElementChild).toHaveClass("bg-surface", "rounded-surface", "shadow-none");
    expect(getByText(/Nenhum alimento nesta refeição/i)).toBeInTheDocument();
  });
});
