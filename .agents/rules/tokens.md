# Rule: Tokens de Design e Convenções de Estilo

> **Escopo:** Aplica-se a todo código TypeScript, JSX/TSX, CSS e Tailwind no projeto.

## 1. Regra de Ouro

Valores visuais (cores, dimensões, espaçamentos, fontes, sombras, z-index) **NUNCA** devem ser hardcoded em componentes nem definidos via utilitários arbitrários.

- ❌ **PROIBIDO:** Utilitários Tailwind arbitrários (`text-[15px]`, `w-[320px]`, `rounded-[7px]`, `bg-[#2746B3]`, `z-[999]`).
- ❌ **PROIBIDO:** Cores Hex literais em JSX ou CSS de componentes (`#2746B3`, `#FCFAF7`, `#111827`).
- ✅ **OBRIGATÓRIO:** Usar variáveis CSS de tokens (`--color-*`, `--space-*`, `--radius-*`) ou classes utilitárias semânticas do Tailwind configuradas no projeto (`bg-background`, `bg-card`, `text-primary`, `border-border`, `p-4`, `rounded-md`).

## 2. Nomenclatura e Estrutura de Tokens

Os tokens seguem a arquitetura de 3 camadas:

1. **Reference Tokens (Fundação):** Valores brutos definidos centralmente em `src/design-system/tokens.css`.
2. **System Tokens (Semântica):** Mapeamento funcional para intenções de interface (ex: `--color-primary`, `--color-canvas`, `--space-4`).
3. **Component Tokens (Escopo Local):** Mapeamento específico por parte do componente quando necessário (ex: `--button-height`, `--input-border`).

### Prefixos Válidos

- `--color-*` : Cores de superfície, texto, bordas, estados e domínio.
- `--space-*` : Espaçamentos (padding, margin, gap).
- `--radius-*` : Raios de arredondamento de borda.
- `--font-*` / `--text-*` : Família tipográfica, tamanhos e pesos.
- `--shadow-*` : Níveis de elevação.
- `--z-*` : Camadas de z-index.
- `--motion-*` : Durações e funções de curva de animação.

## 3. Política de Tema Único

- O NutriDiet adota **tema claro exclusivo** com base off-white quente (`#FCFAF7`).
- **FORA DE ESCOPO:** Dark mode, temas alternativos, seletores `dark:` no Tailwind ou troca dinâmica de paleta.
- Não inclua lógica de detecção `prefers-color-scheme` nem seletores `[data-theme="dark"]`.

## 4. Checklist de Conformidade para Tokens

- [ ] Nenhum código de cor em formato `#HEX`, `rgb()` ou `hsl()` presente fora do arquivo de fundação `tokens.css`.
- [ ] Nenhum colchete com valor arbitrário `-[...]` nas classes Tailwind.
- [ ] Todas as propriedades de layout e estilo utilizam tokens semânticos do projeto.
