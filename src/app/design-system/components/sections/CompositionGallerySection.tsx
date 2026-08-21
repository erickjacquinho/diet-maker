"use client";

import { PatientBadgeHeader } from "@/components/molecules";
import { MetricBoxGroup } from "@/components/organisms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/atoms";
import { textStyle } from "@/design-system";
import { Activity, Check } from "lucide-react";

export function CompositionGallerySection() {
  return (
    <section className="flex flex-col gap-6" aria-labelledby="compositions-heading">
      <h2 className="sr-only">Recipes e estados</h2>
      <div className="flex items-end justify-between gap-6 border-b border-border-divider pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <p className={textStyle("overline")}>Composição</p>
            <h2 className={textStyle("section-title")}>O sistema em contexto clínico</h2>
            <p className={textStyle("body-secondary")}>Composições pequenas, reais e reconhecíveis para mostrar como as camadas se encaixam no fluxo de nutrição.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className={textStyle("card-title")}>Resumo de metas</h3>
              <p className={textStyle("caption")}>Molecules + organisms + tokens nutricionais.</p>
            </div>
            <Badge variant="emerald">Ativo</Badge>
          </div>
          <MetricBoxGroup items={[
            { label: "Proteína", value: "135g", tone: "protein", caption: "30% VET" },
            { label: "Carboidrato", value: "190g", tone: "carbohydrate", caption: "45% VET" },
            { label: "Gordura", value: "50g", tone: "fat", caption: "25% VET" },
            { label: "Calorias", value: "1.850", tone: "default", caption: "VET diário" },
          ] as const} />
          <div className="flex items-center justify-between gap-4">
            <span className={textStyle("body-secondary")}>Adesão dos últimos 7 dias</span>
            <strong className={textStyle("validation-success")}>92%</strong>
          </div>
          <ProgressBar value={92} colorVariant="emerald" />
        </Card>

        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className={textStyle("card-title")}>Contexto do paciente</h3>
              <p className={textStyle("caption")}>Identidade, navegação e ação no mesmo bloco.</p>
            </div>
            <Badge variant="blue">Consulta</Badge>
          </div>
          <PatientBadgeHeader initials="CS" name="Carlos Silva" weightKg={82.5} goalDescription="Hipertrofia · plano normocalórico" />
          <div className="flex items-center justify-between gap-3 border-t border-border-divider pt-4">
            <span className={textStyle("body-secondary")}>Última atualização: hoje</span>
            <Button variant="primary" size="compact"><Check data-icon="inline-start" aria-hidden="true" />Abrir ficha</Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
