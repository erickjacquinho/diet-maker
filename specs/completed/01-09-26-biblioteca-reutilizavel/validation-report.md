# Validation Report: Biblioteca reutilizável por Conta

**Data:** 2026-09-01
**Branch:** `backend-refactor`
**Feature:** `specs/01-09-26-biblioteca-reutilizavel`

## Resultado

A etapa 4 está implementada e validada dentro do escopo aprovado. A
implementação cobre alimentos customizados, receitas, refeições prontas,
integração no `DietDraft`, snapshots, isolamento por Conta e o corte das
chaves legadas.

## Evidências executadas

| Verificação | Resultado |
| --- | --- |
| TypeScript (`tsc --noEmit --incremental false`) | PASS |
| ESLint (`npm run lint`) | PASS |
| Vitest direcionado da biblioteca | 35 arquivos / 57 testes PASS |
| Vitest global (`npm test`) | 204 arquivos / 709 testes PASS |
| Chromium serial (`playwright ... --workers=1`) | 6 testes PASS em 2,7 min |
| `verify:links` | 470 links locais, 0 quebrados |
| `audit:atomic-design` | 146/146 arquivos conformes, 100% |
| `audit:z-index --strict` | 0 findings em 517 arquivos |
| `verify:table --strict` | 12/12 alvos, 0 erros e 0 warnings |
| `verify:design-system --strict` | 0 findings bloqueantes; 40 exports cobertos |
| `next build` | PASS; 10 páginas estáticas geradas |

## Correção encontrada na validação

Uma expectativa antiga em `tests/lib/diets/legacy-cutover.test.ts` exigia
ausência textual dos componentes de receita/refeição no arquivo inteiro do
seletor. A etapa 4 adiciona esses componentes no modo opt-in do editor. O
teste foi ajustado para verificar o contrato correto: modo padrão TACO-only,
flag `enableLibrarySources` explícita e rota de consulta somente leitura.
Após o ajuste, arquitetura e dietas passaram em 15 arquivos / 33 testes.

## Limites registrados

- A tentativa do helper Python do browser encontrou uma falha de resolução do
  `npx` no Windows; o mesmo contrato foi executado diretamente pelo binário
  local do Playwright, com 6/6 cenários aprovados.
- Não foram implementados nesta etapa migração de registros antigos de
  localStorage, exportação, restauração, backup, sincronização ou avaliação e
  acompanhamento da etapa 5.

## Decisão de escopo

Registros antigos e os módulos históricos de store permanecem fora do fluxo
canônico para evitar migração implícita e dual-write. A persistência oficial
da biblioteca é exclusivamente relacional, account-scoped, e as referências
inseridas na dieta são cópias profundas com snapshot próprio.
