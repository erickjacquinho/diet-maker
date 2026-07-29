# ADR-006: Adoção da Arquitetura Next.js App Router (15+)

- **Status**: Aceito
- **Data**: 2026-07-29

## Contexto
O projeto NutriDiet Local Pro foi originalmente iniciado com uma estrutura Vite + React (SPA). Com a necessidade de facilitar o deploy otimizado na infraestrutura da Vercel, habilitar futuras capacidades de Server-Side Rendering (SSR), Server Actions tipadas para exportação/cálculos e manter a segurança de código e compatibilidade de ecossistema, avaliou-se a transição de framework.

## Decisão
Migrar a arquitetura base para **Next.js (App Router)** com TypeScript e Tailwind CSS:

1. **Separação Server/Client Boundary**:
   - Usar React Server Components (RSC) por padrão para estruturas estáticas e renderização inicial rápida.
   - Restringir a diretiva `'use client'` estritamente às folhas interativas do aplicativo (ex: seletores de alimentos, inputs de gramatura e gráficos interativos).
2. **Infraestrutura Pronta para Vercel**:
   - Manter a capacidade de exportação estática ou deploy direto com Serverless/Edge functions sem reconfiguração.
3. **Limpeza Geral de Código Morto**:
   - Removidos todos os artefatos legados do Vite (`vite.config.ts`, `index.html`, `main.tsx`, `tsconfig.app.json`, `tsconfig.node.json`).

## Consequências
- A estrutura de arquivos agora se concentra na pasta `src/app/`.
- O roteamento do aplicativo segue a convenção baseada no sistema de arquivos do Next.js.
- O tempo de build e validação de páginas passa a utilizar o compilador nativo do Next.js.
