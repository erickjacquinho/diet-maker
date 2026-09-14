# Quickstart: validação mínima

Executar após a implementação:

```powershell
npm run lint
npm run test
npm run test:browser
```

## Cenários obrigatórios

1. **Guard**: abrir `/pacientes` em contexto vazio; não mostrar conteúdo/sidebar e redirecionar para `/Home`. Abrir `/Home` com sessão não mostra sidebar e redireciona após ativação.
2. **Criar**: em `/Home`, confirmar somente Nome/Telefone, validar nome vazio, escolher um destino `.nutridiet`, escrever o primeiro arquivo e liberar a rota apenas após sucesso.
3. **Carregar**: abrir o mesmo arquivo em outra porta/origem; confirmar profile, dados completos e a presença de `Jacques Regiani`. Arquivo inválido/cancelado não altera sessão anterior.
4. **Sincronizar**: concluir uma operação explícita, observar `syncing → synced`, reabrir o arquivo e conferir a alteração. Negar/remover permissão deve manter a sessão e mostrar `paused` sem fallback.
5. **Sem host storage de domínio**: confirmar ausência de `idb://`, bancos locais de domínio, localStorage/sessionStorage/cookies/endpoints para profile, dados ou drafts. O único registro permitido no host é o handle permissionado e o nome do arquivo ativo para retomada na mesma origem; o conteúdo continua no `.nutridiet`. Reload/reabertura na mesma origem devem tentar retomar o save; nova origem retorna ao onboarding.
6. **Acessibilidade**: validar teclado, foco, retorno de foco do modal, labels, `aria-live`, loading, erro e viewport desktop.

## Addendum — retomada do save ativo

O contrato foi ampliado em 2026-09-13: depois de criar ou carregar um profile, a
referência permissionada ao arquivo ativo é persistida no IndexedDB do navegador.
Ao iniciar novamente na mesma origem, a aplicação recupera o handle, valida a
permissão de leitura e carrega o arquivo automaticamente. Se o navegador exigir
um gesto, o onboarding apresenta “Reabrir último save”; se o arquivo tiver sido
removido, a referência é descartada e o usuário pode selecionar outro arquivo.

Essa associação não é backup nem fonte de dados clínicos: o runtime continua em
PGlite `memory://` e o envelope `.nutridiet` continua sendo a única persistência
durável do conteúdo.

Considerar a feature pronta somente quando `SC-001` a `SC-008` passarem e o round trip do arquivo não vazio funcionar entre portas/origens.

## Evidências de execução — 2026-09-13

Executado em `C:\Programmer\diet-maker`:

- `npm run lint` — passou.
- `npm run type-check` — passou.
- `npm run test` — passou: 228 arquivos e 829 testes.
- `npm run test:browser` — passou: 15 cenários E2E em 4,4 minutos, incluindo guard, criação, load cross-origin, backup, sincronização, ausência de host storage e jornadas clínicas/biblioteca.
- `npm run build` — passou com `NODE_OPTIONS=--max-old-space-size=4096`; build Next.js 15.5.22 compilado e 14 rotas geradas. A primeira tentativa encerrou com código genérico do worker durante a checagem de tipos; a repetição com memória explícita passou.
- `npm run verify:design-system -- --strict` — passou: 40 fontes cobertas, 0 exports visuais descobertos e 0 findings bloqueantes.
- `npm run verify:design-system-legacy -- --strict` — passou: 0 findings legados em 295 arquivos.

Os cenários automatizados registrados antes deste addendum confirmavam o gate,
o isolamento entre origens e o runtime somente em memória. A retomada automática
do handle na mesma origem foi implementada neste addendum e requer validação
browser específica, que não foi executada nesta rodada.
