import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

describe("overlay accessibility contract", () => {
  it("uses Radix primitives for focus management and dismissal", () => {
    for (const file of ["dialog", "sheet", "popover", "select", "dropdown-menu", "tooltip"]) {
      const source = readFileSync(`src/components/ui/${file}.tsx`, "utf8");
      expect(source).toMatch(/@radix-ui\/react-/);
      expect(source).toMatch(/Portal|Content|Trigger/);
    }
    const calendar = readFileSync('src/components/ui/calendar.tsx', 'utf8');
    expect(calendar).toContain('CalendarDayButton');
    expect(calendar).toContain('data-selected-single');
    for (const file of ["FoodSearchModal", "ReadOnlyDietModal"]) {
      const source = readFileSync(`src/components/molecules/${file}.tsx`, "utf8");
      expect(source).toContain("Dialog");
      expect(source).toMatch(/onClose|onOpenChange/);
    }
  });

  it("keeps modal content above its backdrop while preserving Escape dismissal", async () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Camada acessível</DialogTitle>
          <button type="button">Ação</button>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Camada acessível" });
    expect(dialog).toHaveClass("z-modal");
    expect(document.body.querySelector('[data-state="open"].z-overlay')).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("does not introduce arbitrary layer values in the primitive sources", () => {
    const rawRaisedPattern = new RegExp("\\bz-" + "10\\b");
    const arbitraryPattern = new RegExp("\\bz-" + "\\[");
    const inlineStyle = ["style", "zIndex"].join(".");

    for (const file of ["dialog", "sheet", "popover", "select", "dropdown-menu", "tooltip"]) {
      const source = readFileSync(`src/components/ui/${file}.tsx`, "utf8");
      expect(source).not.toMatch(rawRaisedPattern);
      expect(source).not.toMatch(arbitraryPattern);
      expect(source).not.toContain(inlineStyle);
    }
  });
});
