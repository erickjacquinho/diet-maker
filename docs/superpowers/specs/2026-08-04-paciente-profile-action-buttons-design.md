# Perfil do paciente — estados dos botões de editar e excluir

## Contexto

Na faixa de ações do perfil do paciente, o botão de editar aparece como um
`IconButton` quiet e o botão de excluir usa a variante destrutiva preenchida.
O pedido é alinhar o editar ao botão `Nova Avaliação Física` e tornar o
excluir contornado por padrão, mantendo o preenchimento no hover.

## Objetivo

Atualizar somente o grupo de ações da tela de perfil do paciente para que:

- o editar mantenha apenas o ícone de lápis, mas use a mesma receita visual e
  os mesmos estados do botão secundário;
- o excluir mantenha o ícone e o nome acessível, tenha fundo transparente com
  borda/texto de erro por padrão e seja preenchido com a cor de erro no hover;
- handlers, modais, foco, teclado e nomes acessíveis permaneçam inalterados.

## Escopo e limites

Inclui o grupo de ações em `src/app/pacientes/[id]/page.tsx`, a receita
canônica necessária para o novo estado destrutivo contornado e os testes
diretamente relacionados.

Não inclui alteração de layout, texto visível, ícones, comportamento dos
modais ou estilo dos botões de editar/excluir em outras telas.

## Desenho aprovado

### Editar

O `EditIconButton` será consumido nessa tela com a variante `secondary`.
Como a variante é aplicada pela receita compartilhada do botão, o ícone
continua icon-only, quadrado e acessível, enquanto borda, superfície, hover,
foco, disabled e movimento coincidem com `SecondaryActionButton`.

### Excluir

Será adicionada uma receita semântica `destructive-outline` à família de
ações. Seus estados serão:

| Estado | Fundo | Borda | Ícone/texto |
| --- | --- | --- | --- |
| padrão | transparente/superfície subjacente | cor de erro | cor de erro |
| hover | cor de erro | cor de erro | cor sobre erro |
| foco visível | estado preservado + anel padrão | borda preservada | preservado |
| disabled | fundo e borda de disabled | borda sutil | disabled |

O `DeleteIconButton` dessa tela usará essa receita. A ação continuará abrindo
o mesmo modal de confirmação.

## Implementação e verificação

1. Expor a variante `destructive-outline` pelos tipos e pelo recipe do botão,
   preservando os primitivos Shadcn sem lógica de domínio.
2. Passar `variant="secondary"` ao editar e
   `variant="destructive-outline"` ao excluir somente no perfil do paciente.
3. Atualizar testes da família de botões para cobrir as classes/estados
   semânticos e preservar os testes de acessibilidade existentes.
4. Executar os testes direcionados, type-check e a verificação de design
   system aplicável.

## Critérios de aceite

- O editar do perfil do paciente tem o mesmo tratamento visual do botão
  `Nova Avaliação Física` nos estados padrão, hover e foco.
- O excluir do perfil do paciente não aparece preenchido no estado padrão.
- O excluir fica preenchido em erro no hover, com ícone legível.
- Nenhum handler ou fluxo de confirmação é alterado.
- Outras ocorrências de `EditIconButton` e `DeleteIconButton` não mudam.
- Os testes e verificações executadas terminam sem regressões relacionadas.
