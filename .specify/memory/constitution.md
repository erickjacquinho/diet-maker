# NutriDiet Local Pro Constitution

## Core Principles

### I. Atomic Design Architecture (Brad Frost - Chapter 2) [NON-NEGOTIABLE]
All UI components within the codebase MUST strictly follow Brad Frost's Atomic Design methodology (`src/components/atoms`, `molecules`, `organisms`, `templates`, `src/app/` for pages). No custom component may break hierarchy rules or embed inline styling outside design system tokens.

### II. Single Source of Truth (Swiss Warm Minimalist Design System)
All colors, font scales, border-radii, spacing, and transition rules must be derived exclusively from the NutriDiet Design System specification at `design-system/README.md` and its sub-modules. Zero custom box-shadows or gradients allowed.

### III. Accessibility & Semantic HTML (WCAG 4.5:1 Minimum Ratio)
All interactive elements MUST provide visible focus states, appropriate ARIA attributes, minimum 44x44px touch targets, and conform to accessibility contrast ratio standards. Emojis must not be used as primary control icons; Lucide-React SVG icons must be used instead.

### IV. Test-First Quality & Isolation
All test files must reside strictly under `tests/` and reference components in isolation without mutating global environment state.

## Governance
This constitution supersedes all individual implementation preferences. Amendments require explicit documentation, approval, and updating of `agents.md` and `.specify/memory/constitution.md`.

**Version**: 1.0.0 | **Ratified**: 2026-07-29 | **Last Amended**: 2026-07-29
