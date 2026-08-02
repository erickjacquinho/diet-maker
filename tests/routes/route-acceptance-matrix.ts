export const routeAcceptanceMatrix = [
  { path: "/", file: "src/app/page.tsx", states: ["default", "empty", "error"] },
  { path: "/alimentos", file: "src/app/alimentos/page.tsx", states: ["default", "loading", "empty", "error"] },
  { path: "/pacientes", file: "src/app/pacientes/page.tsx", states: ["default", "empty", "error"] },
  { path: "/pacientes/[id]", file: "src/app/pacientes/[id]/page.tsx", states: ["default", "read-only", "error"] },
  { path: "/pacientes/[id]/consulta/[date]", file: "src/app/pacientes/[id]/consulta/[date]/page.tsx", states: ["default", "read-only", "empty"] },
  { path: "/pacientes/[id]/dieta/[dietaId]", file: "src/app/pacientes/[id]/dieta/[dietaId]/page.tsx", states: ["default", "loading", "error"] },
  { path: "/presets", file: "src/app/presets/page.tsx", states: ["default", "empty", "error"] },
  { path: "/receitas", file: "src/app/receitas/page.tsx", states: ["default", "empty", "error"] },
  { path: "/refeicoes-prontas", file: "src/app/refeicoes-prontas/page.tsx", states: ["default", "empty", "error"] },
  { path: "/design-system", file: "src/app/design-system/page.tsx", states: ["default", "read-only"] },
] as const;

export type RouteAcceptanceRecord = {
  path: string;
  states: readonly string[];
  components: string[];
  legacyFindings: number;
  accessibility: "passed" | "blocked";
  visualReview: "passed" | "blocked";
  behaviorPreserved: boolean;
};
