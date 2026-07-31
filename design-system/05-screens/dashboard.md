# 05-screens / dashboard — Dashboard principal

## Objetivo

Oferecer visão imediata de pacientes, metas e tendências com alta densidade e baixa fadiga cognitiva.

## Composição

1. `AppLayoutShell` e `SidebarNav`.
2. Action header com título Display Hero e CTA principal.
3. Bento de métricas e ações rápidas.
4. Lista/resumo de pacientes.
5. `NutritionalSparklineTable` para tendências recentes.
6. `NutriToastStack`.

## Responsividade

- Mobile: uma coluna, ações prioritárias primeiro e sidebar em Sheet.
- Tablet: duas colunas.
- Desktop: Bento assimétrico de três ou quatro colunas.

## Estados

Loading com skeleton de geometria estável; vazio com `NutriEmptyState`; erro com mensagem acionável; sucesso com conteúdo e toast apenas quando necessário.

## Acessibilidade

Skip link, H1 único, landmarks, ordem DOM igual à visual, métricas com valor textual e tabela navegável por teclado.
