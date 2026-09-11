# Validation report: Dietas — rascunho, salvamento e histórico

Data da execução: 2026-08-31
Branch: `backend-refactor`
Node: `v22.23.1`
npm: `10.9.8`

## Dependências

`npm ls decimal.js @playwright/test fake-indexeddb --depth=0` confirmou:

- `decimal.js@10.6.0`
- `@playwright/test@1.62.1`
- `fake-indexeddb@6.2.5`

A instalação exigiu `--legacy-peer-deps` porque `eslint-config-next@16.3.0`
declara `eslint >=9`, enquanto o projeto fixa `eslint@8.57.1`. O npm reporta 5
vulnerabilidades high na árvore atual; `npm audit fix` não foi executado para
evitar atualização fora do escopo.

## Revalidação final de fechamento

- `npm test -- --run` — PASS: 179 arquivos e 677 testes.
- `npm run type-check` — PASS.
- `npm run lint` — PASS.
- `npm run test:browser -- --workers=1` — PASS: 4/4 cenários, em Chromium,
  usando servidor dedicado na porta 3100 e timeout global de 120 s.
- `npm run build` com `NEXT_PRIVATE_BUILD_WORKER=1` — PASS; 13 rotas geradas.

## Verificações direcionadas

Passaram:

- contratos, precisão decimal, nutrição, TACO, migration, lock, draft store,
  repositório, validação, confirmação, readers, cópia, descarte e arquivo;
- `tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx` e
  `tests/app/pacientes/dedicated-carb-cycling-page.test.tsx`;
- perfil/histórico, tabela, modal somente leitura, importação, overlays,
  `useDietBuilderPage`, `useSaveShortcut`, cálculos, busca TACO e boundaries;
- validação final dos grupos corrigidos: 4 arquivos, 20 testes, todos verdes.
- bateria isolada do feature: 32 arquivos, 121 testes, todos verdes.

## Comandos de qualidade

- `npm run type-check` — passou no baseline e nos arquivos da feature.
- `npm run lint` — passou.
- `npm run audit:atomic-design` — passou: 148 arquivos, 0 violações.
- `npm run verify:design-system` — passou: 40 fontes atuais cobertas, 0
  exports visuais públicos descobertos, 11 categorias homologadas, 4 propostas
  especificadas e 0 findings bloqueadores.
- `npm run verify:table -- --target src/components/organisms/patient/PatientDietsTable.tsx --strict` — passou, com 1 warning preexistente sobre `MacroSummary` não catalogado.
- `npm run verify:table -- --target src/components/organisms/diets/ImportPreviousDietModal.tsx --strict` — passou sem warnings.
- `npm run verify:links` — passou: 244 documentos Markdown e 458 links locais.
- `npm run verify:design-system-legacy` — passou: 0 findings em 258 arquivos.
- Repassagem final dos boundaries/inventário legacy: 4 arquivos, 10 testes,
  todos verdes.
- Após a inclusão do teste dedicado do editor, a repetição de `npm run
  type-check` ficou bloqueada por um único erro em
  `tests/design-system/component-adequation.contract.test.ts:65`, arquivo não
  versionado da feature paralela: binding `code` implicitamente `any`. Não há
  erro apontando para os arquivos desta feature; a alteração foi preservada sem
  intervenção.

## Browser e build

- `npm run test:browser -- --workers=1` — passou: 4 cenários Chromium;
  confirmou catálogo, histórico, ciclo/busca/substituição, persistência após
  reload, segunda aba bloqueada e execução fora da rede em runtime preparado.
- `npm run build` — uma execução concorrente com o browser terminou com código
  de worker opaco `4294967295`; a repetição sequencial com
  `$env:NEXT_PRIVATE_BUILD_WORKER='1'` passou, gerando todas as 13 rotas.
- Repetição final de `npm run build` com o mesmo worker sequencial passou após a
  correção de IDs de itens colados.
- O Vitest foi configurado para excluir `tests/browser/**`; specs Playwright
  são executados exclusivamente pelo script `test:browser`.

## Suíte completa

`npm test -- --run` executou 677 testes em 179 arquivos; todos passaram. Os
dois bloqueios anteriormente registrados pertenciam ao estado intermediário
da adequação de componentes e não se reproduzem no estado final revalidado.

## Falhas injetadas cobertas

Os testes cobrem revisão fora de ordem, quota/abort do draft, paciente
arquivado, validação mínima, conflito de versão, rollback por filho, resultado
incerto, limpeza pendente, descarte condicional, callback atrasado e segunda
aba. Nenhuma dessas falhas produziu mutação confirmada indevida.

## Limites aceitos

O runtime continua local-first e sem exportador/backup. A compatibilidade de
tipos e helpers puros legados permanece apenas onde não há persistência; não há
dual write, fallback de storage legado ou leitura histórica embutida no fluxo
canônico de dieta.
