# Feature Specification: Dietas — rascunho, salvamento e histórico

**Feature Directory**: `specs/30-08-26-dietas-rascunho-salvamento-historico`

**Created**: 2026-08-30

**Status**: Draft — clarificada; aguardando validação humana do conjunto SDD; implementação não iniciada por este SDD.

**Input**: Criar o SDD da terceira etapa dos documentos de `refs/dieta-db/`, executando o fluxo de especificação até validação humana, sem implementar.

## Contexto e objetivo

Entregar a terceira etapa da [divisão em SDDs](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md): o nutricionista abre um paciente existente, inicia ou retoma uma dieta, puxa informações anteriores, adiciona alimentos, salva explicitamente e consulta a prescrição confirmada no histórico.

Uma dieta **Em Criação** é um rascunho local; não representa atendimento concluído, não altera a vigente nem aparece no histórico. **Salvar Prescrição** confirma o conteúdo integral. A dieta **Vigente** pode ser editada por novo salvamento explícito; ao ser substituída por outra dieta, passa a **Histórico**, somente leitura.

O ator é o único nutricionista da Conta local, no mesmo navegador/dispositivo e em uma única aba ativa. Não há novos papéis, login, compartilhamento ou permissões remotas.

## Clarifications

### Session 2026-08-30

- Q: Qual conteúdo mínimo permite Salvar Prescrição? → A: Pelo menos uma refeição com pelo menos um alimento.

### Fontes normativas

- [Decisão 01 — Fluxo](../../refs/dieta-db/01-fluxo-paciente-dieta.md): estados, salvamento e recuperação de falhas.
- [Decisão 04 — Fases e validação](../../refs/dieta-db/04-plano-de-execucao-e-validacao.md): todas as fases internas pertencem a este SDD.
- [Decisão 08 — Snapshots](../../refs/dieta-db/08-snapshots-versionamento-e-integridade-clinica.md): composição, metas e peso de referência.
- [Decisão 02 — Paciente](../../refs/dieta-db/02-ciclo-de-vida-e-persistencia-do-paciente.md) e [Decisão 03 — Interações](../../refs/dieta-db/03-contrato-de-interacao-da-tela-de-pacientes.md): arquivamento, atividade, histórico e ações por estado.
- [Decisão 05 — Escopos](../../refs/dieta-db/05-arquitetura-backend-e-escopos-de-dados.md), [Decisão 06 — Regras nutricionais](../../refs/dieta-db/06-catalogo-de-alimentos-e-customizados.md) e [Decisão 10 — Motor local](../../refs/dieta-db/10-motor-local-drizzle-e-migrations.md): isolamento, precisão e pré-requisitos técnicos.
- [Design system](../../design-system/README.md) e [constituição](../../.specify/memory/constitution.md): interface, acessibilidade, arquitetura e execução.

## Escopo e limites

### Incluído

- Nova dieta em `/pacientes/[id]/dieta/nova`, retomada, edição da vigente e configuração do ciclo no mesmo rascunho.
- Autosave, descarte confirmado, salvamento explícito, conferência de resultado incerto e recuperação de falhas.
- Alimentos TACO; modos simples/ciclo, variações do ciclo, dias, refeições, alternativas, substituições, ordem, quantidades e metas existentes.
- Cópia de metas ou da dieta completa a partir de prescrições confirmadas do mesmo paciente.
- Histórico, cartão da vigente, contagens, atividade derivada e leitura do cardápio a partir das prescrições confirmadas.
- Integração com Conta, paciente, arquivamento e infraestrutura local das etapas anteriores.
- Substituição do armazenamento legado de dietas de teste, sem conversão de registros.
- Validação proporcional de persistência, falhas, isolamento, funcionamento offline, acessibilidade e regressões.

### Excluído

- Persistência e integração de alimentos customizados, receitas e refeições prontas: etapa 4. Não usar essas fontes como fallback nesta etapa.
- Persistência de avaliações, consultas e próximos acompanhamentos: etapa 5. Integrar dietas às projeções não autoriza construir esses módulos.
- Exportação/restauração da Conta pela interface: etapa 6. Documentar dados e versões para o formato lógico futuro não significa implementar backup completo.
- Login, nuvem, sincronização, outbox, colaboração, múltiplos profissionais, abas simultâneas, PWA avançada e atualização automática do motor.
- Criptografia, senha, backup automático, exportação `.diet`, eliminação física de prescrições e histórico de cada edição intermediária da vigente.
- Refatoração visual geral, novos módulos clínicos e conversão de dados de teste de outros módulos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Montar e retomar sem confirmar prescrição (Priority: P1)

Como nutricionista, quero recuperar a edição local sem publicar uma prescrição incompleta no histórico.

**Why this priority**: Separar edição e confirmação evita atividade clínica fictícia.

**Independent Test**: Editar rascunhos simples e de ciclo, reabrir a rota e comparar conteúdo; histórico, contagem, atividade e vigente permanecem iguais.

**Acceptance Scenarios**:

1. **Given** paciente ativo da Conta, **When** abrir nova dieta, **Then** criar ou recuperar somente a edição local, sem prescrição confirmada.
2. **Given** rascunho, **When** adicionar o primeiro alimento ou alterar metas, quantidade, modo, refeições, alternativas ou ciclo, **Then** autosalvar somente a edição e informar seu estado de persistência.
3. **Given** autosave confirmado, **When** reabrir a rota no mesmo navegador, **Then** recuperar a revisão persistida integralmente.
4. **Given** edição pendente, **When** navegar internamente, inclusive para configurar o ciclo, **Then** concluir a gravação local ou manter a edição com erro explícito.
5. **Given** falha local, **When** tentar autosalvar, **Then** informar que a edição não foi persistida, sem anunciar salvamento clínico.

### User Story 2 — Confirmar a prescrição integral (Priority: P1)

Como nutricionista, quero que Salvar confirme o último conteúdo visível sem duplicações ou registros parciais.

**Why this priority**: O salvamento distingue trabalho em elaboração e prescrição confirmada.

**Independent Test**: Salvar antes de concluir o autosave, reabrir e comparar o último valor; repetir com falhas em diferentes pontos da confirmação.

**Acceptance Scenarios**:

1. **Given** edição válida pendente, **When** clicar em Salvar Prescrição ou usar Ctrl+S, **Then** capturar o último valor, persistir a revisão local e só então confirmar a prescrição.
2. **Given** envio em andamento, **When** tentar editar ou reenviar, **Then** bloquear a interação concorrente.
3. **Given** nova prescrição confirmada, **When** atualizar o perfil, **Then** ela é a única vigente, sua antecessora está no histórico e somente a revisão local confirmada é removida.
4. **Given** rollback confirmado, **When** concluir a tentativa, **Then** preservar rascunho e dados clínicos anteriores, sem registros parciais nem sucesso falso.
5. **Given** resultado desconhecido após interrupção, **When** retomar, **Then** conferir a dieta por identidade estável antes de repetir, sem reenvio automático.
6. **Given** commit confirmado e falha apenas na limpeza, **When** apresentar o resultado, **Then** informar sucesso clínico e limpeza pendente; repetir somente a limpeza.
7. **Given** dieta sem refeições ou cujas refeições não contêm alimentos, **When** tentar salvar, **Then** rejeitar com mensagem de conteúdo mínimo e preservar o rascunho.
8. **Given** pelo menos uma refeição com um alimento válido no modo prescrito, **When** salvar com as demais validações satisfeitas, **Then** permitir a confirmação sem exigir quantidade adicional de refeições ou alimentos.

### User Story 3 — Editar a vigente e preservar o histórico (Priority: P1)

Como nutricionista, quero editar somente a vigente e consultar as anteriores sem alterar o que foi prescrito.

**Why this priority**: Protege o histórico contra sobrescrita e vigências contraditórias.

**Independent Test**: Salvar duas prescrições, editar a vigente e tentar alterar a anterior pela rota e pela aplicação.

**Acceptance Scenarios**:

1. **Given** vigente confirmada, **When** editar, **Then** somente o rascunho muda até Salvar.
2. **Given** edição confirmada da vigente, **When** consultar, **Then** manter identidade, incrementar versão e não criar uma linha histórica por edição.
3. **Given** nova dieta confirmada, **When** abrir a antiga vigente, **Then** apresentar seu último conteúdo confirmado como histórico somente leitura.
4. **Given** base desatualizada ou histórica, **When** tentar salvar, **Then** preservar a edição e rejeitar sobrescrita; oferecer criação por cópia quando a base perdeu a vigência.
5. **Given** histórico, **When** abrir cardápio ou expandir ciclo, **Then** não criar rascunho nem alterar datas, atividade ou prescrição.

### User Story 4 — Reaproveitar uma prescrição anterior (Priority: P2)

Como nutricionista, quero puxar metas ou uma dieta completa para uma edição independente da origem.

**Why this priority**: Reutiliza trabalho sem referências mutáveis entre prescrições.

**Independent Test**: Copiar prescrições simples e de ciclo, alterar o destino e comparar integralmente a origem.

**Acceptance Scenarios**:

1. **Given** prescrições e rascunhos, **When** abrir Puxar informações, **Then** listar somente vigente e históricos confirmados do mesmo paciente/Conta.
2. **Given** puxar somente metas, **When** confirmar a origem, **Then** alterar as metas do rascunho sem copiar refeições ou alterar a origem.
3. **Given** cópia completa, **When** confirmar, **Then** copiar profundamente composição, modo, dias, metas e snapshots com novas identidades das entidades copiadas.
4. **Given** cópia local concluída, **When** consultar histórico, **Then** não encontrar nova linha antes de Salvar.

### User Story 5 — Descartar e respeitar arquivamento (Priority: P2)

Como nutricionista, quero abandonar a edição sem apagar prescrições e impedir gravações clínicas em paciente arquivado.

**Why this priority**: Descarte e arquivamento não podem destruir histórico ou reativar edição inválida.

**Independent Test**: Descartar com autosave pendente e arquivar paciente com rascunho; verificar integridade do histórico e rejeição dos callbacks antigos.

**Acceptance Scenarios**:

1. **Given** rascunho Em Criação, **When** cancelar o descarte, **Then** manter edição; ao confirmar, remover somente o rascunho local.
2. **Given** autosave atrasado, **When** chegar após descarte/limpeza, **Then** rejeitar sem recriar o documento removido.
3. **Given** paciente arquivado, **When** iniciar ou salvar dieta, **Then** rejeitar a mutação e preservar prescrições.
4. **Given** arquivamento confirmado e falha de invalidação local, **When** salvar o rascunho, **Then** bloquear a mutação; a falha local não desarquiva o paciente.
5. **Given** paciente restaurado, **When** abrir dieta, **Then** não reativar automaticamente rascunhos invalidados.

### User Story 6 — Reabrir a mesma prescrição e trabalhar sem rede (Priority: P1)

Como nutricionista, quero preservar os valores prescritos após reabrir, independentemente de mudanças no paciente ou catálogo.

**Why this priority**: A prescrição precisa reproduzir o conteúdo confirmado sem depender de dados vivos.

**Independent Test**: Salvar amostras simples/ciclo, alterar cadastro e fonte controlada, reabrir e comparar; repetir offline após preparar recursos.

**Acceptance Scenarios**:

1. **Given** dieta salva, **When** alterar peso/metas do paciente, **Then** manter os valores prescritos, inclusive peso de referência e g/kg.
2. **Given** item inserido, **When** a origem mudar ou ficar indisponível, **Then** manter nome, base, quantidade, unidade, nutrientes e proveniência congelados.
3. **Given** energia informada na fonte, **When** calcular, **Then** conservar sua energia escalada, sem substituição automática por 4–4–9.
4. **Given** recursos preparados e primeira aba ativa, **When** desligar a rede, **Then** editar, salvar e recuperar localmente; segunda aba não abre a base.

### Edge Cases

- Conta ausente, paciente inexistente ou de outra Conta e dieta de outro paciente: erro de contexto, sem cadastro implícito ou identificador padrão.
- Histórico vazio é diferente de falha de leitura; a falha oferece repetição, sem simular ausência de dietas.
- Indisponibilidade, quota excedida, abort ou serialização inválida: preservar a edição disponível e não confirmar persistência inexistente.
- Revisão antiga não substitui a recente; datas não substituem controle por versão/revisão.
- Fechamento abrupto pode perder edição que ainda não foi persistida; não prometer recuperação desse conteúdo.
- Leitura inconclusiva após interrupção não comprova sucesso nem rollback; preservar rascunho para conferência.
- Quantidade/base não positiva, números não finitos e nutrientes negativos são inválidos; ausência não vira zero silenciosamente.
- Gramas, mililitros e unidades requerem base compatível ou conversão explícita; não inventar densidade/peso unitário.
- Alternativas não são somadas como consumo simultâneo; indicar a opção considerada nos totais.
- Origem indisponível não impede ler ou recalcular pela base congelada do snapshot.
- Somente metas, zero refeições ou refeições vazias não atendem ao conteúdo mínimo. Conteúdo guardado no modo inativo não valida o modo prescrito. O mínimo é global da dieta; não se acrescenta uma exigência de preenchimento de cada variação do ciclo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toda operação DEVE validar Conta ativa e paciente proprietário; não confiar em Conta arbitrária fornecida pela interface.
- **FR-002**: Iniciar dieta DEVE exigir paciente existente e ativo e criar/recuperar somente rascunho local do contexto, sem prescrição confirmada.
- **FR-003**: O rascunho DEVE preservar todo o conteúdo editável: modo, metas, peso de referência, ciclo/dias, refeições, alternativas, substituições, ordem, alimentos, quantidades, unidades e snapshots.
- **FR-004**: Primeiro alimento e autosave DEVEM alterar somente a edição local, nunca prescrição, vigência, atividade, contagens ou histórico.
- **FR-005**: Gravações por rascunho DEVEM respeitar revisão monotônica, isolamento e cancelamento de callbacks obsoletos, sem sobrescrita por revisão antiga ou recriação após descarte/limpeza.
- **FR-006**: Reabrir DEVE recuperar a última revisão persistida; configuração do ciclo DEVE compartilhar o mesmo rascunho sem confirmar prescrição no retorno.
- **FR-007**: A interface DEVE distinguir edição pendente, autosave em andamento, rascunho persistido e falha; navegação interna conclui gravações pendentes ou mantém o contexto com erro explícito.
- **FR-008**: Puxar informações DEVE listar somente prescrições confirmadas do mesmo paciente/Conta, incluindo vigente e históricos, excluindo todos os rascunhos.
- **FR-009**: Puxar somente metas DEVE alterar exclusivamente metas do rascunho, sem copiar refeições, criar prescrição ou alterar a origem. Para ciclo, usar as metas da variação ativa da origem e aplicá-las à variação ativa do destino; não trocar pela média semanal. Preservar o peso de referência do destino nessa operação limitada a metas.
- **FR-010**: Cópia completa DEVE substituir o conteúdo do rascunho pela composição integral da origem, preservando profundamente modo, metas, peso de referência, ciclo/dias, refeições, alternativas, substituições, ordem e snapshots, gerando novas identidades para as entidades copiadas; identificadores de origem nutricional permanecem como proveniência.
- **FR-011**: Descartar Em Criação DEVE exigir confirmação, remover somente edição local e cancelar gravações pendentes; cancelar preserva o rascunho.
- **FR-012**: Salvar Prescrição e Ctrl+S DEVEM executar a mesma operação; envio suspende edição e novos envios.
- **FR-013**: Salvar DEVE concluir autosaves pendentes, capturar o último conteúdo visível e persistir a revisão local antes da confirmação clínica, inclusive antes do atraso de autosave.
- **FR-014**: Nova dieta DEVE reservar sua identidade definitiva na primeira tentativa e guardá-la no rascunho antes de gravar a prescrição; novas tentativas conferem e reutilizam a identidade.
- **FR-015**: Confirmar DEVE revalidar Conta, paciente ativo, relações, valores e snapshots. Falha de validação mantém a edição, identifica o motivo e não grava parcialmente.
- **FR-016**: Confirmar plano, refeições, variações, itens, snapshots e eventual substituição da vigente DEVE ser indivisível: tudo confirma ou nada muda.
- **FR-017**: Deve haver no máximo uma Vigente por Conta/paciente, garantida também na persistência. Somente nova dieta confirmada transforma a vigente anterior em Histórico.
- **FR-018**: Edição da vigente DEVE usar rascunho separado e exigir identidade/versão base ainda vigentes. Salvar preserva identidade e incrementa versão, sem criar histórico de cada edição.
- **FR-019**: Histórico DEVE ser somente leitura na interface, aplicação e persistência. Rota direta não autoriza edição; abrir cardápio não cria rascunho nem altera datas/atividade.
- **FR-020**: Conflito de versão/perda de vigência DEVE preservar edição e rejeitar sobrescrita; quando a base se tornar histórica, oferecer criação por cópia.
- **FR-021**: Após confirmação durável, remover somente a revisão confirmada, atualizar leituras e retornar ao perfil; não navegar anunciando sucesso antes da confirmação.
- **FR-022**: Rollback confirmado DEVE manter rascunho e dados clínicos anteriores, com erro explícito e nova tentativa pelo mesmo fluxo.
- **FR-023**: Resultado desconhecido DEVE exigir conferência por identidade estável e versão antes de repetir; leitura inconclusiva preserva o rascunho, sem afirmar sucesso/rollback ou reenviar automaticamente.
- **FR-024**: Falha apenas na limpeza após commit DEVE informar sucesso clínico e limpeza pendente; repetir somente a limpeza.
- **FR-025**: Histórico, fontes de cópia, cartão da vigente, contagem e atividade derivada DEVEM usar somente prescrições confirmadas. Em Criação não existe como prescrição persistida ou linha histórica.
- **FR-026**: Ações de histórico DEVEM respeitar rótulos Vigente/Histórico, leitura do cardápio e expansão acessível do ciclo. Prescrições confirmadas não são excluídas pelo fluxo normal.
- **FR-027**: Inserir TACO DEVE capturar nome, identidade/versão do dataset, quantidade, unidade, estado do alimento, base nutricional, conversões explícitas, nutrientes, origem da energia e versão da regra de cálculo.
- **FR-028**: Rascunhos e prescrições DEVEM conservar snapshots; leitura/recálculo por quantidade não dependem do catálogo vivo. Alterar/remover a fonte não modifica conteúdo já inserido.
- **FR-029**: Valores DEVEM seguir a Decisão 06: quantidade/base finitas e positivas, nutrientes/energia finitos e não negativos, ausência distinta de zero, conversões explícitas. Energia informada, inclusive zero, prevalece; 4–4–9 só preenche energia ausente quando identificado como estimativa.
- **FR-030**: Conservar precisão sem arredondamento intermediário; apresentar macros/fibras com uma casa, kcal inteiras e g/kg com duas casas, metade para cima. Alternar 100 g → 50 g → 100 g recupera o valor inicial pela base congelada.
- **FR-031**: Metas manuais/peso de referência DEVEM pertencer à prescrição, inclusive por variação. Cadastro atual e totais dos alimentos não os sobrescrevem; meta energética é distinta da energia prescrita.
- **FR-032**: Salvar/reabrir DEVE preservar modos, dias, alternativas e substituições; totais identificam a opção considerada sem somar alternativas mutuamente exclusivas.
- **FR-033**: Arquivar paciente DEVE preservar prescrições e invalidar edições pendentes. Salvar revalida estado ativo mesmo se limpeza falhar; restaurar não reativa automaticamente rascunhos invalidados.
- **FR-034**: Datas internas DEVEM ser ISO e identidades geradas fora da interface. Versão da prescrição e revisão do rascunho não dependem de datas formatadas.
- **FR-035**: Adoção DEVE retirar leitura/escrita legada de dietas, arrays canônicos de histórico no cadastro e transporte legado entre editor/ciclo, sem conversão, fallback ou gravação dupla. Preservar Conta/pacientes canônicos das etapas anteriores.
- **FR-036**: Evolução versionada do schema DEVE preservar Conta/pacientes, ter regressão e atualizar o contrato lógico dos dados de exportação futura, sem antecipar o exportador da Conta.
- **FR-037**: O fluxo DEVE funcionar sem rede após preparar recursos e reutilizar a exclusividade da base. Segunda aba não abre o banco; falha de armazenamento não autoriza fallback ou sucesso falso.
- **FR-038**: Salvar DEVE exigir pelo menos uma refeição com pelo menos um alimento válido no modo prescrito, tanto em nova dieta quanto em edição da vigente. Sem esse mínimo, preservar o rascunho, indicar o requisito não atendido e não iniciar a transação clínica. Não exigir refeições/alimentos adicionais por variação.

### Non-Functional Requirements

- **NFR-001**: Preservar design system, Atomic Design e fluxos existentes; limitar mudanças visuais aos estados/ações necessários à persistência.
- **NFR-002**: Superfícies alteradas DEVEM atender desktop a partir de 1024 px e WCAG 2.2 AA: teclado, foco visível, nomes acessíveis, feedback de erro/progresso e informação não dependente só de cor.
- **NFR-003**: UI DEVE usar hooks/casos de uso sem conhecer armazenamento físico, queries, tabelas ou regras de vigência; provedor permanece atrás das portas de persistência.
- **NFR-004**: Busca de alimentos DEVE retornar em menos de 100 ms após inicialização, medida com o dataset do produto; registrar ambiente/tempos, sem certificação multibrowser ou carga artificial de 100 mil itens.
- **NFR-005**: Testes DEVEM ser determinísticos, usar dados sintéticos isolados e cobrir contratos/falhas antes da implementação, sem mutar dados externos ou ambiente global.
- **NFR-006**: Erros DEVEM distinguir contexto, validação, conflito, indisponibilidade, rollback, resultado desconhecido e limpeza pendente, com recuperação observável; sem telemetria remota ou logs de conteúdo clínico.
- **NFR-007**: Informar limites de retenção do navegador e recuperação da edição não persistida, sem apresentar autosave como backup ou prometer sigilo por autenticação inexistente; não introduzir transmissão clínica remota.

### Key Entities *(include if feature involves data)*

- **Conta e paciente**: contexto local e titular clínico existentes; arquivado não aceita mutação clínica.
- **DietDraft**: edição local com Conta/paciente/contexto, revisão, conteúdo e data; edição da vigente carrega identidade/versão base, e primeira tentativa de nova dieta reserva identidade definitiva.
- **DietPlan**: prescrição identificada/versionada da Conta/paciente, Vigente ou Histórico, com datas, modo, metas e peso de referência.
- **Variação de ciclo**: cenário identificado/ordenado com tipo, nome, dias, metas e refeições.
- **Refeição e alternativa**: grupo ordenado com nome/horário e opções alimentares mutuamente alternativas.
- **Item e snapshot**: quantidade/unidade prescritas, proveniência, composição/base congeladas suficientes para leitura e cálculo independentes da fonte viva.
- **Fonte TACO**: referência de sistema sem proprietário de Conta, somente leitura nesta etapa.
- **Projeção do paciente**: resumo derivado das prescrições confirmadas, sem segundo histórico canônico no cadastro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Abrir, editar, autosalvar, copiar e descartar sem Salvar não alteram quantidade de prescrições, vigente ou atividade clínica em nenhum cenário de validação.
- **SC-002**: Reabertura recupera 100% dos campos da última revisão local confirmada das amostras simples/ciclo; o limite de edição pendente é informado.
- **SC-003**: Botão/Ctrl+S confirmam o último valor visível antes do autosave; cada nova dieta produz exatamente uma prescrição e nunca duas vigentes por paciente.
- **SC-004**: Falhas controladas não deixam registros parciais; interrupção após commit e erro de limpeza não duplicam prescrição nem removem revisão não confirmada.
- **SC-005**: Substituição/edição da vigente preservam integralmente o último conteúdo histórico; tentativas de edição direta/exclusão de histórico são rejeitadas.
- **SC-006**: Cópias completas preservam conteúdo sem compartilhar identidades das entidades copiadas; alterar o destino não modifica nenhum campo da origem.
- **SC-007**: Salvar/reabrir preserva snapshots, metas manuais, peso, modos, dias e opções. A regressão da Decisão 06 conserva 128 kcal/100 g e 64 kcal/50 g do arroz cozido, sem substituição por 4–4–9.
- **SC-008**: Conta/paciente incompatíveis, paciente arquivado, histórico ou versão desatualizada são rejeitados sem alterar a prescrição confirmada.
- **SC-009**: Jornada preparada funciona com rede desligada; segunda aba não acessa a base; busca TACO permanece abaixo de 100 ms após inicialização.
- **SC-010**: Nenhum consumidor do fluxo de dietas lê/grava storage legado; Conta/pacientes permanecem funcionais e testes de teclado/estados das superfícies alteradas passam.
- **SC-011**: Dieta sem refeições ou somente com refeições vazias é rejeitada em 100% dos testes de botão/Ctrl+S; uma refeição com um alimento válido atende ao mínimo, inclusive ao editar a vigente, sem enfraquecer as outras validações.

## Premissas documentadas e dependências

- A etapa 3 inclui todas as fases 0–5 da Decisão 04; não se limita à fase interna de salvamento.
- A [PoC da etapa 1](../30-08-26-prova-tecnica-base-local/poc-report.md) registra aprovação técnica restrita aos cenários descritos, sem certificação automática da integração clínica.
- A [etapa 2](../30-08-26-dieta-db-segunda-etapa/spec.md) fornece Conta/pacientes. Seu [relatório](../30-08-26-dieta-db-segunda-etapa/validation-report.md) registra evidências e limitações; este SDD não reexecutou esses testes.
- Dietas ainda usam persistência legada no código. Preservar interações não significa conservar escrita direta, dados de teste, exclusão de prescrições ou estado contrário às decisões.
- A fonte integrada é TACO; não implementar biblioteca da etapa 4 nem leitura clínica dependente da origem viva.
- Preservam-se as decisões de [Puxar dietas anteriores](../completed/26-08-26-refatorar-puxar-dietas-anteriores/spec.md): seleção exclusiva, fontes em ordem decrescente de data, botão desabilitado sem fontes, ações desabilitadas sem seleção, cópia completa substituindo o rascunho e metas da variação ativa quando a origem for ciclo. Fechar/cancelar não aplica mudanças; só anunciar cópia concluída após persistir a edição local.
- Preservar a inicialização atual de nova dieta no modo simples com metas zeradas; captura do peso existente não autoriza preencher metas automaticamente. O mínimo confirmado pelo usuário se sobrepõe ao antigo salvamento de dieta somente com metas.
- O conteúdo mínimo foi confirmado pelo usuário em 2026-08-30 e consta de FR-038. Rascunhos podem permanecer incompletos; a exigência vale para a confirmação clínica.
- Entrega documental: execução somente após validação humana, por `/speckit-implement`.
