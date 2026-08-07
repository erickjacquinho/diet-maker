"use client";

import { useState } from "react";
import { ComponentSandbox } from "./ComponentSandbox";
import { PlaygroundControls } from "./PlaygroundControls";
import { ViewMode } from "./types";
import { recipes, textStyle } from "@/design-system";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/atoms/Avatar";
import { Surface } from "@/components/atoms/Surface";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { User, Activity, AlertCircle, Sparkles } from "lucide-react";

interface AtomsGalleryProps {
  viewMode: ViewMode;
}

export function AtomsGallery({ viewMode }: AtomsGalleryProps) {
  // Button State
  const [btnVariant, setBtnVariant] = useState<"default" | "destructive" | "outline" | "secondary" | "ghost" | "link">("default");
  const [btnSize, setBtnSize] = useState<"default" | "sm" | "lg" | "icon">("default");
  const [btnDisabled, setBtnDisabled] = useState(false);

  // Badge State
  const [badgeVariant, setBadgeVariant] = useState<"default" | "secondary" | "destructive" | "outline">("default");

  // Input State
  const [inputText, setInputText] = useState("Exemplo de entrada de texto...");
  const [inputDisabled, setInputDisabled] = useState(false);

  // ProgressBar State
  const [progressVal, setProgressVal] = useState(65);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Galeria de Átomos (Unidades Base de UI)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Button Showcase */}
        <div className="space-y-3">
          <ComponentSandbox
            title="Button (Botão Interativo)"
            description="Componente base para ações do usuário com suporte a estados de hover, focus e variantes primárias/secundárias."
            codeSnippet={`<Button variant="${btnVariant}" size="${btnSize}" disabled={${btnDisabled}}>Salvar Alterações</Button>`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant={btnVariant} size={btnSize} disabled={btnDisabled}>
                Salvar Alterações
              </Button>
            </div>
          </ComponentSandbox>

          <PlaygroundControls
            controls={[
              { name: "variant", label: "Variante", type: "select", options: ["default", "destructive", "outline", "secondary", "ghost", "link"], defaultValue: "default" },
              { name: "size", label: "Tamanho", type: "select", options: ["default", "sm", "lg", "icon"], defaultValue: "default" },
              { name: "disabled", label: "Desabilitado", type: "boolean", defaultValue: false },
            ]}
            values={{ variant: btnVariant, size: btnSize, disabled: btnDisabled }}
            onChange={(name, val) => {
              if (name === "variant") setBtnVariant(val);
              if (name === "size") setBtnSize(val);
              if (name === "disabled") setBtnDisabled(val);
            }}
          />
        </div>

        {/* 2. Badge Showcase */}
        <div className="space-y-3">
          <ComponentSandbox
            title="Badge (Sinalizador / Tag)"
            description="Badges para sinalização de estados de consulta, macronutrientes ou alertas."
            codeSnippet={`<Badge variant="${badgeVariant}">Ativo</Badge>`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant={badgeVariant}>Ativo</Badge>
              <Badge variant="secondary">Pendente</Badge>
              <Badge variant="destructive">Alerta</Badge>
              <Badge variant="outline">Proteína 30g</Badge>
            </div>
          </ComponentSandbox>

          <PlaygroundControls
            controls={[
              { name: "variant", label: "Variante", type: "select", options: ["default", "secondary", "destructive", "outline"], defaultValue: "default" },
            ]}
            values={{ variant: badgeVariant }}
            onChange={(_, val) => setBadgeVariant(val)}
          />
        </div>

        {/* 3. Input Showcase */}
        <div className="space-y-3">
          <ComponentSandbox
            title="Input (Campo de Texto)"
            description="Entrada de texto acessível com feedback de foco e bordas essenciais."
            codeSnippet={`<Input value="${inputText}" disabled={${inputDisabled}} />`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="w-full max-w-sm">
              <Input
                value={inputText}
                disabled={inputDisabled}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite algo..."
              />
            </div>
          </ComponentSandbox>

          <PlaygroundControls
            controls={[
              { name: "text", label: "Texto Valor", type: "text", defaultValue: inputText },
              { name: "disabled", label: "Desabilitado", type: "boolean", defaultValue: false },
            ]}
            values={{ text: inputText, disabled: inputDisabled }}
            onChange={(name, val) => {
              if (name === "text") setInputText(val);
              if (name === "disabled") setInputDisabled(val);
            }}
          />
        </div>

        {/* 4. Avatar & Surface Showcase */}
        <div className="space-y-3">
          <ComponentSandbox
            title="Avatar & Surface (Perfil e Container)"
            description="Avatar com iniciais/imagem e Surface com bordas elevadas."
            codeSnippet={`<Avatar name="Carlos Silva" />`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="flex items-center gap-4">
              <Avatar name="Carlos Silva" size="lg" />
              <Avatar name="Ana Maria" size="md" />
              <Surface className="p-3">
                <span className={textStyle("data-id")}>Surface Container</span>
              </Surface>
            </div>
          </ComponentSandbox>
        </div>

        {/* 5. ProgressBar Showcase */}
        <div className="space-y-3 col-span-1 lg:col-span-2">
          <ComponentSandbox
            title="ProgressBar (Barra de Progresso de Metas)"
            description="Barra gráfica de preenchimento para metas de calorias e macronutrientes."
            codeSnippet={`<ProgressBar value={${progressVal}} max={100} />`}
            showCode={viewMode === "dev-spec"}
          >
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Meta Diária de Calorias</span>
                <span>{progressVal}%</span>
              </div>
              <ProgressBar value={progressVal} max={100} />
            </div>
          </ComponentSandbox>

          <PlaygroundControls
            controls={[
              { name: "progress", label: "Progresso %", type: "select", options: ["25", "50", "65", "85", "100"], defaultValue: "65" },
            ]}
            values={{ progress: String(progressVal) }}
            onChange={(_, val) => setProgressVal(Number(val))}
          />
        </div>
      </div>
    </div>
  );
}
