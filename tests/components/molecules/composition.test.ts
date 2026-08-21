import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const molecules = ["AutoKcalSection", "DietModeSwitcher", "FoodSearchModal", "MacroMetricCard", "MealItemRow", "PatientBadgeHeader", "ReadOnlyDietModal", "RecipeCard", "RecipeIngredientRow", "SidebarBrand", "SidebarNavItem", "SidebarQuickActions", "SidebarUserProfile", "TacoSearchInput"];

describe("molecule composition contract", () => {
  it("keeps all catalogued molecules present and layered", () => {
    for (const name of molecules) {
      const source = readFileSync(`src/components/molecules/${name}.tsx`, "utf8");
      if (!name.startsWith("Sidebar")) expect(source).toMatch(/@\/components\/(ui|atoms)|@\/design-system|\.\.\/(ui|atoms)/);
    }
  });
});
