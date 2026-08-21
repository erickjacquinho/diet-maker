# Governance — Ciclo de Vida e Contratos de Componentes

> **Status:** Especificação normativa de governança, versionamento e contratos de componentes no NutriDiet.

## 1. Ciclo de Vida de Componentes e Categorias

Cada componente e categoria do sistema de design percorre os seguintes estágios formais:

```text
PROPOSED ──> EXPERIMENTAL ──> STABLE (ou HOMOLOGATED) ──> DEPRECATED ──> REMOVED
```

- **Proposed:** Proposta documentada sem código homologado em produção.
- **Experimental:** Implementação inicial em fase de testes ou validação.
- **Implemented / Stable:** Componente homologado em produção com API pública protegida contra breaking changes.
- **Migration-Required:** Componente existente que precisa de ajuste estrutural para alinhar ao contrato.
- **Deprecated:** Marcado para descontinuação. Não aceita novos consumidores. Requer indicação explicita de substituto.
- **Removed:** Removido do catálogo ativo.

## 2. Contrato Mínimo de Componente

Todo componente integrado ao catálogo executável DEVE ter um contrato explícito que defina:

1. **Identidade e Camada:** Pertencimento a uma das 5 camadas do Atomic Design (`ui`, `atom`, `molecule`, `organism`, `template`).
2. **Propósito & Responsabilidade:** Definição clara do problema de interface que ele resolve.
3. **API Pública (Props):** Atributos aceitos, enums de variantes e suporte a ref/className.
4. **Matriz Comportamental:** Suporte aos 10 estados funcionais (`default`, `hover`, `pressed`, `focus-visible`, `selected`, `disabled`, `loading`, `error`, `empty`, `read-only`).
5. **Acessibilidade:** Suporte a teclado, foco visível e atributos ARIA.
6. **Consumidores Registrados:** Mapeamento explícito de quem utiliza o componente.

## 3. Regras de Evolução e Versionamento

- **Mudanças Compatíveis (Semver Minor/Patch):** Adição de props opcionais, correções visuais ou melhorias de performance sem alterar o comportamento existente.
- **Mudanças Incompatíveis (Semver Major / Depreciação):** Alterações na assinatura de props ou remoção de variantes exigem percurso de depreciação e migração explícita nos arquivos de perfil antes de qualquer remoção do `registry.json`.
