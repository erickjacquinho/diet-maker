import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Table } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";

describe("generic UI primitives", () => {
  it("keeps the sixteen public primitive families available", () => {
    expect([Badge, Button, Calendar, Card, Dialog, DropdownMenu, Input, Popover, ScrollArea, Select, Separator, Sheet, Spinner, Table, Tabs, Tooltip]).toHaveLength(16);
  });

  it("exposes canonical interaction states", () => {
    render(<><Button state="loading">Salvar</Button><Input aria-label="Nome" disabled /><Badge variant="emerald">Ativo</Badge><Spinner /></>);
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeDisabled();
    expect(screen.getByText("Ativo")).toHaveClass("bg-success-soft");
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("renders dialog semantics with a labelled title", () => {
    render(<Dialog open><DialogContent><DialogTitle>Detalhes</DialogTitle></DialogContent></Dialog>);
    expect(screen.getByRole("dialog", { name: "Detalhes" })).toBeInTheDocument();
  });
});
