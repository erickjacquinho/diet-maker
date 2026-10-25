# Contrato de correção e encerramento

Este documento define o delta e referencia contratos existentes; não cria endpoints ou um contrato de persistência paralelo.

| Achado | Origem verificada | Resultado exigido | Encerramento |
| --- | --- | --- | --- |
| F1 | PRD resumo/persona/§3.1/roadmap, ADR-007 builder e atualização 20-10; setup introdução/estado | Metas manuais/porções individuais, `.nutridiet` principal, PGlite adotado, proteção limitada conforme ADR-009/refs; operação histórica datada | Busca dirigida e revisão sem contradição ativa nos temas corrigidos e referências diretamente afetadas. |
| F2 | `tests/browser/library.spec.ts:20–42`, fixture e helper | Checkpoint e recuperação após reload pelo fluxo Settings → Saves; mesmo arquivo e valores | Teste corrigido e todos os consumidores de helper passam; arquivo OPFS declarado controlado; prova externa separada. |
| F3 | contratos `10-10-26-integrar-supabase-contas-saves` | Conta completa → `/dashboard`; aliases compatíveis; gestão no modal, logout sidebar | Contratos coerentes e regressão de auth/aliases/Settings existente preservada. |
| F4 | nove entradas em matriz vs 24 páginas; testes genéricos por regex | Censo de conjunto, unicidade, metadados/evidências e títulos honestos | Casos negativos e conjunto atual passam; evidência funcional não é atribuída a inspeção estática. |
| F5 | T008 e log anterior com cadastro503; grants por coluna e lock no código atual | Diagnóstico sanitizado da etapa/causa, reparo mínimo condicional e aceite real | Cadastro/authorize reais, isolamento e rotina/Agenda corretos; T008 original atualizada só após passar. |

## Interface e segurança mantidas

- Conta completa autenticada entra em `/dashboard`; perfil incompleto continua em `/criar-conta?completar=1`; não autenticado segue `/login` pelas guardas vigentes.
- `/home` e `/saves` são aliases de `/dashboard` preservando parâmetros; `/calendario` mantém alias de Agenda. Nenhum alias libera clínica sem runtime autorizado.
- Criar/importar/abrir/localizar/backup permanecem em Configurações → Saves; atalhos do dashboard abrem esse destino. Modal preserva altura, foco e rascunhos. Logout exclusivo da sidebar.
- `POST /api/saves` mantém validação, idempotência e registro mínimo; `/authorize` valida owner/sessão/prova. Resposta503 continua falha fechada, sem ampliar acesso nem revelar causa interna.
- `online_runtime` é papel restrito, NOBYPASSRLS, sem superuser; owner vem do guard/transação. Browser não recebe conexão administrativa nem escolhe autorização por alegação própria.
- Nenhum payload clínico, token ou chave em logs, screenshots, traces ou relatório. Erro de diagnóstico preserva só etapa/código técnico sanitizado e requestId seguro.

## Camadas de evidência

1. **Estática**: leitura de fontes/documentos; não demonstra interação.
2. **Determinística**: unidades/contratos, com dependências reais ou simuladas descritas.
3. **Navegador controlado**: explicitar endpoints/pickers simulados e dados sintéticos.
4. **Sessão autenticada**: login e API real sem interceptar os endpoints exercitados; conta de teste.
5. **Persistência observada**: distinguir arquivo OPFS do harness de arquivo externo; confirmar checkpoint e conteúdo após reabertura.
6. **Paridade remota**: não verificada nesta feature; relatos antigos não comprovam estado atual.

## Negativas obrigatórias

Outro owner não lê/autoriza o save; owner ausente não acessa dados. Checkpoint falho não é sucesso. Mudança de contexto não apresenta resultado antigo. Falha de ambiente/causa não reproduzida bloqueia aceite sem alteração especulativa. Permissão de tabela falsa não é erro se grants por coluna cobrem operação. Preparação de dados é separada da janela de observação sem mutações.
