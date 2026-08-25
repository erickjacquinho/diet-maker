import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/components/atoms/Avatar";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/atoms/ProgressBar";

import { Textarea } from "@/components/ui/textarea";

describe("atom states", () => {
  it("renders identity, feedback, actions, fields and progress semantically", () => {
    render(<>
      <Avatar initials="JD" />
      <Badge variant="emerald">Ativo</Badge>
      <Button variant="primary">Salvar</Button>
      <IconButton aria-label="Editar">E</IconButton>
      <Input aria-label="Nome" />
      <ProgressBar value={120} />
    </>);
    expect(screen.getByLabelText("JD")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Editar" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeEnabled();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("configures placeholder and hides placeholder on focus for input and textarea", () => {
    render(<>
      <Input aria-label="Busca" placeholder="Digite aqui..." />
      <Textarea aria-label="Observações" placeholder="Escreva observações..." />
    </>);
    const input = screen.getByRole("textbox", { name: "Busca" });
    const textarea = screen.getByRole("textbox", { name: "Observações" });

    expect(input).toHaveAttribute("placeholder", "Digite aqui...");
    expect(input.className).toContain("placeholder:text-text-muted");
    expect(input.className).toContain("focus:placeholder:text-transparent");

    expect(textarea).toHaveAttribute("placeholder", "Escreva observações...");
    expect(textarea.className).toContain("placeholder:text-text-muted");
    expect(textarea.className).toContain("focus:placeholder:text-transparent");
  });
});
