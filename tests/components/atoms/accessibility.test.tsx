import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconButton } from "@/components/atoms/IconButton";
import { ProgressBar } from "@/components/atoms/ProgressBar";

describe("atom accessibility", () => {
  it("requires a name for icon-only actions and exposes progress values", () => {
    render(<><IconButton aria-label="Excluir">x</IconButton><ProgressBar value={50} /></>);
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemin", "0");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100");
  });
});
