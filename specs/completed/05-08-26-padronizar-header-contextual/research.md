# Research: Header contextual para fluxos hierárquicos

## Decision 1: Instalar o primitivo Breadcrumb existente na biblioteca UI

**Decision**: Adicionar o componente `breadcrumb` pelo CLI Shadcn e mantê-lo em `src/components/ui/breadcrumb.tsx` como primitivo genérico.

**Rationale**: O projeto já usa primitivos Shadcn locais e a trilha de navegação precisa de semântica, separadores, item atual e composição consistente. A camada UI não deve conhecer pacientes, dietas nem rotas.

**Alternatives considered**:

- Criar breadcrumbs com `div` e links em cada página: rejeitado por duplicar semântica e estilos.
- Criar somente um breadcrumb de produto: rejeitado porque substitui o primitivo genérico e viola a preservação de `src/components/ui`.

## Decision 2: Criar PageContextHeader como molécula de navegação

**Decision**: Criar `src/components/molecules/PageContextHeader.tsx` com responsabilidade única de compor retorno, breadcrumb, título e actions opcionais.

**Rationale**: O componente é uma unidade funcional pequena e reutilizável, formada por primitvos e atoms, e não deve assumir o layout completo de uma página. A categoria visual principal é `navigation`, porque o contrato é orientado a contexto e retorno entre destinos.

**Alternatives considered**:

- Criar um organismo `PageHeader`: rejeitado neste escopo porque absorveria layout de página e ações além da navegação contextual.
- Duplicar a composição em cada rota: rejeitado porque mantém a inconsistência que a feature pretende remover.

## Decision 3: Retorno explícito por link

**Decision**: A API recebe `backHref` e `backLabel`; o controle é um link, não um botão que chama o histórico do navegador.

**Rationale**: O fluxo tem pais conhecidos (`/pacientes` e `/pacientes/<id>`), o que produz comportamento determinístico, testável e correto mesmo quando a página é aberta diretamente ou em nova aba.

**Alternatives considered**:

- `history.back()`: rejeitado porque pode retornar a uma origem externa ou a uma tela intermediária não desejada.
- `router.back()`: rejeitado pelo mesmo motivo; não expressa a hierarquia do produto.

## Decision 4: Breadcrumb dinâmico do paciente

**Decision**: Consumidores passam o nome do paciente como label de um item navegável; o último segmento representa a página atual e não é link.

**Rationale**: O usuário aprovou o padrão `Pacientes > João > Dieta`. O nome ajuda a confirmar o contexto sem expor IDs ou o identificador técnico `nova`.

## Decision 5: Limites de adoção

**Decision**: Aplicar inicialmente em perfil, dieta e consulta. Manter páginas globais e modais fora do padrão; adicionar uma futura rota de alimento quando ela existir.

**Rationale**: Uma página sequencial possui uma origem pai e um destino de retorno. Um modal altera o estado dentro da página sem criar nível de rota, e páginas globais são destinos de navegação persistente.

## Decision 6: Compatibilidade com o catálogo

**Decision**: Atualizar a categoria `navigation`, criar perfil da molécula e registrar consumers/exports no registry. Não inventar um trait se o contrato atual não o suportar.

**Rationale**: O design system exige que componente novo tenha categoria, perfil, registro, camada, fonte e consumidores rastreáveis. A contextualidade é uma responsabilidade do perfil se não houver trait canônico compatível.
