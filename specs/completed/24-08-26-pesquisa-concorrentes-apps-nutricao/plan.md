# Implementation Plan: Pesquisa de Concorrentes — Apps de Nutrição no Brasil

**Branch**: `specs/24-08-26-pesquisa-concorrentes-apps-nutricao` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/24-08-26-pesquisa-concorrentes-apps-nutricao/spec.md`

---

## Summary

Estruturar, catalogar e disponibilizar o levantamento completo dos 10 maiores concorrentes de software de nutrição do mercado brasileiro para administração de dietas e medidas antropométricas. O plano abrange a criação da suíte de documentação modularizada em Markdown sob `refs/pesquisa-mercadologica/` e a implementação do visualizador interativo em HTML/CSS/JS (`dashboard-pesquisa-concorrentes.html`) com filtros dinâmicos, comparativo de planos, análise SWOT em 4 quadrantes e matriz de gaps.

---

## Technical Context

- **Language/Version**: Markdown (GFM), HTML5, JavaScript (ES6+), CSS3.
- **Primary Dependencies**: Tailwind CSS (CDN v3.4+), Lucide Icons (CDN), Google Fonts (*Plus Jakarta Sans*, *JetBrains Mono*).
- **Storage**: Arquivos estáticos em `refs/pesquisa-mercadologica/`, sem dependência de banco de dados externo ou servidor.
- **Testing**: Validação estrutural de links, formatação de tabelas, carregamento estático e verificação de filtros em tempo de execução no browser.
- **Target Platform**: Navegadores modernos (Desktop Chrome, Firefox, Safari, Edge) em resolução >= 1024px.
- **Project Type**: Documentação técnica de pesquisa mercadológica + Dashboard analítico estático autocontido.
- **Performance Goals**: Carregamento da página HTML < 500ms, filtragem reativa instantânea (< 16ms / 60 FPS).
- **Constraints**: 100% autocontido, sem dependência de backend Node/Python em execução para visualização.

---

## Constitution Check

- **Escopo Desktop**: O dashboard e as tabelas são otimizados para desktop (>= 1024px), alinhados com o escopo do projeto.
- **Warm Minimalist & Design System**: A paleta de cores (`warm-50` a `warm-900`, `brand-700`, bordas sutis `warm-200`) e tipografia seguem rigorosamente a identidade visual do NutriDiet Local Pro.
- **Soberania e Não-Poluição**: Todos os artefatos de pesquisa ficam encapsulados em `refs/pesquisa-mercadologica/` e referenciados no índice canônico de `AGENTS.md`.

---

## Project Structure

### Documentation & Deliverables (Feature)

```text
refs/pesquisa-mercadologica/
├── index.md                                      # Índice canônico e sumário executivo
├── README.md                                     # Roteador rápido de documentos
├── 01-metodologia-e-panorama-geral.md            # TAM/SAM/SOM, CFN, métricas SaaS (ticket, churn, LTV)
├── 02-tabela-comparativa-10-concorrentes.md      # Matriz comparativa lado a lado dos 10 concorrentes
├── 03-concorrentes-top-tier.md                   # Deep dive: Webdiet, Dietbox, Nutrium, Avanutri, Dietpro
├── 04-concorrentes-mid-tier-e-especialistas.md   # Deep dive: Dietwin, Nutrilize, SAN, HubNutri, EasyDiet
├── 05-sintese-swot-e-oportunidades.md            # Matriz SWOT setorial, gaps e proposta de valor
└── dashboard-pesquisa-concorrentes.html          # Dashboard visual interativo completo
```

### Spec Kit Artifacts

```text
specs/24-08-26-pesquisa-concorrentes-apps-nutricao/
├── spec.md                                       # Especificação da feature e requisitos
├── checklists/
│   └── requirements.md                           # Checklist de qualidade dos requisitos
├── plan.md                                       # Este plano de implementação
└── tasks.md                                      # Tarefas ordenadas e mapeadas por skill
```

---

## Architecture & Data Modeling

### 1. Modelo de Dados de Cada Concorrente (JSON / Objeto JS)

```typescript
interface CompetitorData {
  id: string;                      // ex: "webdiet", "dietbox"
  name: string;                    // ex: "Webdiet"
  tier: "TOP" | "MID";             // Segmento de mercado
  tierLabel: string;               // ex: "Líder de Mercado"
  platform: string;                // ex: "Web Cloud + App"
  monthlyPrice: number;            // ex: 139.90
  annualPriceMonthly: number;      // ex: 89.90
  annualPriceTotal: number;        // ex: 1078.80
  ticketMedio: number;             // ex: 110.00
  churn: string;                   // ex: "4,5%"
  ltv: string;                     // ex: "R$ 2.450"
  nicheKey: string;                // "Clinico" | "Esportivo" | "Hospitalar" | "Iniciante"
  nicheLabel: string;              // ex: "Clínico Geral, Emagrecimento, Estudantes"
  states: string[];                // ex: ["SP", "RJ", "MG", "BA", "PR"]
  measures: string;                // Protocolos antropométricos
  foods: string;                   // Bases de dados nutricionais
  summary: string;                 // Resumo executivo
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}
```

---

## Verification Plan

1. **Validação de Conteúdo dos 10 Concorrentes**: Verificar se todos os 10 competidores possuem preços, planos, SWOT, nicho e estados documentados em markdown e no JS do dashboard.
2. **Validação do Visualizador HTML**: Abrir `dashboard-pesquisa-concorrentes.html` e testar:
   - Filtros dinâmicos por texto, nicho, tier e faixa de preço.
   - Alternância entre abas (Cards SWOT, Matriz Geral, Gaps & UVP).
   - Renderização correta dos ícones Lucide e fontes.
3. **Execução do Linter**: Garantir conformidade com as regras de documentação e ausência de erros de sintaxe.
