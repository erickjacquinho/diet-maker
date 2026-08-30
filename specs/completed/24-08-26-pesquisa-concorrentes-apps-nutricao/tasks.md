# Tasks: Pesquisa de Concorrentes — Apps de Nutrição no Brasil

**Input**: Design documents from `specs/24-08-26-pesquisa-concorrentes-apps-nutricao/`
**Prerequisites**: [spec.md](./spec.md), [plan.md](./plan.md), [checklists/requirements.md](./checklists/requirements.md)

---

## Phase 1: Setup & Estrutura de Diretórios

**Purpose**: Inicialização da estrutura de diretórios e arquivos base da pesquisa

- [x] T001 [skill: general] Criar diretório `refs/pesquisa-mercadologica/` e inicializar o índice canônico `index.md` e `README.md`
- [x] T002 [skill: general] Configurar roteamento direto da documentação em `AGENTS.md` apontando para `refs/pesquisa-mercadologica/index.md`

---

## Phase 2: Foundational (Panorama e Demografia do Setor)

**Purpose**: Levantamento do cenário macroeconômico, base CFN e benchmarks de métricas SaaS

- [x] T003 [skill: prd] Mapear demografia de nutricionistas no Brasil (205k+ CFN), distribuição geográfica por estados (SP, RJ, MG, Sul, Nordeste) e nichos clínicos em `refs/pesquisa-mercadologica/01-metodologia-e-panorama-geral.md`
- [x] T004 [skill: prd] Consolidar benchmarks SaaS do mercado de software de nutrição (Ticket Médio R$ 102/mês, Churn 4,7% a.m., LTV R$ 2.100) em `refs/pesquisa-mercadologica/01-metodologia-e-panorama-geral.md`

---

## Phase 3: User Story 1 — Matriz Comparativa de Preços e Métricas (Priority: P1)

**Goal**: Disponibilizar tabela consolidada com os 10 maiores concorrentes, planos e métricas

- [x] T005 [skill: prd] [US1] Estruturar matriz comparativa dos 10 concorrentes com planos mensal/semestral/anual, ticket médio, churn e LTV em `refs/pesquisa-mercadologica/02-tabela-comparativa-10-concorrentes.md`
- [x] T006 [skill: prd] [US1] Documentar quadro resumo de pontos fortes e principais gargalos de usabilidade em `refs/pesquisa-mercadologica/02-tabela-comparativa-10-concorrentes.md`

---

## Phase 4: User Story 2 — Deep Dive dos Concorrentes, SWOT e Medidas (Priority: P1)

**Goal**: Detalhar análise SWOT, nichos, estados e antropometria para cada um dos 10 concorrentes

- [x] T007 [skill: prd] [US2] Redigir deep dive dos Top 5 Líderes (Webdiet, Dietbox, Nutrium, Avanutri, Dietpro) com SWOT em 4 quadrantes, antropometria e bases TACO em `refs/pesquisa-mercadologica/03-concorrentes-top-tier.md`
- [x] T008 [skill: prd] [US2] Redigir deep dive dos 5 Especialistas/Mid-Tier (Dietwin, Nutrilize, Sistema SAN, HubNutri, EasyDiet Pro) com SWOT e nichos em `refs/pesquisa-mercadologica/04-concorrentes-mid-tier-e-especialistas.md`
- [x] T009 [skill: prd] [US2] Sintetizar matriz SWOT setorial consolidada e oportunidades estratégicas de diferenciação em `refs/pesquisa-mercadologica/05-sintese-swot-e-oportunidades.md`

---

## Phase 5: User Story 3 — Dashboard Interativo em HTML (Priority: P2)

**Goal**: Implementar visualizador HTML completo, autocontido, com busca e filtros dinâmicos

- [x] T010 [skill: frontend-design] [US3] Construir interface HTML5/Tailwind do dashboard (`refs/pesquisa-mercadologica/dashboard-pesquisa-concorrentes.html`) com KPIs de mercado e barra de busca/filtros por tier, nicho e faixa de preço
- [x] T011 [skill: frontend-design] [US3] Implementar renderização dinâmica em JavaScript para cards de concorrentes com visualização de SWOT em 4 quadrantes, métricas de preço e tags de estados
- [x] T012 [skill: frontend-design] [US3] Implementar visualização alternativa em tabela comparativa interativa e painel de Gaps & UVP no dashboard HTML

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de integridade, links e validação de qualidade

- [x] T013 [skill: general] Validar integridade de links internos entre arquivos de `refs/pesquisa-mercadologica/` e `specs/`
- [x] T014 [skill: speckit-analyze] Executar análise cruzada de consistência e conformidade do Spec Kit
