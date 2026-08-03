import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/components/atoms/Avatar";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { ProgressBar } from "@/components/atoms/ProgressBar";

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
});
