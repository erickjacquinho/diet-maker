# Referência da exportação de dieta simples

Este protótipo é uma composição local e experimental, conforme `design-system/09-component-decision-model.md`, seção 6. Não introduz componente público, variante ou categoria nova.

## Aplicação da sequência de criação

- **Usar/configurar:** `Button`, `ActionDropdown`, `DataTable`, `MacroSummary`, `Tabs`, `Dialog` e `Separator` importados diretamente de `src/components`.
- **Variar:** desnecessário; nenhuma variante adicionada.
- **Compor:** títulos, refeições, tabelas, abas e modal organizados localmente em `reference.tsx`.
- **Criar:** desnecessário; nenhum substituto dos componentes existentes foi criado.

Os elementos HTML semânticos apenas organizam as regiões e o texto. Tipografia usa `textStyle`; layout usa classes existentes; CSS e fontes vêm do projeto. Os primitivos não foram alterados. Dados fictícios estão separados em `sample-data.ts`.

## Fontes consultadas

- Categorias: actions, data-display, selection, overlays e structure.
- Perfis: Button, DataTable, Tabs, Dialog, DropdownMenu, Separator e DietPdfTemplate.
- Regras: Atomic Design, preservação Shadcn, tokens e decisão de componentes.

## Reprodução

Na raiz do repositório:

```powershell
node refs/UI/dieta-exportada/build.mjs
node refs/UI/dieta-exportada/verify.cjs
```

`dieta-simples.html` contém o bundle dos componentes reais, CSS e fontes, e abre sem servidor. `?view=exported` exibe a página de leitura. O build usa dependências já instaladas e não modifica a configuração nem as rotas do app.

## Verificação e limite

TypeScript aprovado; fluxo menu → modal → nova aba, alternativas por teclado, Escape, contenção/retorno de foco e larguras desktop 1024/1440 verificados. Capturas de tela conferidas.

A composição reutiliza o estado atual dos componentes. Isso não homologa todo o Design System: Tabs ainda usa `text-style-legal` e estados visuais diferentes do perfil normativo; Dialog ainda contém animações de zoom no primitivo. Essas divergências preexistentes foram preservadas para atender ao uso exclusivo de componentes atuais, sem ampliar o escopo para uma migração do catálogo.

## Ajustes de revisão

Resumo com duas colunas: Refeição e Macros, usando MacroSummary colorido com separadores. Data usa formatDateOnly (dd/MM/aaaa). Alimentos usam seleção multi da DataTable com selectOnRowClick, incluindo teclado. Os checks ficam separados por refeição/opção durante a sessão da página; não há persistência após recarregar. Valores da prescrição permanecem inalterados.
