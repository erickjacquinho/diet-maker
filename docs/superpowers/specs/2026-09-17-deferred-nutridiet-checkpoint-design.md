# Checkpoints diferidos do perfil `.nutridiet`

## Objetivo

Manter formulários e edições rápidos, sem serializar e regravar todo o arquivo
`.nutridiet` a cada mudança. O navegador conserva a base de trabalho local e o
arquivo associado recebe checkpoints consolidados em momentos explícitos.

## Alternativas consideradas

1. **Regravar o arquivo após toda mutação confirmada.** Mantém o arquivo sempre
   atualizado, mas o custo de qualquer alteração cresce com o tamanho completo
   da Conta.
2. **Usar o banco local como única fonte e exportar o arquivo somente sob
   demanda.** É a opção mais barata, mas não preserva o arquivo associado como
   save portátil principal do fluxo escolhido.
3. **Banco local persistente com checkpoints diferidos.** Mantém a edição no
   navegador, agrupa mudanças por um marcador `dirty` e regrava o arquivo apenas
   em Salvar, `Ctrl+S`, troca de tela ou sincronização manual. Esta é a decisão
   aprovada.

## Arquitetura aprovada

- O PGlite deixa de usar `memory://` no runtime do navegador e passa a persistir
  uma única Conta local no armazenamento do navegador.
- Campos ainda em edição permanecem no estado do formulário ou no
  `DietDraftStore`; digitação não altera o arquivo `.nutridiet`.
- Casos de uso confirmados gravam somente as linhas afetadas no PGlite e marcam
  a sessão como `dirty`.
- O checkpoint exporta uma visão consistente dos dados confirmados e substitui
  o conteúdo do arquivo associado uma única vez.
- O `.nutridiet` continua sendo o save portátil associado ao perfil. O banco
  local é a cópia de trabalho persistente e permite recuperar alterações e
  drafts no mesmo navegador.

Não haverá salvamento por temporizador, a cada tecla, em `beforeunload`, em
segundo plano na nuvem ou em múltiplos arquivos/pastas.

## Gatilhos de checkpoint

Um checkpoint ocorre somente quando a sessão está `dirty`:

1. o usuário aciona **Salvar** ou `Ctrl+S` em um fluxo que confirma dados;
2. a rota muda depois de existirem alterações confirmadas ainda não exportadas;
3. o usuário solicita novamente a sincronização após uma falha.

Alterações não confirmadas não são promovidas automaticamente ao histórico ao
trocar de tela. A navegação apenas consolida no arquivo aquilo que os casos de
uso já confirmaram no banco.

Chamadas concorrentes compartilham a mesma promessa de checkpoint. Se novas
mutações ocorrerem durante a exportação, a sessão continua `dirty` e o próximo
gatilho gera outro checkpoint; nenhum loop automático é criado.

## Inicialização e recuperação

Ao reabrir a aplicação, a sessão tenta primeiro a base persistente do navegador.
O arquivo lembrado fornece a associação para checkpoints e portabilidade, sem
substituir uma base local mais recente. Selecionar ou restaurar outro
`.nutridiet` continua validando o envelope e substituindo a base inteira em uma
transação.

Se o navegador for encerrado com um formulário não confirmado, somente o draft
que já foi persistido localmente poderá ser recuperado. A aplicação não tenta
usar escrita assíncrona de arquivo durante `beforeunload`, pois o navegador não
garante sua conclusão.

## Falhas

- Falha ao gravar o arquivo não desfaz uma transação local já confirmada.
- A sessão fica `paused/dirty`, mostra o erro existente de sincronização e
  permite nova tentativa.
- Um checkpoint só muda para `synced/clean` se nenhuma mutação posterior tiver
  ocorrido desde o início da exportação.
- Criar um perfil ainda exige a primeira gravação válida do arquivo antes de
  ativar a sessão.
- Restauração inválida ou parcial mantém a base anterior.

## Compatibilidade e documentação

O envelope, a validação e o conteúdo do `.nutridiet` permanecem iguais. Saves
atuais são dados de teste, portanto não haverá migrador da base `memory://`.
As decisões de persistência devem ser atualizadas para distinguir o save
portátil associado do banco local de trabalho e registrar os novos gatilhos.

## Validação

Uma verificação de integração deve provar que:

- várias mutações confirmadas podem resultar em uma única exportação;
- digitação e autosave de draft não escrevem o arquivo;
- Salvar e mudança de rota exportam quando `dirty` e não exportam quando clean;
- falha mantém a base local, a sessão `dirty/paused` e permite retry;
- reabertura usa a base local persistente sem importar por cima um arquivo mais
  antigo;
- o round-trip manual do `.nutridiet` continua válido.

