# MealCardContainer

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-meal-card-container` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/MealCardContainer.tsx` |
| Public exports | `MealCardContainerProps` (type), `MealCardContainer` (component) |

## Purpose

Coordenar título, resumo, itens e ações de uma refeição.

## Category inheritance

Herda integralmente [nutrition-domain](../../categories/nutrition-domain.md). Traits autorizados: `nutrition-macro`, `async`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Card com header de refeição, resumo, lista de `MealItemRow`, estado empty e ações da refeição. Quando a refeição possui mais de uma opção, o header acrescenta um `TabsList` controlado com os rótulos posicionais `Variação 1` a `Variação 5`; nome e horário continuam compartilhados pelo grupo.

## Allowed variants

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Empty conserva header e action de adicionar; updating preserva itens anteriores. A refeição legada permanece em estado single sem tabs; o primeiro uso de adicionar cria a Variação 2 e a abre. No estado multi, somente a tab ativa projeta itens e totais; o limite de cinco desabilita adicionar e associa a mensagem explicativa ao controle. A exclusão remove a opção ativa, compacta os rótulos e seleciona a última restante; ao voltar a uma opção, a UI de variações desaparece.

## Composition

Base declarada: `atom-surface`. Compõe `Surface` e `MealItemRow`; compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Nomes, kcal, g e percentuais seguem o contexto do domínio; macro sempre possui nome textual. Rótulos de variação são gerados pelo índice e não são editáveis; não há nome ou horário distinto por opção.

## Interaction contract

`Tabs` é controlado pelo contexto da página e usa ativação manual. Clique, Enter e Espaço alteram a opção; as setas, Home e End conservam a navegação roving do primitive. O botão de adicionar copia a opção ativa e abre a nova última opção; excluir atua apenas quando há mais de uma opção.

## Accessibility behavior

O conjunto recebe `aria-label="Variações da refeição"`; cada trigger anuncia seu rótulo e estado selecionado, e o painel permanece associado pelo contrato ARIA do primitive. O limite expõe mensagem via `aria-describedby`, foco visível e estado disabled. Ações de gerenciamento permanecem botões separados, sem controles aninhados dentro de uma opção.

## Exceptions

O shadow flutuante anterior foi removido do card em fluxo conforme a categoria `surfaces`; overlays continuam com seus próprios primitives.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- anatomia e variantes acima são suficientes para reproduzir a família;
- estados particulares são observáveis e não contradizem a categoria;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

