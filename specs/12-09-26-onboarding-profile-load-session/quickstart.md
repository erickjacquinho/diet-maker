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
5. **Sem host storage**: confirmar ausência de `idb://`, IndexedDB, localStorage, sessionStorage, cookies ou endpoints para profile/dados/drafts. Reload, fechar aba e nova origem retornam ao onboarding.
6. **Acessibilidade**: validar teclado, foco, retorno de foco do modal, labels, `aria-live`, loading, erro e viewport desktop.

Considerar a feature pronta somente quando `SC-001` a `SC-008` passarem e o round trip do arquivo não vazio funcionar entre portas/origens.
