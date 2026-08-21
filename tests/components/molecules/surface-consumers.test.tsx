import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MealItemRow } from "@/components/molecules/MealItemRow";
import { RecipeCard } from "@/components/molecules/RecipeCard";

const recipe = {
  id: "recipe-1",
  name: "Arroz com frango",
  category: "Almoço",
  servings: 2,
  instructions: "Misture e sirva.",
  ingredients: [
    {
      foodId: "food-1",
      name: "Arroz",
      amountGrams: 100,
      proteinG: 3,
      carbsG: 28,
      fatsG: 1,
      kcal: 130,
    },
  ],
  createdAt: "2026-08-05T00:00:00.000Z",
};

describe("Surface molecule consumers", () => {
  it("composes RecipeCard root geometry without changing recipe content", () => {
    const { container } = render(<RecipeCard recipe={recipe} />);

    expect(container.firstElementChild).toHaveClass("bg-surface", "rounded-surface", "shadow-none");
    expect(screen.getByText("Arroz com frango")).toBeInTheDocument();
    expect(screen.getByText(/Valores por 1 porção/)).toBeInTheDocument();
  });

  it("composes MealItemRow with the compact subtle surface and keeps controls", () => {
    const { container } = render(
      <MealItemRow
        name="Arroz"
        kcal={130}
        protein={3}
        carbs={28}
        fats={1}
        quantityGrams={100}
        onRemove={() => undefined}
      />,
    );

    expect(container.firstElementChild).toHaveClass("bg-surface-subtle", "rounded-surface", "shadow-none", "p-3");
    expect(screen.getByText("Arroz")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover Arroz" })).toBeInTheDocument();
  });
});
