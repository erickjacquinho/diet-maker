# Relatório de validação — adequação ao design system

**Feature:** `30-08-26-adequacao-componentes-design-system`  
**Execução:** 2026-08-30/31  
**Checkpoint de início:** `1c5b9d8ef1ceada89f669c3bd7c53ef676531fcc`  
**Estado:** implementação validada no escopo; gate global de testes bloqueado e
revisões humanas ainda pendentes.

## Resultado executivo

As adequações de código, composição, migração de camadas, perfis e cadastro
foram implementadas. As 16 fontes públicas delimitadas estão catalogadas, as
cinco famílias tabulares usam a composição canônica, e os testes específicos
da feature, catálogo explícito, auditores, build e navegador passaram.

O repositório não pode ser declarado totalmente verde: `npm test` foi executado
e permaneceu sem progresso por 90 segundos, saindo com exit 1. Esse
comportamento e as falhas globais observadas já estavam registrados na baseline;
não houve relaxamento, remoção ou skip de teste para contorná-lo.

Nenhuma fonte normativa do design system, primitivo UI, token, regra, auditor,
schema, cálculo ou persistência foi alterada. A única correção posterior
encontrada no browser foi o retorno de foco do botão que abre o
`FoodSearchModal`, implementado no consumidor com ref explícita.

## Matriz FR → fonte → evidência

| Requisito | Tarefa(s) | Fonte/decisão verificada | Teste/evidência | Estado |
| --- | --- | --- | --- | --- |
| FR-001 | T001, T005, T011, T028 | Registry e perfis das 11 famílias principais | `verify:design-system`; catálogo explícito | PASS |
| FR-002 | T005, T007, T010, T016, T019, T022, T026 | MacroSummary, rows e pais consumidores | arquitetura; testes de adequação e browser | PASS |
| FR-003 | T003, T005, T011, T028 | IDs, camadas, categorias, traits, exports e consumers | contrato do catálogo; `verify:design-system` | PASS |
| FR-004 | T011, T028 | Registry reconciliado com fontes reais e baseline 71 | `component-catalog.test.mjs`; auditor de componentes | PASS |
| FR-005 | T006–T010, T012, T028 | Perfis afetados com herança, anatomia, estados, composição e aceite | suíte de catálogo: 31/31 | PASS |
| FR-006 | T005, T006, T012, T018 | Documentação e apresentação sem redefinir tokens; zero/ausência preservados | adequação de macros; legacy audit | PASS |
| FR-007 | T018–T026 | Receitas existentes para ações, seleção, overlays, dados e nutrição | 21 testes de escopo; 3 cenários browser | PASS |
| FR-008 | T019–T027 | Imports, barrels, rotas, hooks e callbacks migrados | seam arquitetural; build; regressões | PASS |
| FR-009 | T013–T030 | Nomes/roles, teclado, foco, seleção, Escape e estados assíncronos | testes de componentes e Playwright | PASS |
| FR-010 | T015, T016, T021, T023, T025, T026, T028 | `DataTable` canônico, headers, caption, rows, seleção, expansão e IDs | `verify:table`: 12/12, 0 erros/avisos | PASS |
| FR-011 | T002, T018, T023, T024, T029, T030 | Ordem/unidades/zero vs ausência e snapshot read-only | macro tests; overlay tests; browser | PASS |
| FR-012 | T002, T004, T013–T017, T027, T029–T031 | Fixtures e testes red→green antes/depois da implementação | feature scope: 7 arquivos/21 testes; browser: 3/3 | PASS no escopo |
| FR-013 | T029–T032 | Evidências browser, gates, hashes e matriz deste relatório | `evidence/browser`, `evidence/final-gates` | PASS |
| FR-014 | T028, T031, T033 | Achados de catálogo e avisos tabulares resolvidos sem supressão | DS: 0 blocking; tabela: 0 warnings | PASS no escopo |
| FR-015 | T001, T032, T034 | Checkpoint, diffs e mudanças concorrentes preservados | `baseline.md`, review e `git status` | PASS |

## Matriz NFR → fonte → evidência

| Requisito | Evidência | Estado |
| --- | --- | --- |
| NFR-001 — fontes normativas preservadas | Hashes/diff; `registry` com `schemaVersion`, categorias e traits inalterados | PASS por diff; registro de hash da baseline tem erro descrito abaixo |
| NFR-002 — desktop/a11y | Playwright em `1024×900` e `1440×900`, `reduced-motion`, teclado, foco, zoom 200% simulado | PASS nos cenários amostrados |
| NFR-003 — dados/privacidade | Fixture literal sintética e contextos descartáveis; nenhuma store pessoal acessada | PASS |
| NFR-004 — compatibilidade | DataTable/virtualização/seleção preservados; type-check, build e regressões específicas | PASS no escopo |
| NFR-005 — evidência reproduzível | Configs locais limitadas à feature, comandos e resultados persistidos em `evidence/` | PASS |
| NFR-006 — escopo da entrega | Sem commit/deploy; revisão humana permanece pendente | PASS como limite de entrega |

## Matriz SC → evidência → estado real

| Critério | Evidência | Estado |
| --- | --- | --- |
| SC-001 | Registry/perfis coerentes; catálogo e auditor DS verdes | PASS |
| SC-002 | 0 uncovered exports, 0 findings bloqueantes, perfis completos | PASS |
| SC-003 | Testes comportamentais e browser preservam operações, dados e callbacks | PASS no escopo |
| SC-004 | Achados da feature resolvidos; `npm test` global continua exit 1/bloqueado | **PARCIAL — impede sucesso global** |
| SC-005 | Nenhuma fonte protegida tem diff; browser usa apenas synthetic data | PASS, ressalva de registro de hash |
| SC-006 | 11 capturas, revisão visual do agente e teclado/foco/scroll registrados | PASS amostrado; aprovação humana pendente |

## Gates executados

O resultado detalhado está em
[`evidence/final-gates/results.md`](./evidence/final-gates/results.md). Em
resumo:

- PASS: type-check, lint, build, links, Atomic Design, z-index, legacy audit,
  design-system audit, table audit, catálogo explícito, testes específicos e
  Playwright.
- BLOQUEADO/FAIL: `npm test` global, encerrado com exit 1 após 90s sem
  progresso. A baseline já registrava falhas em
  `tests/lib/patients/legacy-cutover.test.ts`,
  `tests/app/pacientes/page-context-navigation.test.tsx`,
  `tests/design-system/legacy-audit.test.ts` e
  `tests/hooks/useDietMealActions.test.ts`, além do erro de navegação jsdom.
  O run atual não avançou o suficiente para produzir uma nova enumeração; por
  isso não se atribui nenhuma dessas falhas à feature.

## Proteções e mudanças concorrentes

O checkpoint foi preservado. A comparação do registry contra o checkpoint
confirmou `schemaVersion`, categorias e traits iguais; não houve mudança
inesperada em componente existente. As novas entradas e os campos alterados
estão limitados às fontes/componentes da feature, camadas, consumers, baseline
e perfis.

Os 20 caminhos listados em `evidence/baseline/protected-hashes.txt` foram
comparados. Dezenove coincidem. O único desvio é:

```text
src/app/globals.css :: baseline esperado ...5511 :: atual ...5517
```

`src/app/globals.css` não aparece no `git diff` nem no `git status`; o valor
incorreto está no registro da baseline. O hash não foi reescrito, e nenhuma
fonte protegida foi alterada para fazer o gate passar.

Arquivos gerados/concurrentemente modificados fora do escopo, incluindo
relatórios de auditoria, o SDD de persistência de dietas e o link de skill
existente, foram preservados e não foram usados como fonte de decisões desta
feature.

## Limitações e pendências

- O zoom de 200% foi simulado de modo controlado com
  `document.documentElement.style.zoom = '2'`; não é uma mudança de breakpoint
  nem uma configuração persistente do navegador.
- A revisão visual foi realizada pelo agente sobre as capturas geradas; não há
  aprovação humana alegada. A governança prevê dois revisores humanos.
- O caso de rejeição assíncrona da importação está coberto pelo teste de
  componente; o browser validou a abertura, vazio/long label e seleção do modal
  com sucesso.
- `npm test` global precisa ser corrigido/coordenado fora do escopo delimitado
  antes de uma declaração de conformidade global.

## Conclusão honesta

O escopo técnico da adequação está implementado e seus gates específicos estão
verdes. A entrega não deve ser descrita como “tudo passou” enquanto o gate
global `npm test` estiver bloqueado, o registro de hash da baseline não for
coordenado e as revisões humanas previstas não ocorrerem.

A convergência editorial T035 também foi concluída: `tasks.md` agora informa
explicitamente a execução técnica no escopo, sem ocultar o bloqueio global ou
as revisões humanas pendentes.
