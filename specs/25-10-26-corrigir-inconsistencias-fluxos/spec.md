# Feature Specification: Corrigir inconsistências dos fluxos auditados

**Feature Branch**: checkout existente preservado; nenhuma branch criada.
**Created**: 2026-10-25
**Status**: Implementada e verificada localmente em2026-10-25. Evidências e resultado de convergência em [validation-report.md](validation-report.md); contexto de elaboração abaixo preservado como histórico.
**Input**: “crie o $sdd de correção de 100% dos problemas”, após auditoria Jev das páginas.

## Contexto, atores e limites

Corrigir todos os cinco grupos de achados identificados: F1 documentação de produto/persistência; F2 jornada de biblioteca após recarga; F3 contratos de entrada e saves; F4 inventário de rotas; F5 bloqueio do cadastro real de save e aceite pendente do dashboard. “100%” significa cobertura integral desses achados, não garantia de inexistência de bugs desconhecidos.

O profissional autenticado usa a biblioteca, os arquivos autorizados, Início e Agenda. O mantenedor reconcilia contratos e evidências. O operador do ambiente local diagnostica a integração usando acesso autorizado; o navegador nunca determina privilégios do banco.

A auditoria anterior inspecionou 24 arquivos de página, agrupados em 12 fluxos, e consultou Jev sobre resumos. Ela não executou novamente todos os fluxos. Há testes especializados fora da matriz genérica; as outras 15 páginas não podem ser declaradas sem testes só por estarem ausentes dessa matriz.

F5 confirma uma tentativa de cadastro com erro 503 e o aceite anterior aberto. A atribuição do erro à falta de permissão precisa ser revalidada: há concessões por coluna no contrato atual. Diagnóstico e correção são etapas distintas.

Esta entrega prepara a execução. Não integra pagamentos, redesenha telas, reintroduz escala percentual ou exportação isolada de dieta, migra dados clínicos para nuvem, altera formato do save ou publica o produto. Banco remoto e homologação remota ficam fora deste plano; sua paridade continuará explicitamente não verificada. Preservar alterações existentes e processos ativos.

## User Scenarios & Testing

### User Story 1 - Consultar contratos coerentes (Priority: P1)

Como mantenedor, quero que os documentos normativos descrevam o comportamento vigente para não reconstruir recursos retirados ou encaminhar usuários a uma jornada superada.

**Why this priority**: contratos contraditórios propagam regressões em novas entregas.
**Independent Test**: revisar todas as afirmações dos achados F1/F3 contra as decisões vigentes e verificar suas referências.

**Acceptance Scenarios**:

1. **Given** referências a escala percentual e arquivo isolado de dieta, **When** consulto os contratos atuais, **Then** encontro metas manuais, edição por alimento e save principal `.nutridiet`; remoções históricas seguem identificadas como históricas.
2. **Given** um save vinculado ou legado, **When** consulto proteção e persistência, **Then** distingo arquivo protegido, legado sem cifra, área local e rascunhos, sem promessa de proteção integral do dispositivo.
3. **Given** conta completa autenticada, **When** consulto entrada e navegação, **Then** encontro Início em `/dashboard`, aliases `/home` e `/saves` com parâmetros preservados, gestão em Configurações → Saves e logout na sidebar.
4. **Given** log de execução antigo, **When** atualizo um contrato superado, **Then** preservo o relato histórico e torno explícita a precedência do contrato atual.

### User Story 2 - Recuperar alimento após recarregar (Priority: P1)

Como profissional, quero recuperar um alimento customizado confirmado no meu save, após recarregar e reabrir o arquivo autorizado, sem depender do onboarding removido.

**Why this priority**: recarga deve ter expectativa compatível com a proteção do arquivo e provar recuperação real do conteúdo.
**Independent Test**: criar alimento identificável, concluir checkpoint, recarregar, restabelecer autorização pelo fluxo vigente e reencontrar nome, porção e três macros.

**Acceptance Scenarios**:

1. **Given** save autorizado com alimento confirmado e checkpoint concluído, **When** recarrego a página, **Then** a jornada utiliza Início e a abertura/autorização vigente, sem esperar “Criar perfil” ou URL final `/home`.
2. **Given** o mesmo arquivo reaberto, **When** volto a Alimentos → Customizados, **Then** recupero nome, quantidade da porção, proteína, carboidrato e gordura salvos; as três chaves legadas permanecem ausentes.
3. **Given** falha de checkpoint ou autorização, **When** tento a recuperação, **Then** o teste identifica a falha no estágio correspondente e não declara persistência apenas porque o alimento esteve visível antes da recarga.

### User Story 3 - Conhecer a cobertura real das páginas (Priority: P2)

Como mantenedor, quero um inventário completo e verificável de páginas com suas evidências, para que uma rota nova ou omitida não passe despercebida.

**Why this priority**: o inventário atual enumera nove páginas e tem títulos que excedem o que os testes provam.
**Independent Test**: comparar conjunto de arquivos de página com inventário; inserir uma omissão ou duplicata controlada na validação e observar rejeição.

**Acceptance Scenarios**:

1. **Given** as 24 páginas atuais, **When** verifico o inventário, **Then** cada arquivo aparece uma vez, com rota canônica, natureza da página e evidência aplicável identificada.
2. **Given** página dinâmica, alias ou redirecionamento, **When** reviso seu registro, **Then** vejo parâmetros/destino e estados próprios; não exijo estado visual inexistente de uma página que apenas redireciona.
3. **Given** página adicionada, removida, duplicada ou renomeada, **When** o inventário diverge dos arquivos, **Then** a verificação falha sem depender do número fixo 24.
4. **Given** teste que apenas inspeciona inventário ou código-fonte, **When** consulto seu nome e relatório, **Then** ele não é apresentado como navegação executada, comportamento preservado ou validação visual.

### User Story 4 - Concluir integração local e aceite real (Priority: P1)

Como profissional de teste, quero cadastrar e reabrir um save pelo fluxo real para comparar minha rotina com a Agenda e concluir o aceite pendente.

**Why this priority**: o erro 503 impede a evidência real ainda exigida pela feature anterior.
**Independent Test**: diagnosticar com evidência sanitizada, corrigir a causa reproduzida no ambiente local e executar a jornada autenticada sem simular cadastro/autorização de saves.

**Acceptance Scenarios**:

1. **Given** falha de cadastro reproduzida localmente, **When** examino papel efetivo, privilégios das colunas usadas, autorização por proprietário e erro subjacente, **Then** a correção depende da causa demonstrada; ausência de privilégio na tabela inteira não basta para afirmar ausência de concessões por coluna.
2. **Given** causa comprovada, **When** aplico a menor correção local compatível com o contrato vigente, **Then** cadastro e autorização funcionam sem reset, perda de arquivos ou dados existentes, exposição de chaves ou ampliação de privilégios.
3. **Given** conta de teste e save sanitizado previamente cadastrados e autorizados, **When** comparo Início e Agenda, **Then** os sete dias e as próximas ações coincidem; troca, fechamento, bloqueio de arquivo ou troca de conta não mantêm itens do contexto anterior.
4. **Given** cadastro e preparação concluídos, **When** apenas abro Início, Agenda e Assinatura, **Then** não surgem mutações causadas por essas leituras; autorização necessária é registrada separadamente de gravações clínicas e financeiras.
5. **Given** ambiente indisponível, causa não reproduzida ou aceite incompleto, **When** relato a execução, **Then** mantenho o aceite pendente com motivo concreto; evidência controlada não substitui a sessão real.

### Edge Cases

- Checkpoint pendente não equivale a conteúdo gravado no arquivo; comparar conteúdo depois de reabertura evita falso positivo do cache local.
- Recarga pode reapresentar seleção/abertura ou retomar um único arquivo compatível e autorizado conforme o contrato existente; ambos exigem comprovar qual arquivo e contexto foram recuperados. Não introduzir política nova de abertura automática.
- Aliases preservam parâmetros; login incompleto e usuário não autenticado continuam nas guardas vigentes, sem acesso clínico liberado por um redirecionamento.
- A causa do 503 pode envolver privilégio por coluna, política de proprietário, migração ou configuração. Não ampliar permissões por tentativa.
- Migração já registrada pode coexistir com drift; não apagar histórico nem reaplicar indiscriminadamente SQL que revoga permissões de outras entregas.
- Dados de teste sintéticos não autorizam alteração de arquivos pessoais ou de registros de outra conta. Testar negação entre proprietários sem expor conteúdo.
- Semana atravessando mês/ano, datas independentes de dieta/avaliação e ausência de ocorrências conservam o aceite do dashboard anterior.

## Requirements

### Functional Requirements

- **FR-001**: Registrar F1–F5, evidência de origem, estado confirmado/hipótese/pendente, critério de encerramento e vínculos às tarefas; nenhum achado pode desaparecer sem resolução demonstrada.
- **FR-002**: Reconciliar as referências normativas de escala, metas, formato principal, motor de persistência e limites de cifra com as decisões vigentes, preservando registro histórico e evitando contratos paralelos. No guia de setup diretamente vinculado, eliminar a contradição entre introdução pré-publicação e relato histórico de publicação; datar esse relato sem afirmar disponibilidade remota atual não verificada.
- **FR-003**: Reconciliar contratos normativos de autenticação e navegação com `/dashboard`, aliases compatíveis, Configurações → Saves e logout exclusivo na sidebar; não reescrever logs de execução passada.
- **FR-004**: Corrigir a jornada automatizada de biblioteca para checkpoint concluído, recarga, abertura autorizada do mesmo arquivo e leitura do alimento com os cinco valores de conteúdo descritos na US2; verificar ausência das três chaves legadas antes e depois.
- **FR-005**: Inventariar todas as páginas existentes uma única vez e detectar automaticamente divergências de conjunto, com tratamento explícito de rotas dinâmicas, aliases e estados aplicáveis; ligar cada entrada a evidências existentes ou lacunas nomeadas.
- **FR-006**: Adequar títulos/assertivas dos testes genéricos à prova realmente executada, reutilizando testes especializados e eliminando alegações globais baseadas apenas em regex ou presença de arquivos.
- **FR-007**: Diagnosticar o 503 no cadastro local antes de corrigir, distinguindo privilégios de tabela e coluna, contexto do proprietário, papel efetivo, migrações e erro subjacente; resultados sem reprodução não autorizam alteração especulativa.
- **FR-008**: Corrigir somente a causa local demonstrada e compatível com o contrato existente, mantendo permissões mínimas, validação no backend, isolamento por conta e dados preservados; se os privilégios já estiverem corretos, não os alterar.
- **FR-009**: Executar o aceite real já pertencente à T008 de `23-10-26-dashboard-rotina-assinatura`, com conta de teste, save sanitizado preexistente à sessão de aceite, comparação com Agenda, navegação, isolamento e ausência de mutações pela leitura; registrar o resultado na origem sem duplicar a propriedade do aceite.
- **FR-010**: Relatar separadamente inspeção estática, testes determinísticos, navegador com interceptações/arquivos simulados, sessão autenticada sem simular endpoints, persistência efetivamente observada e paridade remota; marcar cada limite ou bloqueio, sem declarar “todos os fluxos livres de erros”.

### Non-Functional Requirements

- **NFR-001**: Não apagar/resetar bancos, contas ou arquivos; não alterar schema clínico, envelope, cálculos, snapshots, interface ou permissões remotas. Usar fixtures sanitizadas e não registrar credenciais, tokens, chaves, URLs com senha ou dados clínicos pessoais.
- **NFR-002**: Mudanças restritas aos contratos e verificações necessários aos cinco achados; nenhuma dependência nova, serviço paralelo permanente ou duplicação da suíte funcional existente. Preservar processos e alterações alheias.
- **NFR-003**: Resultados reproduzíveis devem identificar comando/jornada, data, ambiente, origem de dados, interceptações e resultado; falha/ausência de evidência impede marcar o respectivo aceite como concluído.
- **NFR-004**: Preservar sem regressão teclado, foco, mensagens de erro e salvaguardas existentes dos fluxos tocados; não criar requisitos de desempenho ou escala novos para uma correção documental e de validação.

### Key Entities

- **Achado**: identificador F1–F5, origem, classificação de evidência, requisito, tarefa e resolução observável.
- **Registro de página**: caminho de arquivo, rota, natureza (entrada, conteúdo, dinâmica, alias), parâmetros/destino quando aplicáveis, estados e referências de evidência.
- **Evidência**: camada de prova, ambiente, comando/jornada, resultado e limitações, sem segredos.
- **Save de teste**: arquivo sanitizado de uma conta de teste autorizada; mantém identidade e conteúdo conhecido entre checkpoint e reabertura.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Cinco de cinco grupos de achados possuem resolução rastreável; nenhum aceite é marcado completo sem a evidência exigida.
- **SC-002**: Zero afirmações normativas conflitantes sobre os temas F1/F3 nos documentos alvo e referências diretamente afetadas; histórico superado é identificado como tal.
- **SC-003**: O alimento recuperado mantém nome, porção e três macros após checkpoint, recarga e reabertura; zero chaves legadas criadas.
- **SC-004**: O inventário cobre 100% dos arquivos de página, sem duplicatas, e rejeita divergências futuras; nomes dos testes correspondem ao alcance real.
- **SC-005**: Cadastro/autorização local e aceite T008 passam sem simular endpoints de saves; contagens/ações coincidem com Agenda e nenhum item de outro contexto permanece visível, sem mutações provocadas pela leitura.
- **SC-006**: Zero perda de dados, relaxamento de autorização, exposição de segredos ou alteração remota; relatório distingue todas as seis camadas de evidência da FR-010.

## Dependências e decisões já estabelecidas

- A solicitação atual autoriza preparar SDD. Implementação depende da validação humana e da execução por `/speckit-implement` prevista na constituição.
- As decisões aceitas de persistência e navegação fornecem o comportamento esperado; não há pergunta de produto aberta para reconstruir funcionalidades removidas.
- Integração real depende de Auth/banco local, conta de teste autorizada e arquivo de teste. A disponibilidade será verificada na implementação; sua ausência bloqueia o aceite, não altera o requisito.
- Novos defeitos reproduzidos que pertençam diretamente a F1–F5 recebem rastreabilidade antes da correção. Problemas de outras funcionalidades são registrados para escopo próprio, sem expansão silenciosa.
