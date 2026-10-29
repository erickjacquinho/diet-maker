// States describe the route contract; references do not certify execution or full state coverage.
export interface PageRoute {
  path: string;
  file: string;
  kind: 'public' | 'account' | 'clinical' | 'dynamic' | 'alias';
  states: readonly string[];
  parameters: readonly string[];
  destination?: string;
  evidence: { kind: 'direct' | 'indirect' | 'static' | 'gap'; files: readonly string[] };
}

export const routeAcceptanceMatrix: readonly PageRoute[] = [
  {"path": "/", "file": "src/app/page.tsx", "kind": "public", "states": ["default"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/online-layout.spec.ts"]}},
  {"path": "/login", "file": "src/app/login/page.tsx", "kind": "public", "states": ["default", "submitting", "validation", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/online-auth.spec.ts"]}},
  {"path": "/criar-conta", "file": "src/app/criar-conta/page.tsx", "kind": "public", "states": ["default", "submitting", "validation", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/online-auth.spec.ts"]}},
  {"path": "/recuperar-senha", "file": "src/app/recuperar-senha/page.tsx", "kind": "public", "states": ["default", "submitting", "validation", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/online-auth.spec.ts"]}},
  {"path": "/redefinir-senha", "file": "src/app/redefinir-senha/page.tsx", "kind": "public", "states": ["default", "submitting", "validation", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/online-auth.spec.ts"]}},
  {"path": "/dashboard", "file": "src/app/dashboard/page.tsx", "kind": "account", "states": ["no-save", "loading", "empty", "error", "ready"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/components/app/dashboard.test.tsx", "tests/browser/settings-saves.spec.ts"]}},
  {"path": "/home", "file": "src/app/home/page.tsx", "kind": "alias", "states": ["redirect"], "parameters": [], "evidence": {"kind": "static", "files": ["tests/routes/behavior-preservation.test.tsx"]}, "destination": "/dashboard"},
  {"path": "/saves", "file": "src/app/saves/page.tsx", "kind": "alias", "states": ["redirect"], "parameters": [], "evidence": {"kind": "static", "files": ["tests/routes/behavior-preservation.test.tsx"]}, "destination": "/dashboard"},
  {"path": "/calendario", "file": "src/app/calendario/page.tsx", "kind": "alias", "states": ["redirect"], "parameters": [], "evidence": {"kind": "static", "files": ["tests/routes/behavior-preservation.test.tsx"]}, "destination": "/agenda"},
  {"path": "/agenda", "file": "src/app/agenda/page.tsx", "kind": "clinical", "states": ["default", "loading", "empty", "error"], "parameters": [], "evidence": {"kind": "indirect", "files": ["tests/browser/settings-saves.spec.ts"]}},
  {"path": "/pacientes", "file": "src/app/pacientes/page.tsx", "kind": "clinical", "states": ["default", "loading", "empty", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/clinical-persistence.spec.ts"]}},
  {"path": "/pacientes/[id]", "file": "src/app/pacientes/[id]/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "not-found", "error"], "parameters": ["id"], "evidence": {"kind": "direct", "files": ["tests/app/pacientes/patient-profile-read.test.tsx"]}},
  {"path": "/pacientes/[id]/dietas", "file": "src/app/pacientes/[id]/dietas/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "empty", "error"], "parameters": ["id"], "evidence": {"kind": "direct", "files": ["tests/app/pacientes/patient-history-pages.test.tsx"]}},
  {"path": "/pacientes/[id]/avaliacoes", "file": "src/app/pacientes/[id]/avaliacoes/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "empty", "error"], "parameters": ["id"], "evidence": {"kind": "direct", "files": ["tests/app/pacientes/patient-history-pages.test.tsx"]}},
  {"path": "/pacientes/[id]/avaliacao/[assessmentId]", "file": "src/app/pacientes/[id]/avaliacao/[assessmentId]/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "validation", "read-only", "error"], "parameters": ["id", "assessmentId"], "evidence": {"kind": "direct", "files": ["tests/app/pacientes/assessment-workspace.test.tsx"]}},
  {"path": "/pacientes/[id]/consulta/[date]", "file": "src/app/pacientes/[id]/consulta/[date]/page.tsx", "kind": "dynamic", "states": ["default", "read-only", "empty"], "parameters": ["id", "date"], "evidence": {"kind": "static", "files": ["tests/routes/navigation.test.tsx"]}},
  {"path": "/pacientes/[id]/dieta/[dietaId]", "file": "src/app/pacientes/[id]/dieta/[dietaId]/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "read-only", "error"], "parameters": ["id", "dietaId"], "evidence": {"kind": "direct", "files": ["tests/app/pacientes/diet-editor-persistence.test.tsx", "tests/app/pacientes/diet-editor-load-errors.test.tsx"]}},
  {"path": "/pacientes/[id]/dieta/[dietaId]/ciclo", "file": "src/app/pacientes/[id]/dieta/[dietaId]/ciclo/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "error"], "parameters": ["id", "dietaId"], "evidence": {"kind": "indirect", "files": ["tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx"]}},
  {"path": "/pacientes/[id]/dieta/[dietaId]/pdf", "file": "src/app/pacientes/[id]/dieta/[dietaId]/pdf/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "error"], "parameters": ["id", "dietaId"], "evidence": {"kind": "indirect", "files": ["tests/components/app/diet-pdf-settings.test.tsx"]}},
  {"path": "/pacientes/[id]/dieta/[dietaId]/pagina", "file": "src/app/pacientes/[id]/dieta/[dietaId]/pagina/page.tsx", "kind": "dynamic", "states": ["loading", "ready", "error"], "parameters": ["id", "dietaId"], "evidence": {"kind": "gap", "files": []}},
  {"path": "/presets", "file": "src/app/presets/page.tsx", "kind": "clinical", "states": ["default", "loading", "empty", "error"], "parameters": [], "evidence": {"kind": "indirect", "files": ["tests/browser/component-adequation.spec.ts"]}},
  {"path": "/alimentos", "file": "src/app/alimentos/page.tsx", "kind": "clinical", "states": ["default", "loading", "empty", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/library.spec.ts"]}},
  {"path": "/receitas", "file": "src/app/receitas/page.tsx", "kind": "clinical", "states": ["default", "loading", "empty", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/library.spec.ts"]}},
  {"path": "/refeicoes", "file": "src/app/refeicoes/page.tsx", "kind": "clinical", "states": ["default", "loading", "empty", "error"], "parameters": [], "evidence": {"kind": "direct", "files": ["tests/browser/library.spec.ts"]}},
];
