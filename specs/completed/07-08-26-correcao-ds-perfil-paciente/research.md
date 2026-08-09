# Research & Technology Decisions: Correção de Conformidade ao Design System

## Decision 1: Normalização da Hierarquia Tipográfica
- **Decision**: Substituir todas as combinações customizadas de `font-bold` / `font-semibold` / `tracking-tight` com `textStyle(...)` por chamadas diretas a estilos de texto canônicos de `src/design-system/text-styles.ts`.
- **Rationale**: A especificação normativa (DS 05 & DS 13) estabelece que `textStyle(...)` define de forma fechada o tamanho, peso, altura de linha e espaçamento entre letras. Modificações manuais via Tailwind rompem o contrato do catálogo tipográfico.
- **Alternatives Considered**: Manter `font-bold` como classe auxiliar — Rejeitado porque cria inconsistência e viola a regra de catálogo fechado.

## Decision 2: Substituição do Uso Inadequado de `text-style-legal`
- **Decision**: Mapear `text-style-legal` exclusivamente para notas não operacionais/legais. Usar `caption` (12px/18px 400), `body-secondary` (14px/22px 400) ou `helper` (12px/18px 400) para descrições de seções, resumos dietéticos e badges.
- **Rationale**: `legal` (11px/16px) é excessivamente pequeno e reservado a notas de rodapé ou autoria. Usá-lo para descrições de seções prejudica a legibilidade e desobedece o guia de aplicação de tokens tipográficos.
- **Alternatives Considered**: Criar um estilo `legal-strong` — Rejeitado porque inventa regras locais fora da governança do Design System.

## Decision 3: Desacoplamento da Tabela de Consultas em Organismo
- **Decision**: Extrair a renderização da tabela HTML de consultas e acordeões expansíveis de `src/app/pacientes/[id]/page.tsx` para `src/components/organisms/PatientConsultationHistoryTable.tsx`.
- **Rationale**: Reduz a complexidade da página em mais de 200 linhas, melhora a testabilidade em separado da ordenação/expansão de linhas e alinha a estrutura à regra de Atomic Design (DS 10).
- **Alternatives Considered**: Manter a tabela na página e estilizar inline — Rejeitado por violar a separação de responsabilidades da camada `app`.

## Decision 4: Extração de Modais Inline para Moléculas
- **Decision**: Criar `NextEventModal.tsx`, `AddObjectiveModal.tsx` e `DeletePatientModal.tsx` em `src/components/molecules/`.
- **Rationale**: Páginas em Next.js App Router devem orquestrar fluxos e delegar o JSX de diálogos para a camada `molecules`.
- **Alternatives Considered**: Manter modais inline na página — Rejeitado por poluir o arquivo da página e dificultar a reutilização/testabilidade.
