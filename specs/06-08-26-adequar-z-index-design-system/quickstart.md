# Quickstart: Verificação da Hierarquia de Camadas

**Feature**: [Adequação da Hierarquia de Camadas](spec.md)

Este roteiro deve ser executado depois que as tarefas forem implementadas pelo /speckit-implement.

## 1. Confirmar o inventário textual

A partir da raiz do repositório:

    rg -n -o "z-[A-Za-z0-9_!\\[\\]-]+" src tests --glob "*.tsx" --glob "*.ts" --glob "*.css"

A saída deve conter apenas tokens canônicos ou ocorrências explicitamente cobertas pelo contrato. O mapa central em tailwind.config.js é a única definição numérica autorizada.

## 2. Executar o auditor de camadas

Executar o comando definido nas tarefas de implementação para o validador de z-index. O resultado deve ser determinístico e, em caso de falha, informar arquivo, linha, ocorrência, regra e token esperado.

Casos negativos mínimos:

- introduzir z-10 em um componente de runtime;
- introduzir z-[999] em um teste;
- usar z-popover em DropdownMenuContent;
- usar z-overlay em SheetContent;
- usar z-modal em PopoverContent sem contexto modal.

## 3. Validar contratos de interação

Executar os testes focados de overlay e os testes já existentes de acessibilidade:

    npm test -- --run
    npm run type-check
    npm run lint

Os testes devem cobrir:

- DialogOverlay abaixo de DialogContent;
- SheetOverlay abaixo de SheetContent;
- DropdownMenu e Select em contexto padrão;
- Select e calendário dentro de Dialog;
- Popover padrão e Popover contextual modal;
- Tooltip acima dos demais overlays;
- fechamento, foco e teclado preservados.

## 4. Verificar conformidade do repositório

    npm run verify:design-system
    npm run audit:atomic-design
    npm run verify:links

A tarefa só pode ser considerada concluída quando o auditor de camadas e os verificadores existentes não apresentarem findings de camada ou de contrato documental.

## Execution evidence — 2026-08-06

- Focused layer contracts: 13/13 tests passed in `tests/design-system/z-index-contract.test.ts`, `tests/components/ui/overlay-layer-contract.test.tsx` and `tests/components/overlays-accessibility.test.tsx`.
- Focused consumers: 10/10 tests passed in Select, DatePickerField, PatientListTable, EditPatientModal and CreateRecipeModal coverage.
- `npm run lint`: passed.
- `npm run audit:z-index`: passed with 0 findings across 197 files in the current working tree.
- `npm run verify:design-system`: passed with 0 blocking findings.
- `npm run audit:atomic-design`: passed with 100% conformity.
- `npm run verify:links`: passed with 0 broken local links.
- `npm run type-check`: blocked by the unrelated untracked `tests/components/app/sidebar-navigation-adapter.test.tsx`, which imports the missing `src/app/navigation/SidebarNavigationAdapter`.
- `npm test`: exceeded the execution limit with Vitest processes still active; the timed-out processes from this execution were stopped without touching the parallel Sidebar test process.
- `npm run build`: compiled successfully, then failed during page data collection with `PageNotFoundError` for `/alimentos`; no z-index compilation error was reported.
- Final inventory confirmation: T019 passed; all baseline consumers are classified in `tests/design-system/z-index-contract.test.ts`, and the strict auditor reports no raw numeric/arbitrary layer or inline `style.zIndex` findings outside the canonical Tailwind map.
