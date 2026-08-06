# Tasks: Revisão e Refatoração de Componentes e src/app

**Feature Directory**: `specs/30-07-26-revisao-e-refatoracao-de-componentes`

## Refatoração e Merge de Componentes Átomos

- [x] T001 [skill: vercel-composition-patterns] Fundir `IconButton.tsx` e suas variantes explícitas (`EditIconButton`, `DeleteIconButton`) no módulo `Button.tsx`, unificando a API de botões e mantendo re-exports em `@/components/atoms`.
- [x] T002 [skill: vercel-composition-patterns] Migrar as variantes de cores nutricionais (`emerald`, `rose`, `amber`, `teal`, `blue`) de `atoms/Badge.tsx` diretamente para a configuração `cva` em `components/ui/badge.tsx`.
- [x] T003 [skill: general] Padronizar `components/atoms/Input.tsx` para re-exportar diretamente o primitivo `components/ui/input.tsx` sem camadas redundantes.

## Composição de Componentes (Vercel Composition Patterns)

- [x] T004 [skill: vercel-composition-patterns] Refatorar `SidebarNav` para utilizar o padrão *Compound Components* (`SidebarNav.Brand`, `SidebarNav.Item`, `SidebarNav.UserProfile`, `SidebarQuickActions`), reduzindo a fragmentação das moléculas soltas.

## Adequação e Refatoração de 100% dos Arquivos em `src/app`

- [x] T005 [skill: code-reviewer-expert] Refatorar e adequar a rota principal `/pacientes` (`src/app/pacientes/page.tsx`) utilizando os novos componentes de botão, badge e modal Dialog padronizados.
- [x] T006 [skill: code-reviewer-expert] Refatorar as subrotas de paciente `/pacientes/[id]/page.tsx`, `/pacientes/[id]/consulta/[date]/page.tsx` e `/pacientes/[id]/dieta/[dietaId]/page.tsx` aplicando tipagem estrita e os componentes refatorados.
- [x] T007 [skill: code-reviewer-expert] Refatorar as páginas funcionais `/alimentos/page.tsx`, `/presets/page.tsx`, `/receitas/page.tsx` e `/refeicoes-prontas/page.tsx` para alinhamento com as regras de resiliência e boas práticas React.
- [x] T008 [skill: code-reviewer-expert] Atualizar o guia interativo em `/design-system/page.tsx` e executar a suíte de testes unitários (`npm run test`) para validação final.
