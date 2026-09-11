# Quickstart: Conta e pacientes

Este guia valida a etapa 2 depois da implementação. Ele não inclui código de
produção, schema físico, migrations completas ou dados clínicos reais.

## Prerequisites

- Portão da etapa 1 aprovado no relatório correspondente.
- Dependências e versão do adaptador local fixadas pelo resultado da etapa 1.
- Node/runtime e package manager usados pelo repositório.
- Navegador desktop a partir de 1024px, em perfil limpo ou namespace local
  resetável.
- Fixture sintética com pelo menos duas Contas, pacientes ativos/arquivados,
  objetivos padrão/personalizados e registros relacionados somente quando
  necessários para verificar preservação.

## Setup

A partir da raiz:

```text
npm install
npm run type-check
npm run lint
```

Inicialize a base local pelo mecanismo aprovado na etapa 1. O ambiente deve
ser reinicializado sem as chaves `nutridiet_*` legadas; não execute um
migrador de dados de teste.

## Automated validation

```text
npm test -- tests/lib/patients
npm test -- tests/app/pacientes
npm test -- tests/architecture/patient-persistence-boundary.test.ts
npm run verify:links
npm run audit:atomic-design
npm run verify:design-system
```

Resultados esperados:

- casos de uso validam Conta, paciente, objetivo, versão e arquivamento;
- repositórios confirmam atomicidade e ausência de referências fora do escopo;
- a lista não expõe arquivados e o perfil não cria entidade inexistente;
- formulários preservam cancelamento, dirty state, erro e conflito;
- nenhuma rota ou componente acessa diretamente o storage legado;
- os componentes permanecem nas camadas Atomic Design e no catálogo visual.

## Browser validation sequence

1. Abra `/pacientes` com uma base limpa. Confirme o estado de primeiro cadastro
   e crie um paciente com campos válidos.
2. Confirme que o paciente aparece na lista e abra o perfil pelo nome, pela
   linha e por teclado (`Enter`/`Espaço`).
3. Pesquise por nome e objetivo. Verifique contador, nenhum resultado e
   **Limpar busca**; nenhuma dessas ações pode alterar a base.
4. Abra **Editar Cadastro**, altere valores e cancele. Reabra, descarte uma
   edição suja por `Esc`/fechamento e confirme que o estado original voltou.
5. Salve uma edição válida e confirme atualização de `updatedAt`/`version`.
   Repita com uma versão antiga e confirme conflito sem sobrescrita.
6. Adicione um objetivo personalizado. Repita com espaços/caixa equivalentes;
   deve existir uma única opção e o paciente só muda após salvar seu cadastro.
7. Arquive um paciente com registros relacionados de fixture. Confirme a
   remoção da lista ativa, a preservação dos filhos e a rejeição de novas
   operações clínicas. Exercite `restorePatient` pelo harness/porta, sem abrir
   tela administrativa.
8. Interrompa a rede após os recursos da aplicação estarem preparados e repita
   criação, consulta e edição local. Registre qualquer limitação sem declarar
   offline total do produto.
9. Inspecione o namespace novo e confirme zero leitura/gravação das chaves
   `nutridiet_patients`, `nutridiet_assessments_*`, `nutridiet_diets_*` e
   `diet_maker_custom_objectives`.

## Acceptance evidence

Registre para revisão humana:

- versão do runtime, navegador e adaptador aprovado na etapa 1;
- fixture e quantidade de pacientes usados na medição;
- resultados por requisito FR/NFR e cenário de aceite;
- evidência de escopo, versionamento, atomicidade e preservação de filhos;
- evidência de teclado, foco, estados loading/empty/error/conflict e contraste;
- tempo de lista/perfil e filtragem na fixture representativa;
- confirmação de que o legado foi descartado sem migração;
- divergências, limitações e itens para SDDs posteriores.

## Failure interpretation

- Falha de escopo, arquivamento sem preservação, conflito que sobrescreve dados,
  mutação parcial ou leitura do legado bloqueia a entrega.
- Falha visual ou de acessibilidade deve ser corrigida antes da homologação,
  seguindo o catálogo canônico.
- Uma limitação de performance deve ser registrada; somente degradação que
  inviabilize a fixture bloqueia o critério proporcional de 1 segundo.
- A aprovação desta etapa não autoriza implementar dietas, avaliações,
  acompanhamentos, backup ou sincronização.
