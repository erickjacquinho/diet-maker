# Quickstart: Validação do Alinhamento de Primitivos

Este guia será usado após a implementação. Ele não executa alterações e não substitui a aprovação humana do SDD.

## Prerequisites

- Node.js e dependências do projeto instalados.
- Worktree preservado para comparação das mudanças relacionadas.
- Feature directory: `specs/05-08-26-alinhamento-primitivos-componentes`.

## 1. Validate the specification artifacts

Confirmar que existem:

- `spec.md`
- `plan.md`
- `research.md`
- `data-model.md`
- `contracts/component-family-contract.md`
- `checklists/requirements.md`
- `checklists/architecture.md`
- `tasks.md`

## Baseline before implementation (2026-08-05)

The repository already contained unrelated worktree changes. The scoped baseline was:

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run type-check` | FAIL (pre-existing) | `MetricBox.tsx` imports missing `SurfaceDensity`; `diet-builder-template.surface.test.tsx` passes `density: 1` although the type accepts `2 \| 3`. |
| `npm run lint` | PASS | Exit code 0. |
| `npm run audit:atomic-design` | PASS | 65 files scanned, 0 violations. |
| `npm run verify:design-system` | FAIL (pre-existing) | Registry baseline was 48 vs 49 discovered sources; `src/components/ui/breadcrumb.tsx` was unregistered. |
| `npm run test -- --run` | INCOMPLETE | Vitest started but did not finish within the observed command window. |

These failures are tracked separately from changes introduced by this feature.

## Final validation (2026-08-06)

The implementation validation ran with the repository's default Vitest configuration (`maxWorkers: 8`, `testTimeout: 30s`):

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run type-check` | PASS | Exit code 0. |
| `npm run lint` | PASS | Exit code 0. |
| `npm run audit:atomic-design` | PASS | 66 files scanned, 0 violations, 100% compliance. |
| `npm run verify:design-system` | PASS | 40 current source files covered, 0 uncovered exports, 0 blocking findings. |
| `npm run test -- --run` | PASS | 69 test files, 259 tests passed. |

The primitive-family registry contains 16 unique families. DropdownMenu, Input, Select, Spinner, Tabs and Calendar consumer entries were reconciled against current imports; stale proposed references were removed from active consumer lists. All primitive-family statuses are `conforming` after the complete validation suite passed.

## 2. Run static project validation

```powershell
npm run type-check
npm run lint
npm run audit:atomic-design
npm run verify:design-system
```

Expected outcomes:

- TypeScript sem erros.
- ESLint sem erros introduzidos no escopo.
- Nenhuma dependência ascendente ou violação de camada.
- Todos os exports visuais públicos relacionados ao escopo cobertos pelo Design System.

## 3. Run component tests

```powershell
npm run test -- --run
```

Expected outcomes:

- As 16 famílias primitivas possuem cobertura de contrato apropriada.
- Calendar e Spinner não ficam excluídos por listas estáticas.
- Testes compound cobrem raiz, filhos públicos e estados aplicáveis.
- Testes de acessibilidade mantêm teclado, foco, nome/role/value e requisitos de loading/error/empty aplicáveis.

## 4. Inspect architecture and catalog coverage

Revisar manualmente:

1. `src/components/ui` não importa atoms, molecules, organisms, templates ou domínio.
2. `src/components/molecules` não importa nem reexporta organisms.
3. Cada atom mantido possui valor adicional documentado.
4. Consumidores de DropdownMenu, Select, Calendar e Spinner aparecem no registry.
5. Overrides repetidos de identidade foram convertidos em variantes ou wrappers com contrato.
6. Nenhum arquivo sob `.agents/rules/` foi alterado.

## 5. Completion evidence

Registrar no handoff:

- resultado dos comandos acima;
- famílias migradas e status de cada uma;
- wrappers removidos, consolidados ou mantidos;
- consumidores marcados como `migration-required`, se houver;
- divergências visuais ou acessíveis restantes;
- confirmação de que as rules permaneceram inalteradas.
