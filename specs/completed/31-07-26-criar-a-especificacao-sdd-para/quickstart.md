# Quickstart: Validate the Component Category Catalog

## Purpose

Este guia descreve como validar a futura entrega sem alterar UI. Ele deve ser executado após todas as tarefas do SDD.

## Prerequisites

- dependências do repositório instaladas;
- diretório de trabalho na raiz do projeto;
- catálogo de categorias, perfis e registro presentes;
- nenhum trabalho não relacionado staged junto da validação.

## 1. Validate contracts and catalog

```powershell
npm run verify:design-system
```

Expected:

```text
39 current source files covered
0 uncovered public visual exports
11 categories homologated
4 proposed components specified
0 blocking findings
```

Exit code esperado: `0`.

## 2. Validate automated tests

```powershell
npm test -- tests/design-system/component-catalog.test.mjs
```

Expected: testes de fixtures válidas e de cada código de erro obrigatório passam.

## 3. Validate documentation links

```powershell
npm run verify:links
```

Expected: zero links locais quebrados.

## 4. Validate repository formatting

```powershell
git diff --check
```

Expected: nenhuma saída.

## 5. Prove source isolation

```powershell
git diff --name-only -- src
```

Expected: nenhuma saída.

## 6. Controlled negative scenarios

Executar estes cenários somente em fixtures de teste; não adulterar documentos canônicos.

| Fixture change | Expected finding |
| --- | --- |
| Fonte atual sem entrada | `SRC001` |
| Entrada aponta para fonte ausente | `SRC002` |
| Export visual não registrado | `EXP001` |
| Categoria principal removida | `CAT001` |
| Seção de categoria ausente | `CAT002` |
| Trait incompatível | `TRT001` |
| Perfil ausente | `PRF001` |
| Perfil duplica tabela de categoria | `PRF003` |
| Estado aplicável ausente | `STA001` |
| Token inexistente | `TOK001` |
| Valor visual local | `TOK002` |
| Exceção incompleta | `GOV001` |
| Placeholder textual | `DOC001` |
| Proposta contabilizada como atual | `PROP001` |

Cada fixture deve falhar somente com os findings esperados e voltar a passar quando restaurada.

## 7. Human reproducibility review

Selecionar ao menos um componente de cada uma das onze categorias. Dois revisores consultam fundamentos, categoria e perfil de forma independente e registram:

- dimensões;
- tokens por parte;
- styles tipográficos;
- variantes;
- estados;
- composição;
- exceções.

Expected: respostas idênticas sem escolha adicional. Divergência bloqueia homologação e deve ser corrigida na categoria ou no perfil correspondente.

## 8. Future-component simulation

Criar uma entrada somente em fixture para um componente futuro e demonstrar dois casos:

1. herança de categoria existente com perfil enxuto válido;
2. ausência de categoria compatível, produzindo bloqueio até existir CategoryDecision.

Expected: o primeiro caso passa; o segundo falha nominalmente sem permitir valores visuais locais.

