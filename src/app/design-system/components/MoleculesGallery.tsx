"use client";

import { useState } from "react";
import { ComponentSandbox } from "./ComponentSandbox";
import { PlaygroundControls } from "./PlaygroundControls";
import { ViewMode } from "./types";
import { MetricBox, MetricBoxTone, MetricBoxSize } from "@/components/molecules/MetricBox";
import { DatePickerField } from "@/components/molecules/DatePickerField";
import { Input } from "@/components/ui/input";
import { Layers, Flame, Scale, Activity, Search } from "lucide-react";

interface MoleculesGalleryProps {
  viewMode: ViewMode;
}

export function MoleculesGallery({ viewMode }: MoleculesGalleryProps) {
  // MetricBox State
  const [metricTone, setMetricTone] = useState<MetricBoxTone>("protein");
  const [metricSize, setMetricSize] = useState<MetricBoxSize>("standard");
  const [metricValue, setMetricValue] = useState("145g");
  const [metricLabel, setMetricLabel] = useState("Proteína Meta");

  // DatePicker State
  const [selectedDate, setSelectedDate] = useState("2026-08-07");

  // Search Input State
  const [searchQuery, setSearchQuery] = useState("Frango grelhado");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
        <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Galeria de Moléculas (Composições Funcionais)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. MetricBox Showcase */}
        <div className="space-y-3 col-span-1 lg:col-span-2">
          <ComponentSandbox
            title="MetricBox (Cartão de Métricas de Macronutrientes)"
            description="Exibe calorias, gramas de proteínas, carboidratos ou gorduras com tons semânticos."
            codeSnippet={`<MetricBox label="${metricLabel}" value="${metricValue}" tone="${metricTone}" size="${metricSize}" caption="85% atingido" />`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 w-full">
              <MetricBox
                label={metricLabel}
                value={metricValue}
                tone={metricTone}
                size={metricSize}
                caption="85% atingido"
                icon={<Activity className="h-4 w-4" />}
              />
              <MetricBox
                label="Carboidratos"
                value="210g"
                tone="carbohydrate"
                size={metricSize}
                caption="Dentro da meta"
                icon={<Flame className="h-4 w-4" />}
              />
              <MetricBox
                label="Gorduras"
                value="55g"
                tone="fat"
                size={metricSize}
                caption="Ideal"
                icon={<Scale className="h-4 w-4" />}
              />
              <MetricBox
                label="Calorias Totais"
                value="1.950 kcal"
                tone="default"
                size={metricSize}
                caption="Alvo 2.100 kcal"
              />
            </div>
          </ComponentSandbox>

          <PlaygroundControls
            controls={[
              { name: "tone", label: "Tom Semântico", type: "select", options: ["protein", "carbohydrate", "fat", "default", "success", "warning"], defaultValue: "protein" },
              { name: "size", label: "Tamanho", type: "select", options: ["compact", "standard", "large", "hero"], defaultValue: "standard" },
              { name: "value", label: "Valor exibido", type: "text", defaultValue: "145g" },
              { name: "label", label: "Rótulo", type: "text", defaultValue: "Proteína Meta" },
            ]}
            values={{ tone: metricTone, size: metricSize, value: metricValue, label: metricLabel }}
            onChange={(name, val) => {
              if (name === "tone") setMetricTone(val);
              if (name === "size") setMetricSize(val);
              if (name === "value") setMetricValue(val);
              if (name === "label") setMetricLabel(val);
            }}
          />
        </div>

        {/* 2. TacoSearchInput / Search Bar Showcase */}
        <div className="space-y-3">
          <ComponentSandbox
            title="TacoSearchInput (Busca Alimentos TACO)"
            description="Campo de busca integrado com ícone e sugestão de digitação rápida."
            codeSnippet={`<Input placeholder="Buscar alimento..." value="${searchQuery}" />`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tabela TACO..."
                className="pl-9"
              />
            </div>
          </ComponentSandbox>
        </div>

        {/* 3. DatePickerField Showcase */}
        <div className="space-y-3">
          <ComponentSandbox
            title="DatePickerField (Seletor de Data de Consulta)"
            description="Seleção de data de avaliação física ou acompanhamento."
            codeSnippet={`<DatePickerField id="demo-date" label="Data da Consulta" value="${selectedDate}" onValueChange={setSelectedDate} />`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="w-full max-w-sm">
              <DatePickerField
                id="demo-date"
                label="Data da Consulta"
                value={selectedDate}
                onValueChange={(val: string) => setSelectedDate(val)}
              />
            </div>
          </ComponentSandbox>
        </div>
      </div>
    </div>
  );
}
