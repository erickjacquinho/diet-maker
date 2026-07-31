# Checklist de Conformidade — NutriDiet Design System

> Aderência “100%” significa que todos os itens obrigatórios abaixo foram verificados. Esta lista transforma os critérios do PRD em evidências reproduzíveis.

## 1. Referências visuais

- [ ] Habit tracker: pills com contador, cards de hábito, checkbox circular e rotina por período.
- [ ] KuCoin: sidebar, perfil, tabela densa e sparklines.
- [ ] Shadcn Bento: grid assimétrico responsivo, métricas, stepper + histograma e formulários integrados.
- [ ] Toasts: quatro variantes, badge pastel sólido 36px, ícone Lucide, texto e fechar.
- [ ] Nenhuma tela ou componente contém sombra, gradiente ou emoji como ícone.

## 2. Tokens

- [ ] Todo valor visual de componente deriva de token semântico/componente.
- [ ] `design-system/02-tokens`, `tailwind.config.js` e `src/design-system/tokens.ts` usam os mesmos nomes e valores.
- [ ] `ring-warm-focus` e todos os tokens `z-*` usados existem na configuração.
- [ ] `font-mono` resolve primeiro para Fira Code.
- [ ] Radii: card 16px, control 12px, pill 9999px.

## 3. Componentes e arquitetura

- [ ] Todos os átomos, moléculas, organismos e templates do README possuem especificação.
- [ ] Nenhum componente canônico está marcado como futuro.
- [ ] `src/components/ui/` permanece genérico e sem regra de negócio.
- [ ] Templates não contêm dados reais ou chamadas de API.
- [ ] Páginas injetam dados nos templates.

## 4. Acessibilidade

- [ ] Lighthouse Accessibility = 100 nas três telas canônicas.
- [ ] Contraste: 4.5:1 texto normal, 3:1 texto grande/UI; corpo principal prioriza 7:1.
- [ ] Fluxos completos por teclado, foco sempre visível e sem traps indevidos.
- [ ] Alvos touch ≥44×44px, distância entre ações ≥8px.
- [ ] Inputs possuem labels; ícones acionáveis possuem `aria-label`.
- [ ] Estados não dependem somente de cor.
- [ ] Gráficos essenciais têm valor textual e alternativa tabular.
- [ ] Toasts e feedback assíncrono usam live regions sem anúncios duplicados.
- [ ] Zoom 200% e reduced motion não causam perda de conteúdo.

## 5. Responsividade e desempenho

- [ ] Viewports mínimas: 320px, 768px, 1024px e 1440px sem scroll horizontal da página.
- [ ] Sidebar vira Sheet no mobile.
- [ ] Skeletons reservam espaço e CLS medido = 0.0 nos fluxos homologados.
- [ ] Alteração de porção atualiza cálculo e visual em menos de 50ms no cenário de teste.
- [ ] Interações não produzem long task >50ms.

## 6. Verificações do repositório

```bash
npm run verify:links
npm run lint
npm run type-check
npm test
npm run audit:atomic-design
```

Também executar busca negativa:

```bash
rg -n "bg-gradient|linear-gradient|radial-gradient|conic-gradient|shadow-(sm|md|lg|xl|2xl)" src
```

Exceções só são permitidas em comentários de proibição, documentação histórica ou código de terceiros.

## 7. Registro de homologação

Para cada release, registrar data, commit, navegadores, viewports, resultado Lighthouse, CLS, latência do cálculo e desvios aprovados. Sem todas as evidências, usar “alinhado documentalmente”, nunca “100% homologado”.
