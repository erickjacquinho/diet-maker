# Estado do fluxo SDD

Data: 2026-10-10, America/Sao_Paulo.

Diretório âncora: `specs/10-10-26-integrar-supabase-contas-saves`.

**Estado atual após minimize**: 29 tarefas abertas, 42/42 requisitos cobertos, 2 checklists (16/16 e24/24), sem implementação. Revisão solicitada pelo usuário e aplicada somente ao pacote documental; aguarda validação humana do plano para execução. O histórico abaixo inclui a primeira versão de 46 tarefas.

## Preparação e especificação

- Estado 0 concluído: `prepare_sdd.py` retornou `speckit.configured=true`, diretório criado e seis skills legíveis.
- Versão verificada no repositório oficial: release mais recente `v1.1.3`, publicada em 2026-10-09. CLI e integração locais: `0.13.0`, portanto não estão na versão mais recente. A instalação existente atende às seis skills requeridas e ao diretório explícito; nenhuma atualização global ou substituição de infraestrutura local foi executada.
- Referência da versão: [release oficial 1.1.3](https://github.com/github/spec-kit/releases/tag/v1.1.3).
- Estado 1: `spec.md` escrito a partir do template resolvido, pedido preservado em `.sdd-context.json` e checklist inicial com 12/16 itens; pendências explícitas encaminhadas para a clarificação.
- Estado 2 concluído: cinco respostas integradas, A/A/B/A e padrão de cadastro ajustado com “1–6 meses” e “6–12 meses” além de anos. Sem marcadores de clarificação funcional pendentes.
- Checklist reavaliado após a resposta 5: 12/16 → 16/16, quatro itens passaram, nenhuma regressão.
- Estado 3 concluído: dois checklists, 16/16 e 24/24, requisitos avaliados sem falhas abertas. Helper de caminhos executado com `-Json -PathsOnly` para preservar a ordem checklist antes do plano; modo simples exige plano antecipado na instalação local. Reavaliados após pesquisa e limites explicitados, sem regressão.
- Jev consultado com o mínimo de requisitos e três políticas de conexão para apoiar a pergunta 2. Resposta bem-sucedida de `jev-1.13.0`: recomendação A (internet para login/criação/abertura; continuidade local do save aberto por até oito horas), confiança 0,97, probabilidades A=0,98, B=0,00, C=0,02. Isso é apoio à recomendação, não resposta do usuário, autorização de implementação ou prova de segurança.
- Jev consultado para apoiar a pergunta 3: A = conteúdo clínico processado temporariamente no backend, chave somente no servidor e checkpoint protegido dependente de conexão; B = conteúdo clínico inteiramente local, navegador usa material criptográfico autorizado e pode cifrar checkpoints durante a janela offline. Resposta de `jev-1.13.0`: B, confiança 0,54, probabilidades A=0,23, B=0,77. A baixa confiança motivou confirmação humana; o usuário escolheu B, agora integrado à especificação com o limite explícito de material criptográfico utilizável pelo navegador.
- Jev consultado para apoiar a pergunta 4: A = adoção explícita pela primeira conta autenticada de identidade legada ainda não vinculada, com cópia cifrada e original preservado; B = adiar importação legada e aceitar somente saves novos/protegidos nesta fase. Resposta de `jev-1.13.0`: A, confiança 0,90, probabilidades A=0,95, B=0,05. Usuário confirmou A e a resposta foi integrada. O aceite não comprova o dono histórico de um JSON nem protege retroativamente cópias antigas legíveis ou adulteradas.
- Jev consultado para avaliar o padrão proposto da pergunta 5: login por e-mail, verificação por link antes do primeiro acesso, campos solicitados obrigatórios, pacientes por mês e experiência em anos com números não negativos. Resposta Noul de `jev-1.13.0`: probabilidade 0,89 de adequação; sem confiança separada. Resposta humana final integrou o padrão com as faixas 1–6 e 6–12 meses; clarificação funcional encerrada.
- Estado 4 concluído: plan/research/data-model, três contratos e quickstart sem placeholders. Dois agentes somente leitura de pesquisa conforme Phase0; sem implementação. Constitution Check antes/depois PASS documental. Hooks before/after_plan ausentes.
- Estado 5 concluído: setup-tasks resolveu a âncora/template; versão inicial com 46 tarefas, consolidada por minimize em29, todas com paths/resultados/provas e cobertura explícita. Hooks de tasks ausentes.
- Estado 6 concluído: catálogo/arquivos SKILL confirmados; 29/29 tarefas atuais com uma atribuição, 11 especializadas em uso e duas tarefas com general. Teste e código do mesmo módulo permanecem em ordem dentro da tarefa consolidada.
- Estado 7 concluído: Analyze identificou U1 (reparo de perfil falho após e-mail confirmado); correção documental pela SDD, repetição dos estados4–6 afetados e segunda análise sem finding aberto. 42/42 requisitos cobertos, nenhuma tarefa órfã, skill inválida ou link relativo ausente nos documentos centrais. Hooks de analyze ausentes. Resultado em analysis-report.md; não são testes de código.
- Estado 8: pacote pronto para revisão humana; implementação aguarda validação do usuário. Nenhum recurso do plano está declarado implementado.

## Revisão minimize

- Todas as nove regras de .agents/rules lidas integralmente antes de analisar/alterar. Spec/constituição/contratos funcionais permanecem.
- Retirados endpoint de relato de gravação, coluna de progresso, updated_at sem mutação prevista e source sem efeito na autorização; novo/legado usam o mesmo registro privado imutável. Sem consumidores atuais em src/tests.
- Retentativa conserva IDs não secretos na associação local planejada, sem store adicional, segredo persistido ou etapa manual; disponibilidade/checkpoint continuam no file port/session existentes.
- 46 tarefas anteriores mapeadas para29, reunindo cenários antes do código e uma jornada integrada. Reexecutar matriz já aprovada só por mudança/falha/risco aberto.
- Análise revalidada no pacote consolidado; nenhum requisito/tarefa/skill sem cobertura. Spec preservado byte a byte. Nenhuma consulta substantiva ao Jev nesta revisão: preflight no_decision, sem atribuir a ele as simplificações.

## Evidência do estado atual do produto

- `src/app/page.tsx`: redireciona `/` para `/home`; não existe landing pública implementada.
- `src/app/layout.tsx` e `src/app/SessionAwareAppShell.tsx`: shell global com gate de profile local, sem autenticação online. Páginas públicas novas precisam ficar fora do gate clínico na implementação futura.
- `src/lib/infrastructure/file-system-access/browser-save-file.ts`: lembra uma única referência de arquivo (`current`) no IndexedDB; não existe catálogo por conta online.
- `src/lib/application/profile-session.ts`: carrega o `account` do envelope e restaura dados locais. Hoje esse identificador não comprova identidade online nem propriedade criptográfica.
- `src/lib/domain/account.ts`: Conta clínica local, diferente da identidade Supabase proposta.
- `refs/dieta-db/11-recuperacao-e-portabilidade-local.md` e `13-protecao-local-e-backup-simples.md`: `.nutridiet` JSON UTF-8 sem criptografia/senha, com migração que preserva o original.
- `refs/dieta-db/12-autenticacao-online-e-soberania-local.md`: fase futura anteriormente aprovada com dados clínicos locais, sem trânsito pelo serviço de identidade e janela offline de oito horas. Conferir a substituição de regras com o pedido atual, sem assumir aprovação para conflito.
- `docs/adr/ADR-009-nutridiet-principal.md`: arquivo principal e área de trabalho local têm estados diferentes. A disponibilidade de localização na dashboard não substitui confirmação de checkpoint.

## Documentação externa conferida

- [Senhas do Supabase](https://supabase.com/docs/guides/auth/password-security): o serviço guarda hashes bcrypt com salt; senha não é um segredo armazenado com criptografia reversível.
- [Segurança da Data API](https://supabase.com/docs/guides/api/securing-your-api): grants, schemas e RLS controlam alcance e acesso. Deve negar acesso de navegador às tabelas/funções próprias, não confiar somente em esconder uma chave da interface.
- [Referências e permissões de arquivo](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access): referências podem ser lembradas no IndexedDB; permissões devem ser verificadas e eventualmente solicitadas novamente com ação do usuário. Caminho textual não concede acesso ao disco.
- Changelog do Supabase consultado em 2026-10-10. Aviso de 2026-09-25 sobre Postgres e cifra legada em pgcrypto deve ser considerado se a arquitetura futura usar criptografia do banco; não há implementação de pgcrypto neste pacote.
- Inventário Supabase somente de leitura: conector respondeu e não retornou projeto com nome relacionado a Diet Maker/NutriDiet. Nenhum projeto de outro produto foi selecionado ou alterado. O alvo dedicado e a organização são entradas de execução para o provisionamento futuro, antes de qualquer DDL; não criar projeto ou presumir custos durante o planejamento.

## Limites desta execução

Somente documentação da nova feature e ponteiro `.specify/feature.json`. Alterações preexistentes do checkout foram preservadas. Sem branch nova, commit, teste de código, atualização de dependências, consulta a conteúdo clínico, SQL remoto ou deploy. No turno inicial o preflight informou `request_type=no_decision` e não houve consulta substantiva. Nas clarificações seguintes, Jev foi consultado para apoiar recomendações; controle de chave, política de conexão e ausência de trânsito clínico com uso criptográfico local foram escolhidos pelo usuário.
