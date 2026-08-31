# Evidência de navegador — T029/T030

**Data:** 2026-08-30  
**Runner:** Playwright já instalado no projeto (`npx --no-install playwright`)  
**Configuração:** `specs/30-08-26-adequacao-componentes-design-system/playwright.config.ts`

## Execução

```powershell
npx --no-install playwright test --config specs/30-08-26-adequacao-componentes-design-system/playwright.config.ts
```

Resultado final: **3 testes passaram** (`.last-run.json` reportou `passed`). O
harness usou um servidor Next próprio na porta `3217`,
`reuseExistingServer: false`, um worker e contextos descartáveis do Playwright;
nenhuma instalação/update ou perfil persistente foi usado.

## Matriz coberta

- Catálogo: as 5 famílias e 16 IDs afetados foram pesquisados no catálogo real,
  confirmando nome e camada; execução em `1024×900` e `1440×900`.
- Histórico: estado vazio, criação de registro sintético, linha de paciente com
  semântica implícita de tabela, link focável, tabelas vazias e perfil; execução
  em `1024×900` e `1440×900`.
- Ciclos/modais: seleção por teclado, ações independentes, busca vazia com nome
  longo, seleção TACO, quantidade preservada na substituição, `Escape` com
  retorno de foco, salvamento, modal somente leitura, região com
  `overflow-y: auto` e importação anterior; execução em `1440×900`.
- `prefers-reduced-motion: reduce` foi aplicado nos três testes.
- Zoom de 200% foi exercitado por `document.documentElement.style.zoom = '2'`
  nos cenários de catálogo em 1024px e perfil em 1440px; isso é uma simulação
  controlada do zoom visual para preservar a viewport desktop do produto.

## Revisão visual manual

Foram revisadas visualmente as capturas de catálogo, perfil/histórico, busca e
substituição e somente leitura. As capturas mostram tokens/superfícies do tema
vigente, cabeçalhos e rodapés de modal acessíveis, unidades nutricionais, dados
sintéticos preservados e ausência de edição no snapshot somente leitura.

As imagens produzidas estão nos diretórios de resultado deste run:

- `test-results/*/design-system-*.png`
- `test-results/*/patients-*.png`
- `test-results/*/patient-profile-*.png`
- `test-results/*/food-search-*.png`
- `test-results/*/diet-search-*.png`
- `test-results/*/read-only-*.png`
- `test-results/*/import-*.png`

Não foram aprovados snapshots automaticamente; a revisão foi feita sobre as
capturas geradas pelo próprio teste.
