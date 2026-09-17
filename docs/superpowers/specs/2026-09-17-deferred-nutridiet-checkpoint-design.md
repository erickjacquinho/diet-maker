# Checkpoints diferidos do perfil `.nutridiet`

## Objetivo

Manter formulários e edições rápidos, sem serializar e regravar todo o arquivo
`.nutridiet` a cada mudança. O arquivo é o save principal e autoritativo do
perfil. O navegador conserva uma área de trabalho local e o arquivo associado
recebe checkpoints consolidados em momentos explícitos.

## Alternativas consideradas

1. **Regravar o arquivo após toda mutação confirmada.** Mantém o arquivo sempre
   atualizado, mas o custo de qualquer alteração cresce com o tamanho completo
   da Conta.
2. **Usar o banco local como única fonte e exportar o arquivo somente sob
   demanda.** É a opção mais barata, mas não preserva o arquivo associado como
   save portátil principal do fluxo escolhido.
3. **Arquivo principal com área de trabalho local e checkpoints diferidos.**
   Mantém a edição no navegador, agrupa mudanças por um marcador `dirty` e
   regrava o arquivo principal apenas em Salvar, `Ctrl+S`, troca de tela ou
   sincronização manual. Esta é a decisão aprovada.

## Arquitetura aprovada

- O `.nutridiet` é a fonte principal e autoritativa dos dados confirmados do
  perfil. Um checkpoint só está concluído depois que a substituição do arquivo
  termina com sucesso.
- O PGlite deixa de usar `memory://` no runtime do navegador e passa a manter
  uma única área de trabalho local no armazenamento do navegador.
- Campos ainda em edição permanecem no estado do formulário ou no
  `DietDraftStore`; digitação não altera o arquivo `.nutridiet`.
- Casos de uso gravam somente as linhas afetadas na área de trabalho PGlite e
  marcam a sessão como `dirty`; esses dados permanecem pendentes até o próximo
  checkpoint do arquivo principal.
- O checkpoint exporta uma visão consistente dos dados confirmados e substitui
  o conteúdo do arquivo associado uma única vez.
- O banco local é cache, área de trabalho e recuperação de alterações pendentes
  no mesmo navegador. Ele não substitui o `.nutridiet` como save principal.

Não haverá salvamento por temporizador, a cada tecla, em `beforeunload`, em
segundo plano na nuvem ou em múltiplos arquivos/pastas.

## Otimização das telas

O crescimento da Conta não pode fazer a lista de pacientes nem o perfil
individual carregar todos os históricos em memória.

### Lista de pacientes

- A consulta retorna os pacientes da página atual e os campos já exibidos pela
  interface.
- Contagens, última dieta, atividade recente e as duas avaliações mais recentes
  são calculadas em lote no banco, sem uma consulta por paciente.
- Nenhuma dieta completa, refeição, alimento ou snapshot nutricional é hidratado
  para montar a lista.
- Busca, ordenação, filtros e paginação devem ocorrer no banco quando o volume
  ultrapassar a página visível.

### Perfil individual do paciente

- Dietas e avaliações usam a mesma experiência da `DataTable` da lista de
  alimentos, mas com paginação real no banco. Cada consulta traz no máximo 25
  registros e uma contagem separada para os controles de página.
- A paginação da interface não pode receber previamente o histórico inteiro e
  apenas aplicar `slice`; isso reduziria a renderização sem reduzir consulta e
  memória.
- Cada dieta confirmada mantém um resumo derivado com calorias, macronutrientes,
  metas, refeições, dias do ciclo, estado e datas necessárias para a tabela.
- O resumo é atualizado na mesma transação que confirma a dieta. A tela não
  recalcula todo o cardápio nem percorre snapshots de alimentos para listar o
  histórico.
- Refeições, alimentos, alternativas e snapshots completos são carregados
  somente quando o usuário abre o cardápio de uma dieta.
- Alterar cadastro, avaliação ou acompanhamento atualiza apenas o bloco afetado;
  não recarrega o histórico de dietas.

### Limite de custo

Abrir uma tela deve depender do tamanho da página solicitada, e não da quantidade
total de pacientes, dietas, avaliações, refeições ou itens cadastrados. O custo
que ainda cresce com toda a Conta fica restrito ao checkpoint do `.nutridiet`,
executado somente nos gatilhos definidos neste documento.

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

Ao reabrir a aplicação, a sessão carrega o `.nutridiet` associado como último
save concluído. Se a área de trabalho do navegador tiver mudanças pendentes do
mesmo perfil e da mesma revisão do arquivo, elas são recuperadas como `dirty` e
continuam aguardando checkpoint; não passam a ser tratadas como já salvas.
Selecionar ou restaurar outro `.nutridiet` continua validando o envelope e
substituindo a área de trabalho inteira em uma transação.

Se o navegador for encerrado com um formulário não confirmado, somente o draft
que já foi persistido localmente poderá ser recuperado. A aplicação não tenta
usar escrita assíncrona de arquivo durante `beforeunload`, pois o navegador não
garante sua conclusão.

## Falhas

- Falha ao gravar o arquivo preserva a alteração na área de trabalho, mas ela
  continua pendente e ainda não integra o save principal.
- A sessão fica `paused/dirty`, mostra o erro existente de sincronização e
  permite nova tentativa sem reconstruir a alteração.
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
- reabertura parte do arquivo principal e recupera separadamente mudanças locais
  pendentes compatíveis, mantendo a sessão `dirty`;
- o round-trip manual do `.nutridiet` continua válido.
- a lista de pacientes não hidrata históricos completos nem executa consultas
  por paciente;
- o perfil busca no máximo 25 resumos por página e abre o conteúdo completo de
  uma dieta somente sob demanda;
- o resumo persistido mantém equivalência com os cálculos nutricionais atuais.
