# UI Contract: Início, Agenda e Configurações

**Status**: proposto; execução após validação humana por /speckit-implement.

## Responsabilidades

- /dashboard mantém nome Início e apresenta rotina antes da assinatura.
- O app consulta a autorização existente e só monta a rotina com runtime autorizado.
- DashboardAgenda é uma função privada no próprio src/app/dashboard/page.tsx; lê uma vez o hook existente e compõe componentes/tokens, sem arquivo/API públicos e sem controlar cobrança ou persistência.
- agenda-summary fornece interpretação compartilhada e projeção pura; a Agenda importa a mesma interpretação sem mudar seus controles.
- SettingsDialog continua dono das abas/rascunhos/fechamento; SidebarNavigationAdapter continua dono da abertura e retorno de foco.

## Navegação

| Origem / ação | Destino / efeito |
| --- | --- |
| Início → Abrir agenda | /agenda existente; nenhuma escrita. |
| Próxima ação → Abrir agenda | /agenda; nenhum salto automático para formulário clínico. |
| Início → Abrir configurações de saves | nutridiet:open-saves atual; aba save. |
| Início → Gerenciar assinatura | novo Event('nutridiet:open-subscription'); aba subscription. |
| Sidebar → Configurações | perfil como aba inicial atual; assinatura disponível pelo tab. |
| Fechar modal | volta ao botão que o abriu, respeitando draft/busy/suspended. |
| Logout | somente sidebar, fluxo existente. |

Evento de assinatura não tem payload nem autoridade. Listener captura botão ativo, ajusta SettingsTab e abre o modal atual. Deve ter cleanup e respeitar suspensão/busy/rascunhos: não descartar nem montar outro modal para atender ao evento. Quando indisponível por operação já em curso, a solicitação não força navegação. Não criar event bus genérico.

## Apresentação da rotina

- Semana: lista semântica de sete datas Dom–Sáb, com indicação acessível de hoje e contagens, inclusive zero. Sem comportamento de seletor, drag ou grade de teclado inventada.
- Ações: todos os acompanhamentos de hoje ao fim da semana, incluindo hoje/sábado; por data, nome pt-BR e tipo. Texto “Atualização de dieta” ou “Atualização de avaliação”, data e nome; chave por paciente/tipo/data.
- Nome longo pode quebrar linha; não omitir tipo/data. Não renderizar valores clínicos.
- “Abrir agenda” só oferecido como acesso à rotina quando há arquivo autorizado, de acordo com o gate atual.
- Hoje segue calendário local, normalizado pelas funções existentes; listeners de foco/visibilidade apenas recalculam a projeção.

## Estados e mensagens

| Estado | Apresentação |
| --- | --- |
| Sem arquivo autorizado | “Abra um save para consultar sua semana e próximas ações.” + “Abrir configurações de saves”. |
| Loading | “Carregando sua semana…” em status; nenhuma lista anterior. |
| Error | “Não foi possível carregar sua rotina.” com erro útil disponível e “Tentar novamente”; nenhuma lista anterior. |
| Loaded / semana sem ocorrências | Sete datas com zero e “Nenhum acompanhamento nesta semana.” |
| Loaded / ações vazias | “Nenhuma próxima ação nesta semana.” |
| Assinatura sem integração | Sempre linha neutra e aba informativa; não confundir com erro ou conta sem plano. |

## Assinatura

Linha secundária no Início: “Assinatura — Em breve” + botão “Gerenciar assinatura”.
Tab: “Assinatura”.
Conteúdo: “A gestão da assinatura estará disponível em breve.”
Explicação: “Aqui você poderá gerenciar plano, ciclo de cobrança, renovação automática, pagamento, faturas e cancelamento.”

Não há inputs, salvamento, links para provedor inexistente, preços, plano atribuído, datas de renovação ou alertas de dívida/teste. A linha não compete com a rotina. Regras para estados financeiros reais são fora do escopo, sem branches antecipados.

## Compatibilidade e acessibilidade

- Manter SettingsTab profile/save e acrescentar subscription; defaultTab mantém comportamento de inicialização na abertura, sem saltar durante edição.
- Altura usa token atual; header/tabs ficam fixos e conteúdo rola internamente; aba subscription não cria footer de outras abas.
- Perfil e save preservam seus formulários, erro/sucesso e confirmação de descarte. A nova aba não altera draft nem o salva.
- Preservar foco Radix, Escape, retorno ao gatilho, títulos acessíveis e tablist/tabpanel; sem overlays empilhados.
- Sem alteração de autorização, writes, scheduler de lembretes, API, configuração de banco ou versão de save.
