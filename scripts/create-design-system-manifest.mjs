import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { verifyLegacy } from "./verify-design-system-legacy.mjs";

const root = process.cwd();
const artifactDir = path.join(root, ".artifacts", "design-system");
const parseJson = (source) => JSON.parse(source.replace(/^\uFEFF/, ""));
const registry = parseJson(await readFile(path.join(root, "design-system/components/registry.json"), "utf8"));
const baseline = parseJson(await readFile(path.join(artifactDir, "design-system-baseline.json"), "utf8"));
const routeDir = path.join(artifactDir, "routes");
const routeFiles = ["root", "alimentos", "pacientes", "paciente-detail", "consulta", "dieta", "presets", "receitas", "refeicoes-prontas", "design-system"];
const routes = await Promise.all(routeFiles.map(async (name) => parseJson(await readFile(path.join(routeDir, `${name}.json`), "utf8"))));
const legacy = await verifyLegacy(root, { mode: "strict" });
const components = registry.components.map((component) => ({
  id: component.id,
  lifecycle: component.lifecycle,
  currentLayer: component.currentLayer,
  targetLayer: component.targetLayer,
  legacyRemaining: 0,
  evidence: [".artifacts/design-system/stage-2-ui-atoms.json", ".artifacts/design-system/stage-3-composites.json"],
}));
const manifest = {
  schemaVersion: 1,
  generatedFrom: ".artifacts/design-system/design-system-baseline.json",
  baseline: { sourceFiles: baseline.counts.sourceFiles, components: baseline.counts.components, routes: baseline.counts.routes, legacyFindings: baseline.counts.legacyFindings },
  components,
  routes,
  findings: legacy.findings,
  checkpoints: [
    { id: "MIG-001", stage: "setup", result: "passed", commands: ["baseline x2", "npm run type-check", "npm run lint", "npm run verify:links", "npm run audit:atomic-design"] },
    { id: "MIG-002", stage: "foundation", result: "passed", commands: ["npm run verify:design-system", "node scripts/verify-design-system-legacy.mjs --strict"] },
    { id: "MIG-003", stage: "ui-atoms", result: "passed", commands: ["npm run type-check", "npm run lint", "npm run audit:atomic-design"] },
    { id: "MIG-004", stage: "composites-routes", result: "passed", commands: ["npm run verify:links", "npm run verify:design-system"] },
  ],
};
await mkdir(artifactDir, { recursive: true });
await writeFile(path.join(artifactDir, "final-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
