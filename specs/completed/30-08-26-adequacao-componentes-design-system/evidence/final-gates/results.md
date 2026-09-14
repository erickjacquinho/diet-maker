# Gates finais — T031

**Data:** 2026-08-30  
**Raiz:** `C:/Programmer/diet-maker`  
**Escopo:** adequação de componentes ao design system existente; nenhuma
fundação, regra, primitivo UI, token ou auditor foi alterado.

## Resultado dos comandos

| Comando | Resultado observado |
| --- | --- |
| `npm run type-check` | PASS |
| `npm run lint` | PASS |
| `npm test` | **FAIL / bloqueado**: executado até 90s sem progresso e encerrado manualmente com exit 1. Mantém o comportamento já registrado na baseline, com falhas globais fora do escopo e avisos de navegação jsdom. Não foi usado para relaxar testes da feature. |
| `npm run build` | PASS; Next.js compilou, validou tipos, gerou 10 páginas estáticas e 4 rotas dinâmicas |
| `npm run verify:links` | PASS; 254 Markdown e 467 links locais verificados |
| `npm run audit:atomic-design` | PASS; 146/146 arquivos conformes, 0 violações |
| `npm run audit:z-index` | PASS; 0 findings em 467 arquivos |
| `npm run verify:design-system-legacy` | PASS; 0 findings legados |
| `npm run verify:design-system` | PASS; 40 fontes cobertas, 0 exports públicos descobertos, 11 categorias homologadas, 4 propostas especificadas, 0 findings bloqueantes |
| `npm run verify:table` | PASS; 12/12 alvos sem erros, 0 erros e 0 avisos |
| `npx --no-install vitest --config specs/30-08-26-adequacao-componentes-design-system/vitest.catalog.config.ts run --reporter=verbose` | PASS; 2 arquivos e 31 testes |
| `npx --no-install vitest run tests/components/component-adequation tests/architecture/component-adequation.test.ts tests/design-system/component-adequation.contract.test.ts --reporter=verbose` | PASS; 7 arquivos e 21 testes |
| `npx --no-install playwright test --config specs/30-08-26-adequacao-componentes-design-system/playwright.config.ts` | PASS; 3 cenários, com servidor próprio e contextos descartáveis |
| `git diff --check` | PASS; apenas avisos de normalização de fim de linha do Git |

## Comparação normativa

Os arquivos cobertos por `evidence/baseline/protected-hashes.txt` não possuem
`git diff` atribuível à feature. A comparação literal dos 20 hashes encontrou
19 iguais e uma divergência no registro da própria baseline:

```text
src/app/globals.css :: baseline esperado ...5511 :: arquivo atual ...5517
```

`src/app/globals.css` está sem alteração no working tree; portanto a
divergência é um valor capturado/registrado incorretamente na baseline, não uma
mudança desta implementação. O hash de baseline não foi reescrito para ocultar
o achado.

## Leitura do gate global

O resultado global não é totalmente verde por causa de `npm test`. Os testes
específicos da adequação, o catálogo explícito, type-check, lint, build,
auditorias e browser estão verdes. O bloqueio global deve permanecer explícito
para os revisores; não representa autorização para afirmar conformidade total
do repositório nem para remover os testes/falhas concorrentes.
