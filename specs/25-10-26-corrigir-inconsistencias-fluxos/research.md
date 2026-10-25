# Research — 2026-10-25

## R1 — Contratos vigentes

**Decision**: reconciliar afirmações ativas com ADR-009, `refs/dieta-db/index.md` e evolução de navegação 20/23-10, preservando cronologia e logs.
**Rationale**: PRD remove escala em US3 e ainda a promete em resumo/persona/roadmap; ADR-007 promete `+%` e `.diet`. PRD §3.1 descreve motor adotado como PoC e arquivo sem cifra. ADR-007 mantém catálogo no dashboard, movido a Configurações → Saves. Guia de setup contradiz no início seu próprio relato posterior de deploy.
**Alternatives considered**: reintroduzir recursos antigos ou reescrever toda documentação histórica mudaria escopo e apagaria evidência.

## R2 — Reload e helper compartilhado

**Decision**: corrigir `library.spec.ts` e reutilizar `profile-session.ts` via Settings → Saves.
**Rationale**: `/home` é alias; onboarding esperado está superado. Consumidores identificados: library-fixture, profile-save-load, backup-persistence, clinical-persistence, diet-offline-persistence, component-adequation e settings-saves. Pickers controlados usam OPFS, não arquivo externo real.
**Alternatives considered**: trocar só regex deixaria persistência sem prova; duplicar helper só para biblioteca deixaria callers divergentes.

## R3 — Inventário

**Decision**: comparação de conjuntos de páginas e metadados mínimos na matriz existente.
**Rationale**: nove registros contra 24 arquivos. Smoke valida formato; navigation inspeciona fonte; behavior-preservation concatena regex. Testes especializados existem fora desse índice.
**Alternatives considered**: nova suíte para cada página ou estados visuais obrigatórios em aliases não resolvem a alegação enganosa e duplicam trabalho.

## R4 — 503, colunas e lock

**Decision**: não declarar causa atual sem etapa/erro sanitizado; comparar operação inteira com contratos SQL vigentes.
**Rationale**: `src/lib/server/online-db/repository.ts:15` define owner em transação; linha110 bloqueia perfil; linhas133–139 inserem 13 colunas. Migration `20261011002435_online_account_saves.sql:98` concede exatamente essas colunas. `20261022120000_professional_profile_and_save_label_updates.sql:6` acrescenta UPDATE de colunas cifradas e policies. API converte erro inesperado em503; teste `save-registry.test.ts:235` também cobre wrapping ausente. Pesquisa delegada somente leitura confirmou caminhos; nenhum banco consultado.

`has_column_privilege` considera concessão de tabela ou coluna; `has_table_privilege` falso isolado não prova falta de acesso às colunas. [PostgreSQL: consulta de privilégios](https://www.postgresql.org/docs/current/functions-info.html#FUNCTIONS-INFO-ACCESS-TABLE).

`SELECT ... FOR UPDATE` exige UPDATE em ao menos uma coluna. Falha pode ocorrer antes do INSERT; é uma hipótese estática, não causa observada. [PostgreSQL: SELECT](https://www.postgresql.org/docs/current/sql-select.html).

**Alternatives considered**: INSERT de tabela, GRANT ALL, retirar lock/RLS ou reaplicar migration antiga sem comparar estado; rejeitados por risco e ausência de prova. Estado correto exige zero alteração de grants.

## R5 — Jev

Chamada substantiva via helper bem-sucedida, modelo `jev-1.14.0`. Choice entre afirmar grant ausente e verificar colunas/erro escolheu verificar antes de corrigir: confiança1,00/probabilidade1,00. Noul amplo de completude retornou0,55, insuficiente para atestá-la: completude será determinada pela matriz de rastreabilidade F1–F5. Nenhuma credencial enviada.

Revisão posterior do mapa de tarefas retornou “falta um achado” com confiança0,58 (probabilidade0,79), sem apontar qual. O resultado motivou revisão discriminada dos cinco achados. Pergunta focada em identificar o grupo concretamente descoberto como ausente retornou `none_supported`, confiança0,81/probabilidade0,84 (F5:0,12, demais≤0,02). A divergência foi preservada aqui: a conclusão documental usa também a comparação explícita de requisitos/tarefas e critérios de encerramento; nenhuma dessas respostas é prova de runtime ou autorização para execução.

Skill Supabase consultada para planejar a execução local. O índice [Supabase Changelog](https://supabase.com/changelog.md) foi lido em2026-10-25; nenhum anúncio recente exige mudar o desenho de grants por coluna no PostgreSQL local. O aviso de TLS para APIs HTTP remotas não implica ampliação desta correção local.

## R6 — Spec Kit

**Decision**: usar infraestrutura local legível/compatível sem atualizar ferramentas globalmente nesta solicitação documental.
**Rationale**: `specify version` e `.specify/integration.json` indicam0.13.0; seis skills e scripts presentes. [Último release oficial consultado](https://github.com/github/spec-kit/releases/tag/v1.2.3) é1.2.3 em2026-10-25. Versão foi verificada; atualizar infraestrutura do projeto não é requisito da correção.

Checklist tentou `check-prerequisites -Json`, que nesta instalação exige plan já existente. Âncora validada com `-Json -PathsOnly`; requisitos lidos diretamente, sem antecipar Plan. Após gerar plan, repetir checagem normal. Não houve alteração de ferramentas. Extensões locais têm apenas hook `before_implement`, sem hooks aplicáveis ao SDD documental.

## R7 — Encerramento

**Decision**: T008 continua pertencendo à feature original, com complemento corretivo do diagnóstico e relatório desta feature distinguindo seis camadas.
**Rationale**: login e503 observados não substituem save real; cenário controlado interceptou cadastro/authorize. Relato remoto de docs é histórico, não prova atual. Arquivo externo sintético complementa OPFS na sessão real.
**Alternatives considered**: concluir com mocks ou duplicar T008 esconderia a lacuna já registrada.
