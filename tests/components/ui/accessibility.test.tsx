import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

describe("UI accessibility contract", () => {
  it("provides keyboard-focusable controls and visible names", () => {
    render(<><Button>Continuar</Button><Input aria-label="Busca" /><Separator decorative={false} /><Spinner /></>);
    expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Busca" })).toBeEnabled();
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});
