# Contract: onboarding, guard e sincronização

Contrato interno entre UI, sessão e adaptador de arquivo. Não há API HTTP.

## Rotas

| Rota/estado | Comportamento |
|---|---|
| `/Home` sem sessão | Mostra somente Criar profile e Carregar profile, sem sidebar/conteúdo interno. |
| `/Home` com sessão | Redireciona para a rota interna padrão. |
| Qualquer outra rota com `active`/`paused` | Mostra o shell existente e usa os repositórios da sessão. |
| Qualquer outra rota sem sessão | Não mostra conteúdo do app e redireciona para `/Home`. |
| `/` | Redireciona para `/Home` sem criar profile/runtime persistido. |

## Criar profile

1. Abre modal acessível com somente `Nome` e `Telefone`, lado a lado, e botão abaixo.
2. Nome é obrigatório; telefone é opcional; loading impede duplo submit.
3. O comando abre `showSaveFilePicker`, cria runtime `memory://`, insere a conta, exporta e escreve o primeiro envelope.
4. Só após a escrita a sessão fica ativa e navega para a rota interna. Cancelamento/falha deixa `/Home` sem sessão parcial.

## Carregar profile

1. Abre diretamente `showOpenFilePicker` para `.nutridiet`.
2. Lê e valida o arquivo fora da sessão atual: appId, versões, chaves, tipos, IDs, profile e relações.
3. Importa atomicamente em novo runtime `memory://`, mantendo `accountId` e todos os dados confirmados.
4. Associação com permissão concedida fica `synced`; permissão negada deixa a sessão utilizável como `paused`, com aviso e ação explícita para reautorizar.
5. Cancelamento, arquivo inválido ou falha não altera a sessão anterior.

## Porta mínima

`SaveFilePort` deve expor apenas `chooseExisting()`, `chooseNew()`, `read()`, `requestWritePermission()` e `write()`. O fake dessa porta serve aos testes; o adaptador browser-only usa File System Access API. O handle nunca entra em domínio, SSR, envelope ou storage do host.

## Sincronização

Cada salvar/confirmar explícito segue:

```text
commit memory:// → export envelope completo → write(handle) → synced
```

Falha mantém a sessão em memória e marca `paused`; não usa IndexedDB, localStorage, sessionStorage, cookie, endpoint, upload ou download como fallback. Digitação e drafts não sincronizam.

## Feedback obrigatório

Loading com `aria-live` e controles desabilitados; erros acionáveis ligados aos campos; foco visível e retorno de foco no modal; status textual de sincronização pausada; suporte a teclado e viewport desktop conforme o design system.

## Verificação mínima

Um fixture válido contendo `Jacques Regiani` deve carregá-lo e exibi-lo em outra porta/origem. Reload e nova origem devem voltar ao onboarding sem recuperar dados do host.
