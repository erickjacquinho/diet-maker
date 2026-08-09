# Quickstart de Validação: Adequação da Sidebar ao Design System

Este guia valida a implementação depois que as tarefas deste SDD forem executadas por `/speckit-implement`. Nesta etapa documental, os comandos não foram executados contra uma implementação nova.

## Pré-requisitos

- Node/npm instalados conforme o projeto.
- Dependências instaladas (`npm install`).
- Viewport desktop de pelo menos 1024px.
- Navegador/runner capaz de simular teclado e `prefers-reduced-motion` para a etapa manual.

## Gates automatizados

Executar na raiz do repositório:

```powershell
npm run type-check
npm run lint
npm run audit:atomic-design
npm run verify:design-system-legacy
npm run verify:design-system
npm run test -- tests/components/ui/sidebar.test.tsx tests/components/organisms/sidebar-nav.test.tsx tests/components/organisms/sidebar-navigation-model.test.ts tests/components/organisms/sidebar-nav-conformance.test.tsx tests/components/templates/app-layout-shell.test.tsx tests/components/app/sidebar-navigation-adapter.test.tsx
```

Resultado esperado: todos os comandos terminam sem findings bloqueantes relacionados à feature; a ausência de erros estáticos não substitui a validação manual.

## Cenário manual 1 — Geometria e identidade

1. Inicie a aplicação e abra uma rota de produção.
2. Confirme que a sidebar expandida mede 224px e a recolhida mede 64px.
3. Confirme a borda direita de 1px do rail esquerdo e a ausência de borda duplicada nos itens.
4. Recolha a sidebar e navegue por foco: NutriDiet Pro Local, cada destino e controle de expansão devem conservar nome completo.
5. Confirme icon-16, altura 36px dos itens/subitens, tipografia e espaçamento por tokens documentados.

## Cenário manual 2 — Foco, reduced motion e surfaces

1. Percorra todos os links, disclosure, perfil, ações e skip link com Tab/Shift+Tab.
2. Confirme ring de 2px com offset 2px, sem clipping no rail, submenu, tooltip ou popover.
3. Ative `prefers-reduced-motion: reduce` e repita collapse, chevron, tooltip, popover e submenu.
4. Confirme duração efetiva 0ms/sem transformações não essenciais, mantendo estado final, conteúdo e feedback de foco.

## Cenário manual 3 — Conta e ações sem callbacks

1. Renderize o shell sem `onOpenAccount`, `onSave` e `onOpen`.
2. Confirme que o perfil é informativo, sem aparência de botão/no-op.
3. Confirme que Salvar/Abrir permanecem visíveis, disabled e anunciam o motivo em pt-BR.
4. Renderize callbacks de teste e confirme que cada controle chama somente seu próprio callback.

## Cenário manual 4 — Skip link e shell

1. Recarregue a aplicação e pressione Tab antes de qualquer outro controle.
2. Ative “Pular para o conteúdo principal”.
3. Confirme foco em `main#main-content`, conteúdo rolável independentemente e sidebar persistente.

## Cenário manual 5 — Rotas e adapter

1. Visite as seis rotas atuais e uma rota nested de paciente.
2. Confirme `aria-current="page"`, estado current não dependente apenas de cor e nenhuma marcação falsa em rota desconhecida.
3. Inspecione o adapter: `pathname` e `navigationItems` devem ser fornecidos à sidebar; `SidebarNav.tsx` não deve importar/chamar `usePathname`.
4. Use uma fixture de grupo futuro: disclosure anuncia `aria-expanded`, child current ativa o ancestor e grupo vazio não aparece.

## Evidências a registrar

- Screenshot ou gravação dos estados expanded/collapsed e skip link focado.
- Resultado dos gates automatizados.
- Resultado de inspeção de `prefers-reduced-motion`.
- Lista das rotas percorridas e do estado `aria-current` observado.
- Comparação final de profiles/registry com sources, exports, consumers e primitive base.

## Critério de aceite

A feature só pode ser marcada como concluída quando os gates automatizados passarem, os cinco cenários manuais tiverem evidência e nenhum finding bloqueante permanecer no catálogo ou nas fronteiras Atomic Design.
