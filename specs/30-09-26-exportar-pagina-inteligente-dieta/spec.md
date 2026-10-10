# Feature Specification: Página inteligente da dieta simples

**Created**: 2026-09-30
**Status**: Especificado e clarificado; aguardando validação humana do SDD, sem implementação.
**Feature directory**: specs/30-09-26-exportar-pagina-inteligente-dieta
**Input**: Integrar ao app o protótipo de dieta simples aprovado, com menu → modal intermediário → página exportada, componentes existentes, alternativas em abas, alimentos marcáveis, resumo colorido e data dd/mm/aaaa.

## Contexto, atores e escopo

O nutricionista prepara uma dieta no editor real, inclusive em dieta/nova, e inicia a exportação pelo menu de exportação. O destinatário consulta os alimentos e pode marcar os itens para acompanhar a refeição. O modal intermediário é parte obrigatória do fluxo; suas configurações adicionais serão definidas em outra entrega.

A página do paciente será hospedada na Vercel, como uma das poucas páginas online do produto. Sua UI deve ser implementada na estrutura real do app; o HTML não é o produto a distribuir. O paciente deve acessar o conteúdo publicado sem depender do navegador, banco local ou sessão do nutricionista.

A referência aprovada é `refs/UI/dieta-exportada/dieta-simples.html`, cujo conteúdo de interação está em `reference.tsx`. O protótipo é referência de arranjo, não fonte normativa concorrente do Design System. Dados de exemplo não entram no app.

Esta entrega cobre dieta simples e opções principal/alternativas dentro de cada refeição. Ciclagem de carboidratos e múltiplos dias/variações globais da dieta não fazem parte desta primeira entrega. As opções de refeição são chamadas de alternativas para não confundir com variações globais.

## Clarifications

### Session 2026-09-30

- Q: O HTML será o produto exportado ou apenas referência? → A: Apenas validação visual; implementar a mesma UI na estrutura do aplicativo.
- Q: Como o paciente receberá a página? → A: Página exportada hospedada na Vercel para o paciente consultar.
- Q: Como será o acesso? → A: Opção A: link imprevisível, sem login; qualquer pessoa que tiver o endereço poderá acessar.
- Q: Como alterações da dieta chegam à página? → A: Opção A: manter o mesmo link e atualizar o conteúdo somente após confirmar nova exportação no modal, sem publicação automática de edições.
- Q: Quanto duram os checks dos alimentos? → A: Persistem no navegador do paciente após recarga; não há sincronização entre dispositivos.
- Q: O que acontece com os checks ao republicar a dieta? → A: Opção A: nova publicação zera os checks; recargas da mesma versão preservam as marcas.

- Q: Como autenticar publicação sem login? → A: Sem login nesta etapa; autenticar pela chave única da conta sincronizada com o save local.

## User Scenarios & Testing

### User Story 1 - Exportar passando pelo modal (Priority: P1)

Como nutricionista, quero iniciar a exportação no menu do editor e confirmar a apresentação no modal antes de receber a página inteligente.

**Why this priority**: É a entrada obrigatória para utilizar o layout com uma dieta real.
**Independent Test**: Abrir dieta simples no editor, acionar exportação, verificar modal e cancelar sem modificar a dieta; confirmar em uma segunda tentativa e conferir o conteúdo recebido.

**Acceptance Scenarios**:

1. **Given** uma dieta simples no editor, **When** o profissional seleciona a ação de página externa, **Then** abre o modal intermediário e nenhuma página é gerada antecipadamente.
2. **Given** o modal aberto, **When** o profissional cancela, fecha ou pressiona Escape, **Then** o fluxo termina sem alterar a prescrição e o foco retorna ao gatilho.
3. **Given** confirmação da exportação, **When** o conteúdo é preparado, **Then** a página usa os alimentos, quantidades, opções e totais do documento real vigente, sem conteúdo fictício ou de outro paciente.
4. **Given** falha na preparação, **When** a operação termina, **Then** há mensagem legível e possibilidade de tentar novamente, sem indicar sucesso nem descartar alterações.

### User Story 2 - Consultar refeições com alternativas (Priority: P1)

Como destinatário, quero consultar uma única opção de cada refeição por vez em tabelas legíveis.

**Why this priority**: Preserva o arranjo aprovado e evita empilhar todas as alternativas.
**Independent Test**: Consultar uma dieta contendo refeição sem alternativa e refeição com duas alternativas; alternar por clique e teclado.

**Acceptance Scenarios**:

1. **Given** uma refeição com alternativas, **When** a página é aberta, **Then** a opção principal está selecionada, com abas junto ao título e horário da refeição.
2. **Given** outra aba selecionada, **When** o usuário consulta os alimentos, **Then** somente os alimentos daquela opção ficam visíveis e as demais opções não aparecem abaixo.
3. **Given** uma refeição com apenas uma opção, **Then** a tabela aparece sem abas desnecessárias.
4. **Given** a página exportada, **Then** nome do paciente, autoria disponível e data da prescrição em dd/mm/aaaa correspondem à dieta de origem.

### User Story 3 - Marcar alimentos e consultar macros (Priority: P2)

Como destinatário, quero marcar um alimento pela linha inteira e consultar o resumo nutricional sem editar a prescrição.

**Why this priority**: Permite acompanhamento com área de interação maior e leitura compacta dos nutrientes.
**Independent Test**: Marcar e desmarcar por checkbox, nome, quantidade, Enter e Espaço; trocar alternativas e verificar que as marcas não se misturam.

**Acceptance Scenarios**:

1. **Given** uma linha de alimento, **When** o usuário clica no check à esquerda ou no nome/quantidade, **Then** o mesmo check alterna exatamente uma vez.
2. **Given** uma linha focada, **When** o usuário pressiona Enter ou Espaço, **Then** a marca alterna e recebe indicação visual e acessível.
3. **Given** um alimento marcado, **When** o usuário troca a alternativa e retorna durante a sessão, **Then** a marca pertence à mesma refeição, opção e alimento.
4. **Given** o resumo, **Then** a tabela possui apenas Refeição e Macros, com proteína, carboidrato, gordura e calorias em ordem, unidades e cores oficiais, separados por bolinhas.
5. **Given** marcação ou troca de aba, **Then** quantidades, composição, total prescrito e dados do editor não são modificados.

### Edge Cases

- Refeições ou opções sem alimentos exibem ausência explícita; não inventam itens ou valores nutricionais zero.
- Nutrientes ausentes exibem ausência explícita e zero real continua zero.
- Títulos longos e várias alternativas não ocultam informação essencial; o layout é validado em 1024 e 1440 px.
- Dados de paciente, documento ou autoria indisponíveis não recebem nome profissional/CRN fictício.
- Dietas não simples não oferecem exportação funcional desta entrega e não recebem resultado parcial silencioso.
- Falha em salvar/preparar o rascunho não exporta silenciosamente uma versão anterior.
- Publicação de rascunho exporta o conteúdo vigente após persistência local, sem confirmar ou ativar a dieta no histórico. Dieta nova conserva o ID estável já usado pelo rascunho/salvamento. Data de rascunho novo segue a data local de preparo; dieta salva conserva a data da prescrição.
- Autor real usa o perfil da conta disponível; credenciais profissionais ausentes são omitidas.
- Falta de conexão durante publicação mantém o modal com erro e não altera a versão online. Link inválido retorna indisponibilidade sem revelar existência de pacientes ou contas.
- Conteúdo de texto da dieta é tratado como conteúdo, nunca como comandos ou marcação executável.

## Requirements

### Functional Requirements

- **FR-001**: O editor real DEVE oferecer a ação de exportação da página para dieta simples no menu existente, preservando PDF e WhatsApp.
- **FR-002**: A ação DEVE abrir obrigatoriamente o modal intermediário com identidade da dieta/paciente, explicação da apresentação e ações Cancelar e confirmar; não criar configurações adicionais nesta entrega.
- **FR-003**: Cancelamento DEVE restaurar o foco e não gerar página, ativar dieta ou modificar prescrição.
- **FR-004**: A confirmação DEVE usar o documento real vigente do editor; falhas devem ser recuperáveis e nunca apresentar dados antigos como exportação atual.
- **FR-005**: A página DEVE exibir paciente, autoria real disponível e data dd/mm/aaaa; nomes e credenciais fictícios são proibidos.
- **FR-006**: Cada refeição DEVE exibir título/horário e tabela de Alimento e Quantidade, mantendo nomes, quantidades e unidades prescritos.
- **FR-007**: Alternativas de refeição DEVEM estar acessíveis em abas junto ao título, principal selecionada inicialmente e somente uma opção visível.
- **FR-008**: As linhas de alimentos DEVEM ter check à esquerda e permitir alternância única por linha inteira e teclado.
- **FR-009**: Marcas DEVEM persistir no navegador do paciente após recarga, ser independentes por página/refeição/opção/alimento e não alterar documento ou total prescrito. Não há sincronização remota de marcas; outro navegador não herda o acompanhamento. Se o armazenamento local estiver indisponível, a marcação deve continuar na sessão com aviso de que não será preservada após recarga.
- **FR-010**: O resumo DEVE conter Refeição e Macros, com apresentação colorida existente e separadores de bolinhas; ordem proteína, carboidrato, gordura, kcal, com unidades e total do dia baseado nas opções principais.
- **FR-011**: Interface DEVE reutilizar/configurar/compor exclusivamente capacidades dos componentes existentes, respeitar Atomic Design, contratos e regras de criação; nenhuma réplica HTML local de componentes deve entrar no app.
- **FR-012**: Carregamento, erro e ausência de dados DEVEM ter mensagens acessíveis e não permitir duplicação acidental da exportação.
- **FR-013**: A página DEVE ser hospedada na Vercel e acessível ao paciente por link, independente do ambiente local do profissional; geração de arquivo HTML independente não faz parte desta entrega.
- **FR-014**: A UI DEVE integrar a estrutura real do aplicativo, preservando o escopo local do restante do produto. A rota do paciente não depende de onboarding, sessão profissional ou abertura do banco clínico local.
- **FR-019**: Publicação e atualização DEVEM exigir a chave única de publicação da conta, preservada no save local. O link do paciente é apenas de leitura. Sem chave válida ou chave de outra conta, o servidor não deve aceitar alteração. Login online não entra nesta entrega.
- **FR-020**: A chave DEVE ser preservada ao salvar/carregar a conta; contas antigas sem credencial devem recebê-la uma única vez e sincronizá-la com o save antes da primeira publicação. Identificador público da conta não é credencial. O conteúdo publicado e a URL do paciente nunca incluem a chave.
- **FR-021**: Publicações da mesma conta/dieta DEVEM manter identidade estável, mesmo após recarga/restauração do save. Nova tentativa da mesma operação não cria link/revisão duplicados; reexportação confirmada posterior cria nova revisão. O primeiro registro da conta no serviço vincula a credencial; registro existente nunca pode ser sobrescrito por outra chave.
- **FR-018**: Cada publicação confirmada DEVE ter revisão própria. Uma revisão publicada diferente zera os checks no navegador do paciente; recargas da mesma revisão preservam as marcas. Falha de publicação não cria revisão nova nem zera os checks da versão vigente.
- **FR-017**: Reexportações da mesma dieta DEVEM manter o mesmo link e substituir o conteúdo publicado somente após confirmação explícita no modal. Edição, autosave e salvamento clínico isolados não atualizam a página. Falha de publicação mantém a versão anterior acessível e informa que a atualização não foi concluída.
- **FR-016**: O acesso do paciente DEVE usar link imprevisível, sem login ou código adicional; o modal deve explicar que qualquer pessoa com o link pode consultar a página. O endereço não deve conter identificadores clínicos previsíveis nem dados pessoais. A publicação não deve ser indexada por mecanismos de busca.
- **FR-015**: O modal DEVE comunicar o preparo/publicação do link e apresentar sucesso somente depois da confirmação de publicação; erro preserva a dieta e permite nova tentativa sem publicação duplicada acidental.

### Non-Functional Requirements

- **NFR-001**: Design System canônico prevalece sobre o protótipo; tokens, fonte, estilos tipográficos, semântica de cor, espaçamento, geometria, ícones e estados devem ser conferidos ao final. Desvios existentes devem ser tratados explicitamente no plano, sem homologação presumida.
- **NFR-002**: Menu, modal, abas e marcação devem funcionar por teclado; modal deve conter foco, fechar com Escape e devolver foco. Nomes, papéis, valores e seleção precisam ser acessíveis.
- **NFR-003**: Layout desktop validado em 1024 e 1440 px, sem overflow horizontal da página; mobile/tablet e tema escuro não entram nesta entrega.
- **NFR-004**: O conteúdo de exportação deve incluir somente dados necessários da dieta selecionada; nenhum acesso ao banco completo, segredos ou dados de outros pacientes.
- **NFR-006**: A publicação envia apenas o snapshot necessário à página, nunca o save completo. As credenciais devem ficar fora das respostas públicas, URLs e logs; a indisponibilidade do serviço online não deve bloquear edição local, PDF ou WhatsApp.
- **NFR-005**: Testes e validação utilizam dados isolados; a entrega documental não modifica código funcional, registros de pacientes ou runtimes ativos.

### Key Entities

- **Documento de dieta simples**: conjunto vigente de refeições/opções/alimentos e snapshots nutricionais, associado ao paciente.
- **Refeição**: identidade, nome, horário, posição e opções ordenadas.
- **Opção de refeição**: identidade, principal/alternativa, alimentos e nutrientes prescritos.
- **Alimento prescrito**: identidade, nome de apresentação, quantidade/unidade e snapshot.
- **Marca de acompanhamento**: associação independente entre página, refeição, opção e alimento; não pertence à edição da prescrição.
- **Credencial de publicação da conta**: segredo de posse, associado à conta e sincronizado com o save; não é o link de leitura nem o identificador público.
- **Publicação**: identidade estável por conta/dieta, conteúdo mínimo publicado, link de leitura e revisão.
- **Operação de publicação**: identidade de tentativa que permite repetição sem duplicar publicação ou revisão.
- **Identidade da prescrição**: paciente, data e autoria real disponível.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Em todos os cenários de exportação de dieta simples, a página só é produzida após passagem e confirmação no modal.
- **SC-002**: Todos os alimentos, quantidades/unidades e totais do conjunto de testes correspondem à prescrição de origem; nenhum dado fictício aparece.
- **SC-003**: Todas as refeições com alternativas exibem uma única tabela de opção por vez, com principal inicialmente visível.
- **SC-004**: Todas as ações de marcar/desmarcar testadas funcionam por checkbox, nome, quantidade e teclado, sem dupla alternância ou mudança da prescrição.
- **SC-005**: Resumo tem exatamente duas colunas e exibe os quatro nutrientes/energia na ordem e semântica solicitadas; data segue dd/mm/aaaa.
- **SC-007**: Todos os cenários de chave ausente/incorreta ou de outra conta são rejeitados sem mudar a página publicada; salvar/carregar a mesma conta preserva a autorização e o link.
- **SC-008**: Recarga da mesma publicação preserva checks; nova revisão confirmada zera checks; falha ou repetição da mesma operação não zera checks nem duplica revisão.
- **SC-006**: Fluxo completo funciona por teclado e layout permanece legível em 1024 e 1440 px; regressões de PDF e WhatsApp não são aceitas.

## Dependências e limites consolidados

- Reutilizar o documento e cálculos já existentes; não recalcular a prescrição com números do protótipo.
- Preparação da exportação deve preservar alterações não relacionadas e rascunhos.
- Distribuição confirmada: página hospedada na Vercel, com UI na estrutura do app. Acesso confirmado: link imprevisível sem login, acessível a quem tiver o endereço. Atualização confirmada: mesmo link, somente por nova exportação explícita no modal. Marcas confirmadas: persistência apenas no navegador do paciente, sem sincronização remota. Checks após atualização confirmados: nova revisão publicada zera marcas; recarga da mesma revisão preserva. Publicação autenticada pela chave única da conta sincronizada com o save, sem login. Tecnologia de armazenamento remoto e contratos da credencial são decisões do plano, não escolhas de produto pendentes. Configurações de expiração/revogação estão conscientemente fora desta primeira UI; links não expiram automaticamente e não há painel de gestão ou atualização automática. Nenhum serviço foi provisionado nesta etapa documental.
- Configurações futuras do modal, integração de IA, sincronização clínica geral, migração global do Design System e suporte de dietas não simples estão fora do pedido atual.
