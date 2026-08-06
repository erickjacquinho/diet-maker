# Data Model: Header contextual para fluxos hierárquicos

## Contextual Header

Unidade de apresentação sem persistência, criada a partir de dados fornecidos pela rota.

| Campo | Tipo conceitual | Obrigatório | Regra |
| --- | --- | --- | --- |
| `title` | texto | sim | Nome da página; renderizado como único `h1` do header |
| `backHref` | destino de rota | sim | Pai explícito da página atual |
| `backLabel` | texto acessível | sim | Descreve para onde o link retorna |
| `breadcrumbs` | lista ordenada | sim | Pelo menos o item atual; itens anteriores podem ter destino |
| `actions` | região opcional | não | Mantém ações existentes sem impor espaço vazio |

## Breadcrumb Item

| Campo | Tipo conceitual | Obrigatório | Regra |
| --- | --- | --- | --- |
| `label` | texto | sim | Rótulo humano; não exibir identificador técnico |
| `href` | destino de rota | não | Existe somente para segmentos anteriores navegáveis |
| `state` | `ancestor` ou `current` | derivado | O último item é current; os demais são ancestors |

## Route Context Matrix

| Origem | Destino | Breadcrumb esperado | Retorno esperado | Aplicar header |
| --- | --- | --- | --- | --- |
| `/pacientes` | `/pacientes/[id]` | `Pacientes > <nome>` | `/pacientes` | sim |
| `/pacientes/[id]` | `/pacientes/[id]/dieta/nova` | `Pacientes > <nome> > Dieta` | `/pacientes/[id]` | sim |
| `/pacientes/[id]` | `/pacientes/[id]/dieta/[dietaId]` | `Pacientes > <nome> > Dieta` | `/pacientes/[id]` | sim |
| `/pacientes/[id]` | `/pacientes/[id]/consulta/[date]` | `Pacientes > <nome> > Consulta` | `/pacientes/[id]` | sim |
| `/pacientes/[id]/consulta/[date]` | `/pacientes/[id]/dieta/[dietaId]` | `Pacientes > <nome> > Dieta` | `/pacientes/[id]` | sim |
| dieta | modal de alimento | permanece na dieta | fecha modal | não é nova página |
| sidebar global | `/alimentos`, `/receitas`, `/presets`, etc. | definido pelo header global | não há pai contextual obrigatório | não |

## State Rules

- **Context available**: renderiza título, breadcrumb e retorno.
- **Context unavailable**: mantém o estado de erro da rota e oferece retorno para `/pacientes`; não monta um breadcrumb com nome vazio.
- **Long dynamic label**: preserva o label completo no nome acessível e aplica overflow visual permitido pelo design system.
- **No actions**: remove a região opcional sem gap reservado.
- **Current item**: é texto não navegável e recebe a semântica de página atual do primitivo Breadcrumb.
