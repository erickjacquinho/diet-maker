"use client";

import { useState } from "react";
import { ComponentSandbox } from "./ComponentSandbox";
import { ViewMode } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Utensils, Calendar, FileText } from "lucide-react";

interface OrganismsGalleryProps {
  viewMode: ViewMode;
}

export function OrganismsGallery({ viewMode }: OrganismsGalleryProps) {
  const [activeDietMode, setActiveDietMode] = useState<"prescribed" | "calculated">("prescribed");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
        <LayoutGrid className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Galeria de Organismos (Blocos de Aplicação Montados)
        </h2>
      </div>

      <div className="space-y-6">
        {/* 1. DietModeSwitcher Showcase */}
        <ComponentSandbox
          title="DietModeSwitcher (Alternador Prescrito vs Calculado)"
          description="Bloco de controle de alto nível para comutar entre meta calculada e dieta prescrita."
          codeSnippet={`<DietModeSwitcher mode="${activeDietMode}" onChange={setActiveDietMode} />`}
          showCode={viewMode === "dev-spec"}
        >
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <Utensils className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Modo de Exibição</span>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {activeDietMode === "prescribed" ? "Dieta Prescrita ao Paciente" : "Valores Calculados de Meta"}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-800">
              <button
                type="button"
                onClick={() => setActiveDietMode("prescribed")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeDietMode === "prescribed"
                    ? "bg-blue-700 text-white shadow"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
                }`}
              >
                Prescrito
              </button>
              <button
                type="button"
                onClick={() => setActiveDietMode("calculated")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeDietMode === "calculated"
                    ? "bg-blue-700 text-white shadow"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
                }`}
              >
                Calculado
              </button>
            </div>
          </div>
        </ComponentSandbox>

        {/* 2. PatientBadgeHeader Organism Showcase */}
        <ComponentSandbox
          title="PatientBadgeHeader (Cabeçalho do Paciente)"
          description="Organismo de topo da ficha do paciente agregando nome, objetivo, foto e ações rápidas."
          codeSnippet={`<PatientBadgeHeader name="Carlos Eduardo Silva" age={34} goal="Hipertrofia" />`}
          showCode={viewMode === "dev-spec"}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 w-full">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-950 dark:text-blue-300 text-lg">
                CS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Carlos Eduardo Silva</h3>
                  <Badge variant="outline">34 anos</Badge>
                </div>
                <p className="text-xs text-stone-500">Objetivo: Hipertrofia · Peso Atual: 82.5 kg · Altura: 1.78m</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="compact">
                <FileText className="h-4 w-4 mr-1.5" />
                <span>Exportar PDF</span>
              </Button>

              <Button variant="primary" size="compact">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Nova Avaliação</span>
              </Button>
            </div>
          </div>
        </ComponentSandbox>
      </div>
    </div>
  );
}
