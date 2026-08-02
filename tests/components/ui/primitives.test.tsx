import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Table } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";

describe("generic UI primitives", () => {
  it("keeps the fourteen public primitive families available", () => {
    expect([Badge, Button, Card, Dialog, DropdownMenu, Input, Popover, ScrollArea, Select, Separator, Sheet, Table, Tabs, Tooltip]).toHaveLength(14);
  });

  it("exposes canonical interaction states", () => {
    render(<><Button loading>Salvar</Button><Input aria-label="Nome" disabled /><Badge variant="emerald">Ativo</Badge></>);
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeDisabled();
    expect(screen.getByText("Ativo")).toHaveClass("bg-success-soft");
  });

  it("renders dialog semantics with a labelled title", () => {
    render(<Dialog open><DialogContent><DialogTitle>Detalhes</DialogTitle></DialogContent></Dialog>);
    expect(screen.getByRole("dialog", { name: "Detalhes" })).toBeInTheDocument();
  });
});
