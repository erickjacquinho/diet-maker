# Validation Report — Backup manual simples

**Data:** 2026-09-12  
**Ambiente:** Windows, Node/npm do workspace, Vitest 4.1.10, Next.js 15.5.22, Chromium/Playwright, viewport desktop.

## Comandos executados

```powershell
npm test -- --reporter=dot
npm run type-check
npm run lint
npm run audit:atomic-design
npm run audit:z-index
npm run verify:table
npm run verify:design-system
npm run verify:design-system-legacy
npm run verify:links
npm run build
$env:PLAYWRIGHT_PORT='3104'; npm run test:browser -- tests/browser/backup-persistence.spec.ts --workers=1
```

## Resultado

| Comando/área | Resultado |
|---|---|
| Vitest serial completo | 221 arquivos / 805 testes — passou |
| Type-check | passou |
| Lint | passou |
| Atomic Design | 100% — 146/146 arquivos conformes |
| Z-index | 0 achados |
| Adequação de tabelas | 12/12 alvos sem erros ou avisos |
| Catálogo Design System | 40 fontes cobertas, 0 exports visuais descobertos, 0 bloqueios |
| Auditoria Design System legado | 0 achados |
| Browser backup/offline/rollback | 4/4 testes passaram |
| Build | passou; páginas estáticas e dinâmicas compiladas |
| Links locais | validado após a criação deste relatório |

## Cobertura do fluxo

- Exportação gera JSON UTF-8 com extensão `.nutridiet`, captura as 17 tabelas e não inclui drafts.
- Exportação funciona offline depois do aquecimento dos recursos locais e não cria requests de rede durante a ação.
- Arquivo inválido é rejeitado antes da confirmação e sem escrita.
- Restauração informa substituição total, ausência de mesclagem, ausência de senha/criptografia e responsabilidade de guarda.
- Rascunhos editáveis bloqueiam a restauração sem apagar o payload.
- Restauração confirmada usa substituição transacional; falhas após deleção ou inserção preservam a base anterior.
- Após a restauração confirmada, a aplicação recarrega o contexto.
- A UI usa somente o caso de uso de backup; não acessa PGlite, Drizzle, IndexedDB de drafts ou armazenamento legado.

## Observações

Os avisos `act(...)` e a mensagem `Not implemented: navigation to another Document`
emitidos por alguns testes são ruído preexistente do conjunto de testes/jsdom e
não representam falhas: todos os 805 testes terminaram aprovados.

O hook obrigatório configurado em `.specify/extensions.yml` referencia
`speckit-implement`, mas esse executável não está disponível no PATH deste
workspace. A execução foi roteada pela invocação explícita de `$sdd-implement`,
com a limitação registrada no `implementation-log.md`.
