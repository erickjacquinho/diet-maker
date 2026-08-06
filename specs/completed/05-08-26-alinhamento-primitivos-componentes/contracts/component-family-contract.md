# Contract: Primitive Family and Compound Parts

Este contrato é interno à biblioteca de componentes. Ele não cria API externa nem altera o contrato de negócio.

## Family Contract

Cada família primitiva deve declarar:

1. Nome e export raiz.
2. Caminho de origem.
3. Categoria visual e perfil correspondente.
4. Dependência comportamental, quando houver.
5. Lista completa de exports públicos.
6. Responsabilidade de cada parte.
7. Variantes, estados e tokens canônicos.
8. Requisitos de teclado, foco e nome acessível aplicáveis.
9. Consumidores atuais e estado de migração.

## Root Contract

- A raiz compound fornece contexto, estado e composição.
- A raiz não deve conter regra de domínio.
- Quando a raiz renderiza o elemento visual principal, ela possui os defaults visuais desse elemento.
- Quando a raiz é apenas um provider/alias comportamental, as partes visuais possuem os defaults de seus slots.

## Child Contract

- Cada parte pública deve permanecer semanticamente vinculada à família.
- Partes que exigem contexto do root não devem ser promovidas a famílias independentes.
- Cada parte deve declarar se é provider, trigger, content, item, structural slot ou visual slot.
- Estados de foco, disabled, selected, loading, error e empty devem ser cobertos quando aplicáveis.
- `className` do consumidor pode ajustar layout e composição; não deve substituir silenciosamente tokens, estados ou tipografia oficiais.

## Layer Contract

```text
ui → atoms → molecules → organisms → templates → app
```

- `ui` não importa camadas superiores nem domínio.
- `atoms` só existem quando agregam valor verificável.
- `molecules` podem compor `ui` e `atoms`, mas não importam `organisms`.
- `organisms` podem compor camadas inferiores e regras de produto.
- `templates` compõem organismos e definem layout de página.

## Registry Contract

O registry deve ter uma entrada única por família, enumerar seus filhos públicos e manter consumidores reais. Uma divergência entre código e catálogo deve ser marcada como `migration-required`, nunca omitida.

## Validation Contract

Uma família só pode ser considerada `conforming` quando passa, conforme aplicável, por:

- isolamento de imports;
- contrato público de raiz e filhos;
- acessibilidade de nome, role, value, teclado e foco;
- type-check e lint;
- auditoria Atomic Design;
- verificação do Design System;
- atualização do registry e de seus consumidores.
