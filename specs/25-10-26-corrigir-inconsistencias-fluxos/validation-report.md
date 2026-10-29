# Validation report — correção dos fluxos

**Estado**:concluído localmente em2026-10-25;16/16 tarefas verificadas e segunda convergência limpa. T008 original validada localmente. Checkpoint:`0c1d2369cc76e5e6d2b37d15cac6fafc10d6e7fa`.

## Achados e rastreabilidade

| Achado | Requisitos / tarefas | Resultado observado |
| --- | --- | --- |
| F1 | FR-002; T005,T006 | Corrigido: PRD/ADR-007/setup descrevem metas manuais, porções individuais, save principal/PGlite e limites da cifra. Histórico preservado/datado, buscas e links dos cinco documentos passaram. |
| F2 | FR-004; T007–T009 | Corrigido e validado: helper/callers em Settings→Saves. Biblioteca conserva nome/porção30/proteína24/carbo3/gordura2 em arquivo OPFS decifrado antes/depois de reload, com três chaves legadas ausentes. Todos os consumidores passaram. |
| F3 | FR-003; T006,T009 | Corrigido e validado: contratos dashboard/aliases/modal/sidebar. Auth/logout, guardas, Settings e testes de aliases passaram; logout seleciona menuitem na sidebar. |
| F4 | FR-005/006; T011–T013 | Corrigido: conjunto de24páginas, sem número fixo como contrato. Matriz classifica estados/parâmetros/evidências/lacunas. Negativos de omissão/duplicata/extra/rename/Windows passaram. Inspeção estática não certifica navegação. |
| F5 | FR-007–009; T002–T004,T010,T016 | Corrigido e validado localmente:42501 no lock do perfil, migration existente ausente, INSERT por coluna já permitido. Cadastro/authorize reais, arquivo físico, paridade Agenda, reabertura, foco, bloqueio e isolamento passaram. T008 original atualizada com a prova completa. |

## Diagnóstico e reparo local

Role efetiva online_runtime; INSERT nas13colunas permitido; RLS/FORCE RLS ativos. História local inicialmente só20261011002435. UPDATE no perfil ausente e SELECT FOR UPDATE falhou42501 antes do INSERT. Regressão falhou nessa etapa antes do reparo. Aplicada somente a migration existente20261022120000 via `npx --yes supabase migration up --local`, sem reset/schema clínico novo/ACL ampla/remoto. Harness conecta com runtime restrito e não altera membership global. O log anterior foi complementado sem apagar a hipótese histórica refutada.

## Camadas de evidência

1. **Estática**:20/20 requisitos com tarefas,16tarefas verificadas,40itens de qualidade documental. Contratos/inventário revisados; presença de arquivo não certifica execução.
2. **Determinística / SQL**:22arquivos/137testes passaram em três blocos distintos (15/85,5/39,2/13), sem skips. Inclui PGlite, inventário/negativos, dashboard/Settings/sidebar, guardas/aliases, backup/lembretes, SQL e fixture externa. Auth do servidor é mockado; SQL usa banco local/papel real. Aviso JSDOM de navegação entre Documents não impediu os39testes adicionais e não equivale a browser real.
3. **Navegador controlado**:26casos dos11arquivos do quickstart passaram no estado final, em blocos:7aprovados antes da interrupção do runner,18/19 nos restantes e Settings3/3 na repetição após corrigir espera da Agenda5s. Não é rodada global ininterrupta. Helpers usam bytes OPFS reais com pickers substituídos; Auth/cadastro/authorize são reais. Casos1/3 de Settings e guardas que interceptam endpoints continuam explicitamente controlados. Sem skips.
4. **Sessão autenticada**:contas sintéticas/Mailpit local. Auth completo/reset/replay/logout/cadastro/authorize/isolamento passaram sem interceptar esses endpoints. Na jornada física, a conta inicial foi confirmada como e2e antes da preparação; troca real para outra conta vazia e retorno sem contexto anterior. Quatro authorize200 observados. Cadastro201 observado nos testes reais de rotina/online-saves; criação manual deste arquivo precedeu o observador, sem status201 individual capturado.
5. **Persistência observada**:arquivo físico `nutridiet-profile.nutridiet` criado pelo operador no seletor nativo. Native picker confirmado, handle externo distinto de OPFS, envelopev2/AES-256-GCM decifrado e vazio após primeira reabertura. Preparado pela UI um paciente sintético com um acompanhamento BOTH: dieta25-10/avaliação26-10. Depois dos checkpoints, Início e Agenda coincidiram nos sete dias [1,1,0,0,0,0,0]; foco/Assinatura, reload/reabertura, hash imutável e zero mutações de leitura passaram. Deadline exercitado com relógio browser controlado, sem mocks de autorização; não é espera real de oito horas. Logout fecha contexto e outro owner não vê os itens. A fonte inicial inválida foi rejeitada corretamente; corrigida só a fixture, com teste red→green. Nenhum dado pessoal preexistente foi alterado; o novo save mantém o paciente sintético identificado.
6. **Paridade remota**:não verificada, fora do escopo. Relatos de publicação histórica não confirmam o ambiente atual.

Evidência física sanitizada:[external-file-evidence.json](external-file-evidence.json). SHA-256 após preparação e invariável na leitura:`69e9bef5939d83a83aab96c6c87c4dff23f47d73b14f8a0c9d657d9f0cc3398c`. Preparação/mutações legítimas foram separadas da janela de leitura; POST authorize não foi contado como mutação clínica.

## Validações técnicas e limites

- Type-check e ESLint dos arquivos TS/TSX alterados passaram; repetidos para o teste novo da fixture externa. Instrumentação temporária removida.
- Build passou:Next15.5.22, tipos e geração de páginas. Nenhuma fonte de produção mudou depois; execução de produção autenticada em HTTP foi corretamente recusada pelo guard HTTPS, preservado.
- Design system estrito:40fontes/11categorias/zero findings; Atomic Design:170arquivos/zero violações. Artefatos gerados foram restaurados ao checkpoint; resultados registrados no log.
- Vitest global concorrente com build foi interrompido após timeout PGlite; o mesmo caso passou sequencialmente entre os85. Suíte global completa não é alegada.
- Dois runners controlados pela ferramenta terminaram exit=-1 sem stack. CLI separada própria completou os arquivos restantes e a repetição nominal falha→correção→mesmo teste→regressão. Não se atribui causa de produto à interrupção sem prova.
- Uma instância dev própria em localhost3000; processos/trabalho alheios preservados. Traces/HAR desligados; nenhuma chave/token/credencial em evidência versionada. Sem deploy/push/SQL remoto ou integração de pagamentos.

## Convergência

Iteração1:36requisitos/cenários,5decisões do plano,5princípios constitucionais;1partial/HIGH por prova física pendente,0missing/contradicts/unrequested. Acrescentada T016 na fase8. Depois do relato do operador, rejeição da fonte reproduzida e fixture corrigida; retomada com novo save nativo criado pelo operador, sem exigir sobrescrita/importação no arquivo dele.

Iteração2 concluída sobre os artefatos e evidências atuais:36requisitos/cenários,5decisões e5princípios;zero achados. tasks.md permaneceu byte a byte inalterado na passada limpa (SHA-256 B980A655291F691146643864D064034B9544BC664ECF2C95A498C4062F00C48C). Analyze final:20/20 requisitos com cobertura,16/16 tarefas mapeadas,zero conflito crítico. Execução e verificação dos hashes no [implementation-log.md](implementation-log.md).
