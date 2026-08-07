"use client";

import { ComponentSandbox } from "./ComponentSandbox";
import { MetricBox } from "@/components/molecules/MetricBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { ViewMode } from "./types";
import { Sparkles, Calendar, UtensilsCheck, UserCheck, Flame, Scale, Activity } from "lucide-react";

interface CompositionGalleryProps {
  viewMode: ViewMode;
}

export function CompositionGallery({ viewMode }: CompositionGalleryProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Composições Completas & Visão do Cliente
        </h2>
      </div>

      <div className="space-y-8">
        {/* Composition 1: Ficha de Prescrição Nutricional */}
        <ComponentSandbox
          title="Composição 1: Card de Resumo de Prescrição do Paciente"
          description="Combinação de Avatar, BadgeHeader, MetricBoxes e ProgressBar formando a visualização real de prescrição."
          codeSnippet="<PatientPrescriptionCard />"
          showCode={viewMode === "dev-spec"}
        >
          <div className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-md dark:border-stone-800 dark:bg-stone-900 space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white font-bold text-sm">
                  AP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">Ana Paula Mendes</h3>
                    <Badge variant="secondary">Consulta Ativa</Badge>
                  </div>
                  <p className="text-xs text-stone-500">Dieta Normocalórica · 1.850 kcal/dia</p>
                </div>
              </div>

              <Button size="sm" variant="default">
                <UtensilsCheck className="h-4 w-4 mr-1.5" />
                <span>Imprimir Dieta</span>
              </Button>
            </div>

            {/* Macro Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricBox
                label="Proteínas"
                value="135g"
                tone="protein"
                size="compact"
                caption="30% VET"
                icon={<Activity className="h-3.5 w-3.5" />}
              />
              <MetricBox
                label="Carboidratos"
                value="190g"
                tone="carbohydrate"
                size="compact"
                caption="45% VET"
                icon={<Flame className="h-3.5 w-3.5" />}
              />
              <MetricBox
                label="Gorduras"
                value="50g"
                tone="fat"
                size="compact"
                caption="25% VET"
                icon={<Scale className="h-3.5 w-3.5" />}
              />
              <MetricBox
                label="Meta Calórica"
                value="1.850 kcal"
                tone="default"
                size="compact"
                caption="100% atingido"
              />
            </div>

            {/* Daily Goal Bar */}
            <div className="space-y-2 rounded-xl bg-stone-50 p-4 dark:bg-stone-800/50">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-700 dark:text-stone-300">Adesão do Paciente (Últimos 7 dias)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">92% de Conformidade</span>
              </div>
              <ProgressBar value={92} max={100} />
            </div>
          </div>
        </ComponentSandbox>
      </div>
    </div>
  );
}
