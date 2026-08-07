# UI Contract: quadro de contexto da dieta

## Responsabilidade

O quadro fornece o contexto mínimo para iniciar ou revisar uma dieta: quem é o paciente e qual modelo de dieta está ativo.

## Ordem DOM obrigatória

1. `section` com nome acessível `Contexto da dieta` e `data-testid="diet-context-card"`.
2. Superfície única do quadro.
3. Região de identidade do paciente.
4. Região do grupo `Modelo de dieta`.
5. Regiões posteriores da página permanecem fora deste contrato.

A ordem DOM deve refletir a ordem visual: paciente antes do modelo.

## Anatomia visual

```text
┌────────────────────────────────────────────────────────────┐
│  [avatar] Nome do paciente       Modelo de dieta           │
│           [peso] objetivo         [Simples] [Ciclo]         │
│                                  (variações, se aplicável) │
└────────────────────────────────────────────────────────────┘
```

- Identidade: `PatientBadgeHeader` em modo compacto; avatar, nome, peso e objetivo.
- Divisor: borda vertical de 1px entre as duas regiões; não é um elemento interativo.
- Seleção: `DietModeSwitcher` embutido; grupo nomeado, labels textuais, estado selecionado e controles condicionais.
- Superfície: um único `Surface`; não adicionar card, shadow ou wrapper visual concorrente.

## Conteúdo e hierarquia

- Nome do paciente é o valor primário da identidade.
- Peso é apresentado com `kg` uma única vez.
- Objetivo é metadado secundário e não repete peso.
- O grupo usa o título curto `Modelo de dieta`.
- As opções permanecem `Dieta Simples` e `Ciclo de Carboidratos`.
- Texto auxiliar longo não é necessário no modo embutido.

## Estados

| Estado | Obrigatório |
| --- | --- |
| Simples | modo simples selecionado; controles de ciclo ausentes |
| Ciclo de carboidratos | modo ciclo selecionado; variações e ações aplicáveis visíveis |
| Foco | ring visível no controle de modo e nos controles condicionais |
| Selecionado | `aria-checked`/`aria-pressed` e indicação visual redundante por texto/estilo |
| Texto longo | nome completo disponível; layout não sobrepõe controles |

## Fora do contrato

- Breadcrumb, `PageContextHeader` e ações globais.
- Metas nutricionais, refeições e estado vazio.
- Persistência, cálculos, modais e regras de domínio.
- Alterações em `src/components/ui`.

## Critérios verificáveis

- Dentro do card, o nome do paciente aparece uma vez.
- Dentro do card, o peso aparece uma vez.
- Existe exatamente um grupo acessível `Modelo de dieta`.
- O modo simples não mostra controles exclusivos do ciclo.
- O modo de ciclo preserva seleção, variações e cópia entre dias.
- O cabeçalho externo e as regiões posteriores continuam fora do card e sem alteração.
