# Feature Specification: Biblioteca reutilizável por Conta

**Feature Branch**: `backend-refactor`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Etapa 4 da persistência local: implementar a Biblioteca reutilizável com alimentos customizados, receitas e refeições prontas no banco relacional canônico por Conta. A TACO permanece dataset somente leitura. Substituir os stores legados em localStorage sem migração e sem dual-write. Persistir versões, status ACTIVE/ARCHIVED, snapshots nutricionais e escopo accountId; integrar seleção de receitas/refeições ao DietDraft sem alterar dietas já salvas. Criar o SDD e seus artefatos de planejamento; não implementar código nesta etapa."

## Overview

O nutricionista precisa manter uma biblioteca própria de dados nutricionais e
preparações reutilizáveis para montar novas dietas com segurança. A biblioteca
deve pertencer à Conta local, respeitar a origem dos dados e preservar o que já
foi usado em uma prescrição.

Esta etapa entrega alimentos customizados, receitas e refeições prontas. A
TACO continua sendo uma fonte de referência do sistema e não é duplicada na
Conta. Dados legados dos stores locais são considerados dados de teste e não
serão migrados.

## User Scenarios & Testing

### User Story 1 - Manter alimento customizado (Priority: P1)

O nutricionista cadastra um alimento próprio do consultório, informa sua base
de medida e valores nutricionais, e pode reutilizá-lo em receitas, refeições
prontas e novas dietas.

**Why this priority**: Alimentos customizados são a unidade fundamental da
biblioteca e permitem representar produtos, preparações e informações que não
estão disponíveis na TACO.

**Independent Test**: Criar, consultar, editar, arquivar e excluir um alimento
customizado em uma Conta de teste, verificando validação, versionamento,
isolamento e preservação de usos anteriores.

**Acceptance Scenarios**:

1. **Given** uma Conta ativa e dados nutricionais válidos, **When** o
   nutricionista salva um alimento customizado, **Then** ele aparece como item
   ativo da biblioteca da Conta e pode ser usado em novas composições.
2. **Given** um alimento customizado ativo, **When** o nutricionista altera
   seus dados e salva, **Then** a versão é incrementada e novos usos recebem a
   nova versão.
3. **Given** um alimento usado por uma receita, refeição pronta ou snapshot
   clínico, **When** o nutricionista o arquiva, **Then** ele deixa de ser opção
   para novas inserções, mas os usos existentes continuam legíveis.
4. **Given** duas Contas distintas, **When** uma delas tenta consultar ou
   alterar o alimento da outra, **Then** a operação falha sem revelar ou
   modificar dados fora do escopo.

---

### User Story 2 - Criar receita versionada (Priority: P1)

O nutricionista cria uma receita com alimentos TACO ou customizados, define
rendimento e instruções, consulta os nutrientes por preparação e por porção, e
edita a receita explicitamente quando necessário.

**Why this priority**: Receitas encapsulam preparações recorrentes e são uma
fonte reutilizável para refeições prontas e dietas.

**Independent Test**: Criar uma receita com ingredientes válidos, confirmar o
cálculo e o snapshot de cada ingrediente, editar a origem e verificar que a
versão anterior permanece íntegra para quem já a utilizou.

**Acceptance Scenarios**:

1. **Given** alimentos TACO ou customizados válidos da Conta, **When** o
   nutricionista salva uma receita com rendimento positivo, **Then** a receita
   fica ativa, versionada e exibe nutrientes totais e por porção.
2. **Given** uma receita com ingrediente customizado, **When** o alimento de
   origem é editado, **Then** a receita existente conserva o snapshot da versão
   usada até que a receita seja editada e salva novamente.
3. **Given** ingrediente arquivado, inválido ou pertencente a outra Conta,
   **When** o nutricionista tenta salvar a receita, **Then** a operação é
   rejeitada com erro compreensível e sem persistência parcial.
4. **Given** uma receita existente, **When** o nutricionista a duplica, **Then**
   a cópia recebe identidade e versão próprias sem compartilhar IDs com a
   origem.

---

### User Story 3 - Reutilizar refeição pronta em uma dieta (Priority: P1)

O nutricionista cria uma refeição pronta combinando alimentos e porções de
receitas, seleciona esse template ao montar uma nova dieta e ajusta o conteúdo
no rascunho antes da confirmação clínica.

**Why this priority**: A biblioteca só entrega valor clínico quando reduz o
trabalho de montagem sem transformar templates em refeições de pacientes ou
alterar prescrições já confirmadas.

**Independent Test**: Criar uma refeição pronta, inseri-la em um `DietDraft`,
alterar a biblioteca e confirmar que o rascunho e uma dieta já salva continuam
com seus próprios IDs, versões e snapshots.

**Acceptance Scenarios**:

1. **Given** alimentos e receitas válidos da Conta, **When** o nutricionista
   salva uma refeição pronta, **Then** o template fica ativo, versionado e
   disponível para novas dietas.
2. **Given** uma receita ou refeição pronta ativa, **When** o nutricionista a
   insere em uma refeição do rascunho, **Then** o sistema copia o conteúdo para
   o `DietDraft`, gera IDs próprios e não cria ou altera uma dieta confirmada.
3. **Given** um rascunho contendo um template, **When** a origem da biblioteca
   é editada ou arquivada, **Then** o rascunho mantém o snapshot capturado até
   que o nutricionista escolha recarregar ou substituir o item.
4. **Given** uma refeição pronta contendo outra refeição pronta ou composição
   recursiva, **When** o nutricionista tenta salvá-la, **Then** a operação é
   rejeitada sem ciclo ou persistência parcial.
5. **Given** uma dieta confirmada contendo snapshot de biblioteca, **When** a
   origem é editada, arquivada ou removida conforme sua política, **Then** a
   dieta confirmada permanece renderizável e nutricionalmente inalterada.

### Edge Cases

- Quantidade, rendimento, peso preparado ou nutriente ausente, negativo, não
  finito ou inválido deve impedir o salvamento e identificar o campo afetado.
- Energia informada deve ser preservada como referência; energia calculada por
  macros só pode ser usada quando estiver explicitamente identificada como
  estimativa.
- Alimento, receita ou refeição pronta arquivados não aparecem em novas
  inserções, mas permanecem disponíveis para leitura de dependências e
  snapshots existentes.
- Exclusão física só é permitida quando não há dependências; caso exista
  dependência, o item deve ser arquivado e continuar pertencendo à Conta.
- Uma origem de outra Conta, um identificador inexistente ou um ID de entidade
  incompatível deve produzir erro de escopo, sem fallback ou divulgação.
- Falha no salvamento de qualquer agregado não pode deixar ingredientes, itens
  ou versões parcialmente persistidos.
- Selecionar um item da biblioteca não pode confirmar, atualizar ou remover uma
  dieta; somente o fluxo explícito de salvar dieta confirma a prescrição.
- A ausência de dados legados após a troca de fonte deve resultar em biblioteca
  vazia, sem tentativa de migração ou leitura concorrente.

## Requirements

### Functional Requirements

- **FR-001**: O sistema MUST manter alimentos customizados, receitas e refeições
  prontas associados a uma única Conta proprietária.
- **FR-002**: O sistema MUST tratar a TACO como fonte de referência somente
  leitura, sem duplicá-la como dados de Conta.
- **FR-003**: O sistema MUST validar nome, origem, unidade, base de medida,
  estado do alimento, quantidades, rendimento e valores nutricionais antes de
  persistir qualquer item.
- **FR-004**: O sistema MUST manter versão, datas de criação/atualização e
  status `ACTIVE` ou `ARCHIVED` em cada entidade editável da biblioteca.
- **FR-005**: O sistema MUST permitir criar, consultar, listar, editar,
  duplicar, arquivar e excluir conforme dependências cada entidade da
  biblioteca.
- **FR-006**: O sistema MUST preservar o snapshot nutricional e a versão de
  cada alimento usado como ingrediente de uma receita.
- **FR-007**: O sistema MUST permitir que uma receita contenha somente alimentos
  TACO ou alimentos customizados válidos da Conta, sem conter outra receita ou
  refeição pronta.
- **FR-008**: O sistema MUST calcular nutrientes totais e por porção de uma
  receita a partir dos valores internos não arredondados e do rendimento válido.
- **FR-009**: O sistema MUST permitir que uma refeição pronta contenha alimentos
  e porções de receitas válidos da Conta, sem composição recursiva.
- **FR-010**: O sistema MUST preservar snapshot, origem, versão, quantidade,
  unidade e composição necessários para ler cada item de uma refeição pronta.
- **FR-011**: O sistema MUST copiar uma receita ou refeição pronta para o
  `DietDraft` com novos IDs, sem criar ou alterar dados confirmados.
- **FR-012**: O sistema MUST garantir que editar, arquivar ou excluir uma
  origem da biblioteca não altere snapshots de drafts ou dietas confirmadas.
- **FR-013**: O sistema MUST rejeitar consultas e mutações fora do escopo da
  Conta ativa, inclusive por identificadores fornecidos diretamente.
- **FR-014**: O sistema MUST substituir os stores legados da biblioteca sem
  migração, leitura de fallback ou gravação simultânea em duas fontes.
- **FR-015**: O sistema MUST realizar cada salvamento de agregado de biblioteca
  de forma atômica, sem expor filhos ou versões incompletos após falha.
- **FR-016**: O sistema MUST retirar itens arquivados das novas seleções por
  padrão, mantendo acesso explícito para manutenção e leitura de dependências.
- **FR-017**: O sistema MUST comunicar estados de carregamento, vazio, sucesso,
  erro, conflito de versão e operação bloqueada com mensagens acionáveis.

### Non-Functional Requirements

- **NFR-001**: As telas da biblioteca e os fluxos de inserção devem funcionar
  em desktop a partir de 1024 px, com operação por teclado, foco visível,
  nomes acessíveis e contraste conforme WCAG 2.2 AA.
- **NFR-002**: A busca de itens TACO e da biblioteca, após a inicialização dos
  dados locais, deve retornar resultados em menos de 100 ms na fixture
  representativa do produto.
- **NFR-003**: Os fluxos principais e as falhas de escopo, validação,
  versionamento, atomicidade, arquivamento e snapshot devem possuir testes
  determinísticos e reproduzíveis.
- **NFR-004**: A etapa não deve introduzir rede, login, sincronização,
  colaboração, backup ou uso simultâneo de abas.

### Key Entities

- **FoodCatalogItem**: alimento de referência do sistema ou alimento
  customizado pertencente a uma Conta, com base de medida, estado, perfil
  nutricional, versão e status.
- **Recipe**: preparação culinária da Conta com rendimento, instruções,
  ingredientes ordenados e nutrientes calculados.
- **RecipeIngredient**: vínculo de uma receita com um alimento TACO ou
  customizado, incluindo quantidade, unidade, origem, versão e snapshot.
- **ReadyMeal**: template reutilizável da Conta com nome, descrição, horário
  sugerido, versão, status e itens ordenados.
- **ReadyMealItem**: alimento ou receita usado no template, com quantidade ou
  porções, origem, versão e snapshot.
- **LibrarySnapshot**: valores nutricionais e composição congelados no momento
  de um uso, independentes de alterações posteriores na origem.
- **DietDraft**: rascunho local de uma dieta que recebe cópias da biblioteca
  antes do salvamento explícito da prescrição.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos cenários de criação, edição, arquivamento, duplicação e
  exclusão permitida respeitam a Conta proprietária e não permitem acesso
  cross-account.
- **SC-002**: 100% dos cenários de edição ou arquivamento de uma origem mantêm
  idênticos os snapshots de drafts e dietas confirmadas já existentes.
- **SC-003**: 100% das inserções de receita ou refeição pronta geram uma cópia
  independente no rascunho e zero confirmação de dieta antes da ação explícita
  de salvar.
- **SC-004**: Todos os salvamentos inválidos ou com falha deixam zero entidade
  parcial persistida e preservam os dados anteriores.
- **SC-005**: A busca de alimentos preparada atende ao limite de menos de
  100 ms na fixture representativa, sem regressão da busca TACO existente.
- **SC-006**: Todos os fluxos principais da biblioteca podem ser concluídos por
  teclado e expõem estados de carregamento, vazio, erro e sucesso de forma
  compreensível.
- **SC-007**: A auditoria de arquitetura encontra zero leitura ou gravação das
  chaves legadas de alimentos, receitas e refeições prontas nas superfícies
  canônicas após o cutover.

## Assumptions

- A V1 mantém uma Conta local e um profissional por base, sem autenticação
  online ou colaboração entre profissionais.
- A TACO continua sendo fornecida pelo dataset estático atual e sua manutenção
  não faz parte desta etapa.
- Dados existentes em `localStorage` são dados de teste e serão descartados;
  nenhum migrador ou adaptador de leitura será criado.
- O banco local canônico, as portas de aplicação, o `DietDraftStore` e os
  snapshots clínicos das etapas anteriores serão reutilizados.
- A exclusão física de itens da biblioteca só será usada sem dependências;
  itens referenciados serão arquivados.
- O escopo visual limita-se a adaptar as superfícies existentes da biblioteca e
  do seletor de dieta ao contrato vigente; não inclui novo redesign de produto.
- Backup/restauração, avaliações, acompanhamento, sincronização e exportação
  permanecem nas etapas posteriores definidas em `refs/dieta-db/`.
