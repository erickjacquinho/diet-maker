# Rule: Modelo de Decisão e Criação de Componentes

> **Escopo:** Diretrizes para reutilizar, configurar, variar, compor ou criar componentes no projeto.

## 1. Sequência Obrigatória de Avaliação

Antes de escrever o código de um novo componente, o desenvolvedor/agente DEVE obrigatoriamente seguir esta sequência de 5 passos:

```text
1. USAR       ──> O componente atual já atende o caso de uso?
2. CONFIGURAR ──> Uma prop de API já existente resolve?
3. VARIAR     ──> Cabe adicionar uma nova variante à CVA existente?
4. COMPOR     ──> É possível resolver combinando componentes existentes (slots/children)?
5. CRIAR      ──> Somente se todos os 4 passos anteriores forem insuficientes.
```

## 2. Perguntas de Bloqueio

A criação de um novo componente é **BLOQUEADA** se qualquer uma das seguintes afirmativas for verdadeira:

- ❌ "Estou criando este componente apenas para economizar 3 linhas de JSX em um único lugar."
- ❌ "Estou criando um wrapper apenas para trocar uma classe de margem ou cor."
- ❌ "Existe um componente no Shadcn UI (`src/components/ui`) que faz exatamente isso."
- ❌ "O componente tenta resolver duas responsabilidades visuais totalmente distintas ao mesmo tempo."

## 3. Vedações na API de Componentes

- ❌ **Proliferação de Props Booleanas:** Não adicione múltiplas boolean props para representar estados mutuamente exclusivos (`isPrimary`, `isSecondary`, `isSuccess`, `isDanger`). Use enums de variantes: `variant="primary" | "secondary" | "success" | "destructive"`.
- ❌ **Exposição de Detalhes Internos:** Não exponha props de estilo genérico como `customColor`, `customPadding` ou `styleOverride`. Use a prop `className` padrão mesclada via `cn(...)` se necessário.
- ❌ **Acoplamento de Domínio em Átomos/UI:** Componentes genéricos da camada `ui` ou `atoms` NÃO DEVEM importar tipos do domínio nutricional (ex: `Paciente`, `Alimento`, `Refeicao`).

## 4. Contrato Mínimo de um Componente

Todo componente criado ou refatorado DEVE fornecer:

1. **Interface de Props Tipada:** Exportar `interface [Nome]Props` estendendo os atributos HTML nativos correspondentes quando aplicável.
2. **Suporte a `className`:** Aceitar `className` opcional e combinar via utilitário `cn(...)`.
3. **Encaminhamento de Ref (quando relevante):** Usar `React.forwardRef` para componentes interativos da camada `ui` / `atoms`.
