# Contract — Ações de backup na interface

## Entry points

As ações de backup reutilizam os pontos existentes de arquivo na barra lateral:

- **Exportar backup**: inicia a captura e o download `.nutridiet`.
- **Restaurar backup**: abre o seletor de arquivo `.nutridiet`.

Os rótulos legados `Salvar Arquivo Local`, `Abrir Arquivo .diet` e o conceito de
arquivo `.diet` deixam de representar o backup da Conta e não devem permanecer
como outra fonte de exportação/importação.

## Export states

```text
idle → exporting → downloaded
               └→ error
```

O botão fica indisponível enquanto a captura está em andamento. Sucesso mostra
feedback não ambíguo; erro informa que nenhum backup foi concluído e mantém a
base utilizável.

## Restore states

```text
idle → choosing-file → validating → confirmation
                         ├→ invalid/error
                         └→ pending-edits
confirmation → restoring → success/reload
             └→ cancelled
```

O diálogo de confirmação deve informar, de forma visível e acessível:

- substituição de toda a base atual;
- ausência de mesclagem;
- necessidade de resolver drafts/edições pendentes;
- ausência de senha e criptografia;
- necessidade de o usuário guardar o arquivo.

## Accessibility and interaction

- Ações, input de arquivo, diálogo, confirmação, cancelamento e mensagens de
  erro possuem nome/role/value acessíveis.
- O fluxo é operável por teclado e mantém foco visível conforme o Design System.
- O cancelamento fecha o fluxo sem escrever na base.
- O fluxo não exige uma rota nova nem uma funcionalidade mobile.
