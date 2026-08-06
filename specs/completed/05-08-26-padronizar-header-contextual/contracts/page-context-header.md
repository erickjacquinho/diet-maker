# UI Contract: PageContextHeader

**Feature**: [spec.md](../spec.md)  
**Layer**: `molecule`  
**Category**: `navigation`  
**Source**: `src/components/molecules/PageContextHeader.tsx`

## Public Interface

```ts
export interface PageContextBreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageContextHeaderProps {
  title: string;
  backHref: string;
  backLabel: string;
  breadcrumbs: readonly PageContextBreadcrumbItem[];
  actions?: React.ReactNode;
}
```

## Responsibility

`PageContextHeader` normaliza o header de uma página que pertence a um fluxo hierárquico. Ele compõe o primitivo Breadcrumb, o link de retorno, o título e uma região opcional de ações. Não resolve dados de paciente, não calcula rotas e não chama histórico do navegador.

## DOM and Reading Order

1. Root `header` da região.
2. Link de retorno com ícone e nome acessível.
3. Bloco textual com Breadcrumb.
4. Único `h1` com `title`.
5. Região `actions`, quando fornecida.

O componente não cria um novo `main` nem altera o landmark fornecido pela página/template.

## Breadcrumb Contract

- Todo item anterior ao último com `href` é um link navegável.
- O último item é `BreadcrumbPage`, sem link, e representa a rota atual.
- A ordem dos itens segue a hierarquia da rota, não a ordem de acesso incidental.
- Labels dinâmicos podem conter o nome do paciente; IDs, `nova` e outros identificadores técnicos não são exibidos.
- Breadcrumbs de página global só podem ser usados se fizerem parte de uma hierarquia explícita; o componente não cria um botão voltar automaticamente.

## Back Link Contract

- `backHref` é explícito e aponta para o pai da rota.
- `backLabel` é o accessible name do link.
- O link é operável por teclado e mantém foco visível.
- O controle não depende de `history.back()` ou `router.back()`.

## Actions Contract

- `actions` é opcional e recebe ações já pertencentes ao contexto da página.
- Quando ausente, o header não deixa uma região vazia obrigatória.
- Ações não podem substituir o título, o breadcrumb ou o retorno.

## Consumers

- `src/app/pacientes/[id]/page.tsx`
- `src/components/templates/DietBuilderTemplate.tsx`
- `src/app/pacientes/[id]/consulta/[date]/page.tsx`

## Accessibility and Validation

- A rota consumidora fornece a hierarquia global de headings; o header deve expor um único `h1`.
- O link de retorno e todos os ancestors do breadcrumb possuem nomes acessíveis.
- O item current é anunciado como página atual e não captura ação de navegação.
- Foco visível, ordem DOM e operação por teclado são obrigatórios.
- Nome longo do paciente não pode remover o conteúdo acessível.
