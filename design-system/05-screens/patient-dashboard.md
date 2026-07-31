# 05-screens / patient-dashboard — Acompanhamento clínico

## Objetivo

Concentrar identidade, metas, hábitos e evolução do paciente em uma visão clínica rastreável.

## Composição

1. `PatientDashboardTemplate`.
2. `PatientBadgeHeader` com nome, UID, idade, objetivo, peso e gordura corporal.
3. Bento de métricas clínicas.
4. `HabitTrackerSection` e rotina por período.
5. `NutritionalSparklineTable` com paginação e tendências.
6. Ações de editar metas, abrir dieta e gerar relatório.

## Responsividade

- Mobile: perfil, ações, métricas, hábitos e histórico em sequência vertical.
- Desktop: perfil no topo; métricas/hábitos em Bento; tabela em largura total.

## Estados e segurança

Loading reserva espaço; ausência de histórico usa empty state; falha mantém dados anteriores quando seguros e oferece retry. Ações destrutivas exigem confirmação em Dialog.

## Acessibilidade

Abas usam Tabs semânticas, ações têm labels, sparklines têm resumo textual e dados tabulares, e mudanças de metas são anunciadas após confirmação.
