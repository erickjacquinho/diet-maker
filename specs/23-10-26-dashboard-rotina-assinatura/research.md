# Research: evidências e decisões

**Data**: 2026-10-23. Evidência estática do checkout atual; nenhuma sessão de navegador foi observada.

| Evidência | Resultado para o desenho |
| --- | --- |
| src/app/dashboard/page.tsx | Início é placeholder com botão “Abrir configurações de saves”. |
| src/app/SessionAwareAppShell.tsx | Dashboard aceita conta autenticada sem save; Agenda e rotas clínicas têm gate. |
| src/lib/application/browser-composition.ts: getBrowserPatientRuntimeIfActive/getBrowserPatientRuntime | O acesso ao runtime depende de isSaveAuthorized; existência de runtime no snapshot não basta. |
| src/hooks/usePatientsPage.ts | listActivePatients gera patients, isLoading, error e retry; leitura automática no mount. |
| src/app/agenda/page.tsx: patientAppointmentDates/eventsByDate | Datas distintas por tipo têm prioridade, fallback legado; semana começa domingo. |
| src/lib/patientListDateUtils.ts | getTodayDateKey, normalizeDateKey e formatEventType já resolvem calendário local/validação/rótulos. |
| src/components/organisms/SettingsDialog.tsx | SettingsTab profile/save; defaultTab inicial; draft preservado ao alternar; altura fixa. |
| src/app/navigation/SidebarNavigationAdapter.tsx | Um modal existente, ref do gatilho, evento nutridiet:open-saves, suspensão/busy já integrados. |
| tests/browser/settings-saves.spec.ts | Depende do CTA atual e mede geometria/foco em 1024/1280/1600px; usa APIs mockadas. |
| docs/prd/PRD.md §2.3 | Consultas e módulo financeiro fora do escopo; não ampliar esses domínios neste plano. |

## D1 — Reutilizar a rotina, condicionar a leitura à autorização

**Decision**: uma subárvore local lê usePatientsPage somente com runtime autorizado e é recriada por instância de runtime.
**Rationale**: já há dados reais; conta sem arquivo não pode disparar leitura clínica nem carregar dados anteriores.
**Alternatives considered**: placeholders para toda a rotina ocultariam capacidade existente; nova API/store de calendário adicionaria persistência sem necessidade.

## D2 — Compartilhar apenas a interpretação de datas

**Decision**: extrair patientAppointmentDates sem alterar o contrato usado pela Agenda; projetar semana e lista no mesmo helper.
**Rationale**: respeitar dieta/avaliação em dias distintos e legado, com um teste de fronteiras.
**Alternatives considered**: importar uma rota de outra viola organização; copiar a lógica manteria duas regras divergentes; extrair toda a Agenda ampliaria o diff.

## D3 — Assinatura apenas informativa

**Decision**: terceiro tab do modal atual, evento específico e linha secundária com atalho no Início; sem dados financeiros ou controles falsos.
**Rationale**: corresponde à navegação aprovada e ao pedido de placeholders.
**Alternatives considered**: formulário de cobrança no dashboard mistura rotina e gestão; implementação de pagamentos não foi solicitada; rota/configuração paralela duplica destino.

## D4 — Convenções limitadas ao que existe

**Decision**: Dom–Sáb, lista de hoje ao fim da semana, sem lembretes pessoais, criação de consultas, datas/hora inventadas, alertas financeiros ou paginação nova.
**Rationale**: calendário compacto e próximas ações usam o mesmo conjunto, sem ampliar domínios.
**Alternatives considered**: calendário geral por conta, múltiplas semanas e filtros são trabalho adicional sem requisito.

## Consulta estruturada Jev

Na criação original deste SDD, o helper oficial retornou jev-1.14.0. Choice entre reuso condicionado, todos placeholders e serviços novos: reuso condicionado recebeu probabilidade 1.00 e confidence 1.00. É apoio histórico à avaliação, não autorização nem prova de funcionamento. A navegação Início/Configurações já havia sido aprovada pelo usuário. A minimização posterior não realizou nova consulta Jev.

## Ferramentas e governança

- Skill SDD encontrada em C:/Users/Jacques/Skills/sdd/SKILL.md; seis skills speckit locais legíveis, preparação configurada.
- Verificação oficial de versão feita em [release atual do Spec Kit](https://github.com/github/spec-kit/releases/tag/v1.2.3), publicado em 2026-10-22. A instalação local declara 0.13.0 em .specify/integration.json e init-options.json. Versões divergem; nenhuma atualização de infraestrutura realizada para produzir este SDD.
- Extensions.yml contém apenas before_implement; nenhum hook before/after dos estados documentais é executável nesta tarefa.
- Plan setup reporta o nome do diretório como BRANCH lógico quando há override; o Git real continua feat/configuracoes-perfil-save.
- Nenhuma questão material aberta: navegação e placeholders aprovados; regras de datas/semana seguem fonte existente; domínios futuros estão excluídos.

## Preservação

Havia alterações locais em SettingsDialog, adapter, Saves, estilos, backend e testes. O plano não incorpora, reverte, publica ou classifica essas alterações como entrega desta feature. A criação deste SDD modifica apenas sua pasta e o ponteiro .specify/feature.json.

## Minimize — 2026-10-23

As nove regras de .agents/rules foram lidas integralmente antes da revisão. Spec e modelo de dados permanecem intactos. O plano usa a mesma função privada de montagem dentro de page.tsx, fixtures pequenas junto dos testes e ampliação de tests/browser/settings-saves.spec.ts, evitando três arquivos novos sem perder isolamento ou cobertura. Rotina e seus estados são entregues juntos; testes/implementação duplicados de uma fase posterior foram reunidos. Oito tarefas substituem quatorze, mantendo todas as provas de quickstart.md e os 20 requisitos/critérios.
