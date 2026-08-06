import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Surface } from "@/components/atoms/Surface";

describe("Surface accessibility contract", () => {
  it("forwards semantic state attributes for loading and read-only regions", () => {
    render(
      <Surface
        role="region"
        aria-label="Resumo nutricional"
        aria-busy="true"
        aria-readonly="true"
        data-state="loading"
      >
        Conteúdo carregando
      </Surface>,
    );

    const region = screen.getByRole("region", { name: "Resumo nutricional" });
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveAttribute("aria-readonly", "true");
    expect(region).toHaveAttribute("data-state", "loading");
  });

  it("does not steal focus or keyboard behavior from an interactive child", () => {
    const onClick = vi.fn();

    render(
      <Surface variant="subtle">
        <button type="button" onClick={onClick}>
          Ajustar meta
        </button>
      </Surface>,
    );

    const button = screen.getByRole("button", { name: "Ajustar meta" });
    button.focus();
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    fireEvent.click(button);

    expect(button).toHaveFocus();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
