# Quickstart: validação do quadro de contexto da dieta

## Pré-requisitos

- Node.js e dependências do projeto instalados.
- Repositório em `C:\Programmer\diet-maker`.
- Navegador desktop com largura mínima de 1024px.

## Validação automatizada

Execute a partir da raiz:

```powershell
npm run type-check
npm run lint
npx vitest run tests/components/templates/diet-builder-template.test.tsx tests/components/templates/diet-builder-template.surface.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx
npm run verify:design-system-legacy
npm run audit:atomic-design
```

Resultado esperado:

- type-check e lint sem erros introduzidos pela feature;
- testes confirmam identidade única, grupo de modo, estados simples/ciclo e composição em uma única superfície;
- auditorias não apontam novas violações nos arquivos alterados.

## Validação visual manual

1. Inicie a aplicação com `npm run dev`.
2. Abra `/pacientes/pat-1786033492617-8xcc5/dieta/nova`.
3. Inspecione somente o quadro que contém o nome do paciente.
4. Confirme que o breadcrumb e o restante da página permanecem iguais.
5. Repita em 1024px, 1280px e 1440px.

### Cenário A — Dieta simples

- Paciente, peso e objetivo estão alinhados à esquerda.
- O título `Modelo de dieta` e as duas opções estão à direita.
- Não há controles de ciclo visíveis.
- O peso aparece uma única vez.

### Cenário B — Ciclo de carboidratos

- Selecione `Ciclo de Carboidratos` por mouse e pelas setas do teclado.
- Confirme que quantidade de variações, variações e cópia entre dias aparecem no mesmo contexto.
- Confirme que o estado selecionado permanece evidente e nomeado.

### Cenário C — Conteúdo longo

- Use um paciente com nome/objetivo longos ou simule essa fixture no teste.
- Confirme que o quadro não sobrepõe a seleção e que o nome completo continua disponível para acessibilidade.

## Evidências a registrar na implementação

- Resultado dos comandos automatizados.
- Larguras verificadas.
- Estados simples e ciclo de carboidratos.
- Confirmação de que nenhuma região fora de `diet-context-card` foi alterada.
