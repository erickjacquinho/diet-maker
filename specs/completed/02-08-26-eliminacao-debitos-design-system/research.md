# Research: Eliminação Total dos Débitos do Design System

**Branch**: `02-08-26-eliminacao-debitos-design-system` | **Date**: 2026-08-02

Resolução dos unknowns U-01..U-05 do `plan.md`, com decisões, rascunhos de regras e mapa de conversão canônico.

## U-01 — Semântica dos matchers LEG011–LEG017

### Lições da análise de lacunas (regex)

- **`\b` após `]` nunca casa**: o word boundary após um token fechando `]` (caractere não-palavra) falha; remova `\b` final em padrões que terminam em `[...]`.
- **Falsos positivos de prefixo**: `z-5` casa `z-50`; use `(?:^|\s)` / enumeração completa de valores permitidos.
- **Margens negativas**: `\b-` antes de um hífen não casa; use `(?:^|\s)-`.
- **Igualar apenas classes**: ancorar por início de token em lista de classes (espaço ou fim de linha), nunca por substring.

### Rascunho das 7 novas regras (validar com fixtures de aceitação E rejeição)

| ID | Categoria | Matcher rascunho | Regra canônica |
|----|-----------|------------------|----------------|
| LEG011 | named-text-size | `\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b` | `textStyle()` com id nomeado |
| LEG012 | space-x-y | `\b(?:space-x|space-y)-[\w[\]]+\b` | `gap-*` com tokens `space-*` (norma 06-geometry §espacamento, linha 270) |
| LEG013 | text-transform | `\b(?:uppercase|lowercase|capitalize)\b` | `tracking-label`/`tracking-overline` (já em `textStyle('table-header')`/`overline`); remover transform não-semântico |
| LEG014 | tracking-wide | `\btracking-(?:wide|wider|widest)\b` | `tracking-normal/label/overline/tight` ou `textStyle` (norma 05-typography, linha 261) |
| LEG015 | opacity | `\b[a-z-]*-opacity-[\w[\]]+\b` e `\bopacity-(?!disabled|subdued|full)[\w[\]]+\b` | `opacity-disabled/.subdued/.full` (norma 07-icons, linhas 181–183) |
| LEG016 | leading-named | `\bleading-(?!none|tight|snug|normal|relaxed|loose)[\w-]+\b` | line-height vem do text style; remover `leading-*` (norma 05-typography, linha 261) |
| LEG017 | size-arbitrary | `\bsize-\[[^\]]+\]\b` | tamanhos de ícone/controle via tokens `icon-*` (token-index) |

**Regra de ouro para LEG013/LEG014/LEG016**: como a camada `src/design-system/**` será isenta (U-02), os usos canônicos de `uppercase`/`tracking-*`/`leading-*` dentro de `text-styles.ts` não geram findings.

## U-02 — PATH_EXEMPTIONS

**Decisão**: introduzir exceções de caminho no auditor `verify-design-system-legacy.mjs`, avaliadas por prefixo:

```text
src/components/ui/      → primitivos shadcn preservados por design (decisão registrada, spec §Clarifications 2026-08-02)
src/design-system/      → camada canônica, fonte da verdade (constituição II)
```

- O prefixo é comparado contra `path.relative(rootDir, absolute)` normalizado (`/`).
- As exceções atuais por arquivo (`tokens.css` → LEG001/005/007; `text-styles.ts` → LEG002/004) ficam subsumidas por `src/design-system/` e são removidas da implementação (menos estado espalhado).
- **Fixtures NÃO são isentas**: vivem sob `tests/fixtures/design-system-legacy/`, fora dos prefixos.
- **LEG009** continua válida: veda `from "@/design-system/tokens"` em código que consome; o prefixo isento só libera a camada que define os tokens.
- O registry (`design-system/components/registry.json`) deve registrar a exceção de `src/components/ui/**` (campo `exceptions` por componente e/ou baseline) para rastreabilidade.

## U-03 — Mapa de conversão papel→estilo (canônico)

### Tipografia (05-typography + `src/design-system/text-styles.ts`)

| Papel observado | Canônico |
|-----------------|----------|
| `text-xs` | `textStyle('legal')` |
| `text-sm` | `textStyle('body-small')` |
| `text-base` | `textStyle('body')` |
| `text-lg` | `textStyle('body-large')` |
| `text-xl` | `textStyle('subsection-title')` |
| `text-2xl` | `textStyle('section-title')` |
| `text-3xl` | `textStyle('page-title')` |
| `text-[9px]/[10px]/[11px]` (LEG002) | `textStyle('legal')` (menor estilo canônico) |
| `tracking-wide/wider/widest` | `textStyle('table-header')`/`overline` ou `tracking-label/overline` |
| `leading-*` | remover (line-height vem do text style) |
| `uppercase/lowercase/capitalize` | `textStyle('table-header')`/`overline`; senão remover transform |

### Geometria (06-geometry)

| Legado | Canônico |
|--------|----------|
| `space-x-*`/`space-y-*` | `gap-*` usando escala `space-0..space-16` ou tokens semânticos (`space-inline`, `space-related`, `space-component`, `space-section`, `space-page-section`, `space-major`) |
| `rounded-lg` (12px) | `radius-surface` (`rounded-surface`) |
| `rounded-xl/2xl/3xl` | `radius-surface` (exceções requerem contrato) |
| `rounded-full` | somente exceção circular registrada (avatar, radio, spinner, status, chart marker) |
| `rounded-[10/12/16px]` | `radius-control` (10→6? **validar**: 10px→`radius-surface` 8px; 12→surface; 16→surface) — decisão por fixture de inspeção |
| `size-[n]` | tokens `icon-*` (icon-micro/compact/standard/section/feature/16) |

### Cor e estado (04-color, 07-icons)

| Legado | Canônico |
|--------|----------|
| paleta default (LEG001) | tokens semânticos `text-text-*`, `bg-surface-*`, `border-border-*` |
| `opacity-*` | `opacity-disabled` (0.48), `opacity-subdued` (0.72), `opacity-full` (1) |
| `shadow-*` (LEG005) | `shadow-floating`/`shadow-overlay`/`shadow-none` |
| `duration-*` (LEG005) | `motion-fast/standard/slow` |
| `hover:scale-*` (LEG005) | remover (sem scale em hover) |
| `font-black/extrabold` (LEG004) | pesos 400/500/600/700 do text style |

### Breakpoints (LEG006)

| Legado | Canônico |
|--------|----------|
| `sm:`/`md:` | **remover** (produto desktop-only ≥ 1024px; comportamento < 1024 fora de escopo, constituição III) |

## U-04 — Fixtures e contrato de teste

- Criar `tests/fixtures/design-system-legacy/LEG011.fixture.tsx` … `LEG017.fixture.tsx`, um por regra, no mesmo formato dos existentes (uma ocorrência mínima da categoria + comentário do código).
- Atualizar `legacy-audit.test.ts`:
  - teste de cobertura: `expect(new Set(codes)).toEqual(new Set(LEG001..LEG017))` (17 IDs);
  - teste de zero findings: permanece, agora com PATH_EXEMPTIONS ativas;
  - adicionar teste dedicado: `verifyLegacy` com `paths: ["src/components/ui"]` retorna **0 findings** (prova a isenção).
- Cada regra nova precisa de **fixture de rejeição** para os casos-limite (ex.: LEG011 não casa `text-style-body`; LEG015 não casa `opacity-disabled`).

## U-05 — Remoção de `sm:`/`md:` sem quebra

- São overrides responsivos em produto desktop-only; a base (sem prefixo) permanece e define o layout canônico em ≥ 1024px.
- Remover a linha do prefixo preservando a classe-base (ex.: `md:text-sm` → remover, pois `text-sm` também é legado e será convertido; `sm:grid-cols-2` → remover o par).
- Verificação: `npm run build` + inspeção visual de páginas principais em 1280×800 (não há testes de snapshot responsivo no projeto).

## Dependências e best practices

- **Gates**: `npm run verify:design-system-legacy` (auditor), `npm run type-check`, `npm run test`, `npm run verify:design-system` (componentes), `npm run audit:atomic-design`.
- **Ordem obrigatória**: instrumentação (regras+exceções+fixtures+teste 17) ANTES de qualquer migração (constituição IV).
- **Baseline**: após instrumentação, rodar auditoria strict e congelar o JSON de findings como baseline reproduzível para as tarefas de migração.
