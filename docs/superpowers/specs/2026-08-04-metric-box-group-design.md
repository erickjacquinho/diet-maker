# MetricBoxGroup — composição modular de indicadores

## Status

Design aprovado para implementação.

## Objetivo

Extrair o quadro de indicadores atuais do perfil do paciente para um componente reutilizável que preserve exatamente a composição visual existente e permita substituir os indicadores sem alterar o container consumidor.

O componente deve aceitar de um a cinco informativos. Cada informativo deve poder receber todos os parâmetros públicos disponíveis em `MetricBox`, incluindo label, valor, legenda, ícone, tom, tamanho, superfície, layout e atributos HTML suportados.

## Escopo

Incluído:

- novo componente `MetricBoxGroup` em `src/components/organisms/`;
- API baseada em uma lista estruturada de itens;
- validação estática e em runtime do intervalo de um a cinco itens;
- preservação dos defaults visuais atuais;
- preservação explícita do ícone atual (`12px`, `strokeWidth={1.75}`) nos consumidores migrados;
- migração do quadro do perfil do paciente para o novo componente;
- testes de composição e limites;
- atualização do índice de exportação e do catálogo de componentes.

Fora do escopo:

- alteração do título ou descrição da seção “Indicadores atuais”;
- criação de um componente para o cabeçalho da seção;
- mudança no comportamento ou na API de `MetricBox`;
- suporte a mobile/tablet ou dark mode;
- alteração dos demais usos de `MetricBox`.

## Decisão arquitetural

### Abordagem escolhida

`MetricBoxGroup` recebe uma coleção de itens tipados como configurações de `MetricBox` e renderiza um `MetricBox` por item.

Essa abordagem é preferida a props posicionais, como `firstMetric` ou `showWeight`, porque permite substituir qualquer indicador sem acoplar o componente a um domínio específico. Também é preferida a uma API baseada em render props ou compound components porque a estrutura interna é fechada: todos os itens seguem o contrato público de `MetricBox`.

O componente será um organismo Atomic porque compõe uma ou mais moléculas `MetricBox` e possui responsabilidade própria sobre a superfície segmentada e o grid. Sua categoria visual principal será `surfaces`, com `MetricBox` herdando a categoria `data-display` como filho. O container não terá comportamento interativo nem estado próprio.

### API proposta

```tsx
type MetricBoxGroupItem = MetricBoxProps & {
  key?: React.Key;
};

type MetricBoxGroupItems =
  | readonly [MetricBoxGroupItem]
  | readonly [MetricBoxGroupItem, MetricBoxGroupItem]
  | readonly [MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem]
  | readonly [MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem]
  | readonly [MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem];

interface MetricBoxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MetricBoxGroupItems;
}
```

`key` será consumido apenas pelo grupo durante a renderização e não será repassado para o DOM. Quando não informado, o índice será usado como fallback, adequado para a coleção estática de indicadores.

## Contrato visual

Com quatro itens e sem sobrescritas, o resultado deve ser visualmente equivalente ao quadro atual:

- `grid-cols-4`;
- `divide-x divide-border-divider`;
- `overflow-hidden`;
- `rounded-control`;
- `border border-border-divider`;
- `bg-surface`;
- cada item com `size="standard"`;
- cada item com `layout="split"`;
- cada item com `surface="inline"`;
- cada item com `min-w-0 px-3 py-3`;
- ícone fornecido pelo consumidor preservado sem redimensionamento pelo grupo; os quatro ícones atuais continuam em `12px` e `strokeWidth={1.75}`.

O número de colunas será derivado do número de itens por um mapa estático de classes para os valores de 1 a 5. Com um item não haverá divisor visível; com cinco itens haverá quatro divisores verticais.

Os defaults serão aplicados somente quando o item não fornecer o parâmetro correspondente. Assim, cada consumidor poderá substituir individualmente `size`, `layout`, `surface`, `tone`, `caption`, `icon` ou qualquer atributo permitido por `MetricBoxProps`.

## Composição no perfil do paciente

A seção continuará responsável pelo título e pela descrição:

```tsx
<section aria-labelledby="current-indicators-title">
  <h3>Indicadores atuais</h3>
  <p>Medições que acompanham a evolução do paciente.</p>
  <MetricBoxGroup items={[...]} />
</section>
```

Os quatro itens atuais serão transferidos para a propriedade `items`, mantendo labels, valores, tons, ícones e fallbacks existentes.

## Estados, acessibilidade e conteúdo

- O grupo será uma `div` estática e não receberá foco.
- Atributos como `id`, `aria-label`, `aria-describedby` e `data-*` poderão ser aplicados ao grupo via `HTMLAttributes`.
- O grupo não anunciará estado próprio; os labels e valores permanecerão nos `MetricBox` filhos.
- Itens com valor ausente continuarão usando o estado `muted` já definido pelo consumidor.
- Uma coleção vazia ou com mais de cinco itens será rejeitada com erro explícito em runtime, evitando renderização silenciosamente incompleta.
- O contrato não introduzirá props booleanas de modo ou variantes específicas para cada indicador.

## Verificação

Serão cobertos, no mínimo:

- renderização com um item e ausência de divisores internos;
- renderização com quatro itens e equivalência estrutural ao quadro atual;
- renderização com cinco itens e cinco colunas;
- passagem independente de parâmetros para itens diferentes;
- preservação do ícone recebido pelo consumidor;
- rejeição de zero e seis itens;
- type-check, lint e testes existentes relacionados ao perfil.

## Arquivos previstos

- `src/components/organisms/MetricBoxGroup.tsx`;
- `src/components/organisms/index.ts`;
- `src/app/pacientes/[id]/page.tsx`;
- `tests/components/organisms/metric-box-group.test.tsx` ou localização equivalente aos padrões existentes;
- `design-system/components/profiles/organisms/metric-box-group.md`;
- `design-system/components/registry.json`.

