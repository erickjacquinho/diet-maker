# Validation Report — Persistência de avaliações e acompanhamento

**Data:** 2026-09-12  
**Ambiente:** Windows, Node/npm do workspace, Vitest 4.1.10, Next.js 15.5.22, Chromium/Playwright, viewport desktop.

## Comandos reproduzíveis

```powershell
npm test -- --reporter=dot
npm test -- --reporter=dot tests/design-system/component-catalog.test.mjs
npm run type-check
npm run lint
npm run audit:atomic-design
npm run audit:z-index
npm run verify:table
npm run verify:design-system
npm run verify:design-system-legacy
npm run verify:links
npm run build
$env:PLAYWRIGHT_PORT='3100'; npm run test:browser -- tests/browser/clinical-persistence.spec.ts --workers=1
$env:PLAYWRIGHT_PORT='3101'; npm run test:browser -- tests/browser/component-adequation.spec.ts --workers=1
$env:PLAYWRIGHT_PORT='3102'; npm run test:browser -- tests/browser/diet-offline-persistence.spec.ts --workers=1
$env:PLAYWRIGHT_PORT='3103'; npm run test:browser -- tests/browser/library.spec.ts --workers=1
```

O `vitest.config.ts` usa um worker serial por padrão porque os fixtures PGlite/IndexedDB compartilham runtime local no Windows; com quatro workers o processo concorrente terminava sem diagnóstico. O catálogo de componentes deixou de ser excluído do Vitest e agora é parte do gate padrão.

## Resultado final

| Comando/área | Resultado |
|---|---|
| `npm test -- --reporter=dot` | 214 arquivos / 745 testes — passou |
| catálogo de componentes (`component-catalog.test.mjs`) | 1 arquivo / 28 testes — passou; incluído no gate padrão após a correção de configuração |
| testes direcionados da feature | domínio, migration, repositório, aplicação, workspace, perfil, consulta, acompanhamento, fronteira e performance — todos passaram |
| `npm run type-check` | passou |
| `npm run lint` | passou |
| `npm run build` | passou; compilação otimizada sem dependência de rede |
| `npm run verify:links` | passou; 476 links locais, 0 quebrados |
| `npm run audit:atomic-design` | passou; 100% (146/146) |
| `npm run audit:z-index` | passou; 0 findings |
| `npm run verify:table` | passou; 12/12 |
| `npm run verify:design-system` | passou; 0 findings bloqueantes |
| `npm run verify:design-system-legacy` | passou; 0 findings |

Os 23 testes em `src/**/__tests__` também foram executados explicitamente: 23 arquivos / 108 testes passaram. Os lotes de infraestrutura, rotas, aplicação, componentes, hooks e `tests/lib` foram repetidos serialmente para garantir isolamento; nenhum caso falhou.

## Jornada browser/offline

Os quatro specs foram executados isoladamente em portas limpas:

- `clinical-persistence.spec.ts`: 1/1 passou em 2m30s, cobrindo criação e edição isolada de avaliações, consulta por data, acompanhamento futuro/hoje/atrasado, substituição/remoção, arquivamento, isolamento, reload, offline e ausência das chaves legadas.
- `component-adequation.spec.ts`: 3/3 passaram.
- `diet-offline-persistence.spec.ts`: 1/1 passou.
- `library.spec.ts`: 2/2 passaram.

Total browser: 7/7 testes passaram. A fonte Plus Jakarta Sans foi empacotada localmente via `@fontsource/plus-jakarta-sans` nos pesos homologados 400–700; isso removeu o bloqueio anterior do `next/font/google` e tornou build/Playwright independentes da rede.

## Correções de infraestrutura/documentação

- Referências para SDDs arquivados foram ajustadas; a rastreabilidade da biblioteca passou apontando para `specs/completed/`.
- Os links do índice legado `design-system-guidelines` e `refs/dieta-db` foram corrigidos; a auditoria agora reporta zero links quebrados.
- A suíte foi tornada serial por padrão no Windows para evitar encerramento silencioso de workers durante fixtures locais.
- Os seletores do cenário clínico browser foram tornados semânticos e não ambíguos para a consulta e o combobox de acompanhamento.

## Conclusão

A implementação clínica e os gates de código, documentação, build, testes determinísticos, browser, offline e Design System estão verdes. As 24 tarefas do SDD permanecem concluídas e a análise final `speckit-converge` não possui achados corrigíveis.
