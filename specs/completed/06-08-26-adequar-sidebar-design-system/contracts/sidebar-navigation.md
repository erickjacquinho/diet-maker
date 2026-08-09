# Contract: Sidebar Navigation

**Feature**: `06-08-26-adequar-sidebar-design-system`
**Status**: Proposed

Este é um contrato de UI entre o adaptador da aplicação, o organismo `SidebarNav`, o shell e suas moléculas. Não é uma API HTTP.

## Application Adapter Contract

**Owner**: `src/app/navigation/SidebarNavigationAdapter.tsx`

O adaptador:

1. lê o pathname pelo mecanismo de contexto da aplicação;
2. fornece a configuração flat de produção com os seis destinos atuais;
3. passa `pathname` e `navigationItems` ao `SidebarNav`;
4. pode encaminhar callbacks de conta/ações quando a aplicação os possuir;
5. não expõe a API genérica do primitivo `src/components/ui/sidebar.tsx` às páginas.

O adaptador é a única camada autorizada a conhecer o contexto de rota da aplicação para esta composição.

## SidebarNav Props Contract

```text
SidebarNavProps {
  pathname: string
  navigationItems: SidebarNavigationItem[]
  doctorName?: string
  doctorRole?: string
  onOpenAccount?: () => void
  onSave?: () => void
  onOpen?: () => void
  initialCollapsed?: boolean
  children?: ReactNode
}
```

### Prop rules

- `pathname` e `navigationItems` são fornecidos pelo adapter; o organismo não importa `usePathname` nem escolhe o modelo flat de produção.
- A ausência de correspondência não marca nenhum item como current.
- `children` continua sendo composição opcional do organismo; não pode fazer o primitivo genérico importar produto.
- `initialCollapsed` controla apenas a inicialização em memória.
- `onOpenAccount` é opcional e controla a semântica do perfil conforme `SidebarActionState`.

## Navigation Semantics

- O conjunto de destinos é um `nav` nomeado, com links reais.
- Destino current expõe `aria-current="page"` e estado visual `current`.
- Grupo futuro usa trigger semântico com `aria-expanded` e conteúdo associado.
- Child current torna o ancestor discoverable/active.
- Grupo sem filhos não é renderizado.
- No collapsed state, todo item mantém accessible name completo; grupo futuro mantém acesso a seus filhos por uma surface documentada e teclado-operável.
- Subitem mede 36px e usa icon-16, padding/gap/radius/focus tokens da categoria navigation.

## Action Semantics

### Account profile

| Callback | Semântica | Aparência |
|---|---|---|
| `onOpenAccount` presente | Controle acionável por pointer/Enter/Space, com nome de conta | Hover/focus/tooltip conforme categoria |
| `onOpenAccount` ausente | Identidade não interativa, sem no-op | Sem cursor/hover de ação e sem role button |

### Save/Open

| Callback | Semântica | Descrição acessível |
|---|---|---|
| presente | Controle habilitado; chama apenas seu callback | Label da ação |
| ausente | Controle visível e `disabled` | “A ação Salvar ainda não está disponível nesta tela.” ou equivalente de Abrir |

O motivo não pode depender apenas de tooltip, opacidade, cor ou texto fora da árvore acessível.

## Shell Contract

**Owner**: `src/components/templates/AppLayoutShell.tsx`

```text
AppLayoutShellProps {
  sidebar: ReactNode
  children: ReactNode
}
```

- O shell recebe a sidebar por slot; não importa `SidebarNavigationAdapter` e não lê pathname.
- Antes do conteúdo persistente, o shell expõe `a[href="#main-content"]` com o texto “Pular para o conteúdo principal”.
- O conteúdo principal é `<main id="main-content" tabIndex={-1}>` e mantém o scroll independente.
- A região de navegação continua persistente no desktop.

## Generic Primitive Boundary

`src/components/ui/sidebar.tsx` continua responsável somente por provider, rail, slots, estado de collapse, focus ring, width aliases e opções genéricas. Não pode conter labels NutriDiet, rotas, callbacks de conta/arquivo, `usePathname` ou configuração de produção.

## Compatibility and Error Rules

- Não há persistência nem listener global Ctrl/Cmd+B nesta feature.
- Pathname desconhecido não gera fallback para `/pacientes` nem current falso.
- A aplicação deve fornecer `sidebar` ao shell; um shell de consumidor sem esse slot é inválido e deve falhar no type-check, não renderizar uma sidebar sem contexto de rota.
- A ausência de callback não lança erro em interação porque o controle correspondente deve estar disabled ou não interativo.
