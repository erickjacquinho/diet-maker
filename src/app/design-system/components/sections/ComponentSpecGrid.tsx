"use client";

import { useState, type ReactNode } from "react";
import { Avatar, ProgressBar, Surface, SelectField } from "@/components/atoms";
import { ActionDropdown, DatePickerField, MetricBox, PatientBadgeHeader, TacoSearchInput } from "@/components/molecules";
import { MacroTrackerHeader, MetricBoxGroup } from "@/components/organisms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { textStyle } from "@/design-system";

export function ComponentSpecCard({ id, layer, category, children, description }: { id: string; layer: string; category: string; children: ReactNode; description: string }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="gap-2 border-b border-border-divider p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate">{id}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="secondary">{layer}</Badge>
        </div>
        <span className={textStyle("legal")}>{category}</span>
      </CardHeader>
      <CardContent className="flex min-h-40 items-center justify-center bg-surface-subtle p-6">
        {children}
      </CardContent>
    </Card>
  );
}

export function ComponentSpecGrid() {
  const [inputValue, setInputValue] = useState("Paciente em acompanhamento");
  const [foodQuery, setFoodQuery] = useState("Frango grelhado");
  const [date, setDate] = useState("2026-08-07");
  const [selectValue, setSelectValue] = useState("cutting");

  return (
    <div className="grid grid-cols-3 gap-4">
      <ComponentSpecCard id="ui-button" layer="UI" category="Ações" description="Primitivo de comando com receitas canônicas.">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="standard">Salvar dieta</Button>
          <Button variant="secondary" size="standard">Cancelar</Button>
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="ui-input" layer="UI" category="Campos" description="Entrada textual com foco e altura do sistema.">
        <div className="flex w-full max-w-form flex-col gap-2">
          <label htmlFor="design-system-input" className={textStyle("field-label")}>Nome do paciente</label>
          <Input id="design-system-input" value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="atom-select-field" layer="Atoms" category="Campos + seleção" description="Componente pai padronizado de seleção para formulários e filtros.">
        <div className="w-full max-w-form">
          <SelectField
            id="design-system-select"
            label="Objetivo Clínico"
            value={selectValue}
            onValueChange={setSelectValue}
            placeholder="Selecione o objetivo"
            options={[
              { value: "cutting", label: "Emagrecimento / Cutting" },
              { value: "bulking", label: "Hipertrofia / Bulking" },
              { value: "manutencao", label: "Manutenção / Saúde" },
            ]}
          />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="molecule-action-dropdown" layer="Molecules" category="Ações compostas" description="Menu suspenso de ações contextuais sem estilos manuais.">
        <ActionDropdown
          triggerLabel="Mais ações"
          items={[
            { id: "whatsapp", label: "Compartilhar WhatsApp", onSelect: () => {} },
            { id: "pdf", label: "Exportar PDF", onSelect: () => {} },
          ]}
        />
      </ComponentSpecCard>

      <ComponentSpecCard id="ui-badge" layer="UI" category="Feedback" description="Status compacto com tons semânticos.">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="blue">Em acompanhamento</Badge>
          <Badge variant="emerald">Meta atingida</Badge>
          <Badge variant="amber">Atenção</Badge>
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="atom-avatar" layer="Atoms" category="Dados e identidade" description="Identidade visual compacta para contexto de paciente.">
        <div className="flex items-center gap-3">
          <Avatar initials="AM" size="sm" variant="inner" />
          <Avatar initials="CS" size="md" variant="emerald" />
          <Avatar initials="DR" size="lg" variant="charcoal" />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="atom-progress-bar" layer="Atoms" category="Loading e progresso" description="Progresso visual com cor semântica do produto.">
        <div className="flex w-full max-w-form flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className={textStyle("body-small-strong")}>Adesão da semana</span>
            <span className={textStyle("metric-compact")}>82%</span>
          </div>
          <ProgressBar value={82} colorVariant="emerald" />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="atom-surface" layer="Atoms" category="Superfícies" description="Superfície de produto baseada na receita canônica.">
        <Surface variant="subtle" density="standard" className="flex w-full max-w-form flex-col gap-2">
          <span className={textStyle("card-title")}>Resumo do paciente</span>
          <span className={textStyle("body-secondary")}>Acompanhamento ativo e dados prontos para revisão.</span>
        </Surface>
      </ComponentSpecCard>

      <ComponentSpecCard id="molecule-metric-box" layer="Molecules" category="Nutrição" description="Métrica nutricional composta com tom de macro.">
        <div className="grid w-full grid-cols-3 gap-3">
          <MetricBox label="Proteína" value="135g" tone="protein" caption="30% VET" />
          <MetricBox label="Carboidrato" value="190g" tone="carbohydrate" caption="45% VET" />
          <MetricBox label="Gordura" value="50g" tone="fat" caption="25% VET" />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="molecule-taco-search-input" layer="Molecules" category="Campos + nutrição" description="Busca real para a base TACO.">
        <div className="w-full max-w-form">
          <TacoSearchInput value={foodQuery} onChange={(event) => setFoodQuery(event.target.value)} />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="molecule-date-picker-field" layer="Molecules" category="Campos + seleção" description="Campo de data real com calendário e popover.">
        <div className="w-full max-w-form">
          <DatePickerField id="design-system-date" label="Data da consulta" value={date} onValueChange={setDate} />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="molecule-patient-badge-header" layer="Molecules" category="Dados e navegação" description="Cabeçalho de paciente usado nas telas clínicas.">
        <div className="w-full">
          <PatientBadgeHeader initials="AM" name="Ana Paula Mendes" weightKg={68.4} goalDescription="Redução de gordura · acompanhamento ativo" showAdjustGoals={false} compact />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="organism-metric-box-group" layer="Organisms" category="Nutrição + estrutura" description="Grupo de métricas composto pela implementação do produto.">
        <div className="w-full">
        <MetricBoxGroup items={[
            { label: "Proteína", value: "135g", tone: "protein", caption: "30% VET" },
            { label: "Carboidrato", value: "190g", tone: "carbohydrate", caption: "45% VET" },
            { label: "Gordura", value: "50g", tone: "fat", caption: "25% VET" },
          ] as const} />
        </div>
      </ComponentSpecCard>

      <ComponentSpecCard id="organism-macro-tracker-header" layer="Organisms" category="Nutrição + dados" description="Contexto clínico completo com métricas de macro.">
        <div className="w-full">
          <MacroTrackerHeader
            patientInitials="AM"
            patientName="Ana Paula Mendes"
            patientWeightKg={68.4}
            patientGoalDescription="Redução de gordura · 1.850 kcal/dia"
            showPatientContext={false}
            metrics={[
              { label: "Proteína", currentValue: "135g", targetValue: "150g", percentage: 90, macroColor: "blue", statusBadgeText: "OK", statusBadgeVariant: "blue" },
              { label: "Carboidrato", currentValue: "190g", targetValue: "210g", percentage: 90, macroColor: "amber", statusBadgeText: "OK", statusBadgeVariant: "amber" },
              { label: "Gordura", currentValue: "50g", targetValue: "60g", percentage: 83, macroColor: "teal", statusBadgeText: "OK", statusBadgeVariant: "teal" },
              { label: "Calorias", currentValue: "1.720", targetValue: "1.850 kcal", percentage: 93, macroColor: "emerald", statusBadgeText: "Meta", statusBadgeVariant: "emerald" },
            ]}
          />
        </div>
      </ComponentSpecCard>
    </div>
  );
}
