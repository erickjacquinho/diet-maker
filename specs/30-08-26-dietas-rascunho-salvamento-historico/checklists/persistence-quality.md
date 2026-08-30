# Qualidade dos requisitos: Dietas — rascunho, salvamento e histórico

**Purpose**: Avaliar completude, clareza, consistência, mensurabilidade e
cobertura dos requisitos de persistência e integração clínica.
**Created**: 2026-08-30
**Feature**: [spec.md](../spec.md)
**Público e momento**: autor e revisor humano, antes de aprovar implementação.
**Profundidade**: todas as jornadas e fronteiras desta etapa, sem homologação
de módulos futuros. Itens marcados representam qualidade documental, não
comportamento implementado.

## Completude

- [x] CHK001 A separação entre rascunho e prescrição está definida desde a abertura e o primeiro alimento? [Completude, Spec FR-002–004]
- [x] CHK002 O payload necessário para recuperar modos, ciclo, dias, alternativas e substituições está enumerado? [Completude, Spec FR-003/006/032]
- [x] CHK003 Estão definidos escopo de Conta/paciente e restrições ao arquivado? [Completude, Spec FR-001/002/033]
- [x] CHK004 O mínimo de uma refeição com um alimento está explicitado para criação e edição, com falha observável? [Completude, Spec FR-015/038, SC-011]
- [x] CHK005 Estão definidos a origem das fontes e os efeitos distintos das duas ações de cópia? [Completude, Spec FR-008–010]
- [x] CHK006 O conteúdo nutricional congelado inclui base, conversões, energia e proveniência? [Completude, Spec FR-027–031]

## Clareza

- [x] CHK007 Revisão de rascunho, versão da dieta e identidade estável têm responsabilidades distintas? [Clareza, Spec FR-005/014/018/034]
- [x] CHK008 O último valor visível está incluído mesmo antes do autosave e em ambos os acionadores de Salvar? [Clareza, Spec FR-012/013]
- [x] CHK009 Os estados local pendente, local persistido e confirmação clínica estão diferenciados? [Clareza, Spec FR-007/021–024]
- [x] CHK010 O mínimo aplica-se ao modo prescrito sem exigir um mínimo adicional por variação? [Clareza, Spec FR-038, Edge Cases]
- [x] CHK011 A especificação diferencia energia de referência, estimativa e meta manual? [Clareza, Spec FR-029/031]
- [x] CHK012 A precisão e o arredondamento de apresentação são mensuráveis? [Clareza, Spec FR-030]

## Consistência

- [x] CHK013 Vigência única e transação conjunta estão coerentes entre criação, edição e substituição? [Consistência, Spec FR-016–018]
- [x] CHK014 Histórico somente leitura permanece coerente na rota, cardápio, aplicação e persistência? [Consistência, Spec FR-019/026]
- [x] CHK015 Descarte de edição não contradiz a proibição de excluir prescrições? [Consistência, Spec FR-011/026]
- [x] CHK016 Restauração do paciente não implica reativação de rascunho invalidado? [Consistência, Spec FR-033]
- [x] CHK017 Dados de paciente e catálogo vivos não sobrescrevem o snapshot ou metas manuais? [Consistência, Spec FR-028/031]
- [x] CHK018 Contagem, atividade e fontes de cópia excluem os mesmos rascunhos que o histórico? [Consistência, Spec FR-004/008/025]

## Aceite e cenários

- [x] CHK019 Existem resultados verificáveis para as seis jornadas e o mínimo confirmado? [Mensurabilidade, Spec SC-001–011]
- [x] CHK020 Rollback, resultado desconhecido e erro só de limpeza têm recuperação explicitamente diferente? [Cobertura, Spec FR-022–024]
- [x] CHK021 O tratamento de autosave obsoleto e envio repetido impede perda/duplicação sem ampliar o escopo? [Cobertura, Spec FR-005/012/014]
- [x] CHK022 Conflito e perda de vigência preservam o conteúdo para conferência? [Cobertura, Spec FR-020]
- [x] CHK023 A falha de invalidação local após arquivamento não desfaz o estado canônico? [Cobertura, Spec FR-033]
- [x] CHK024 Navegação interna e fechamento abrupto têm garantias explicitamente distintas? [Cobertura, Spec FR-007, Edge Cases]
- [x] CHK025 Conta/paciente ausentes, falha de consulta e lista vazia são casos distinguíveis? [Cobertura, Spec FR-001/002, Edge Cases]
- [x] CHK026 Estão especificados valores não finitos, ausência versus zero e conversões sem evidência? [Cobertura, Spec FR-029, Edge Cases]
- [x] CHK027 A preservação integral e a independência da cópia têm critérios observáveis? [Mensurabilidade, Spec FR-010, SC-006/007]

## Não funcionais e dependências

- [x] CHK028 Plataforma, teclado, foco e feedback seguem referência canônica explícita? [Completude, Spec NFR-001/002]
- [x] CHK029 Fronteiras de UI, aplicação e armazenamento estão descritas sem acoplar a spec a APIs? [Completude, Spec NFR-003]
- [x] CHK030 Busca tem meta e condição de medição, sem certificação nova de volume? [Mensurabilidade, Spec NFR-004]
- [x] CHK031 Isolamento de testes, erros nominais e limites de privacidade estão previstos? [Completude, Spec NFR-005–007]
- [x] CHK032 Offline preparado e segunda aba bloqueada estão definidos com seus limites? [Cobertura, Spec FR-037]
- [x] CHK033 Descarte do legado está separado de evolução do schema e preservação dos dados canônicos? [Consistência, Spec FR-035/036]
- [x] CHK034 As dependências das etapas 1/2 e exclusões de 4–6 são explícitas e não declaram aprovação de código sem prova? [Dependências, Spec Escopo e Premissas]

## Resultado

34/34 itens atendidos; todos têm referência aos requisitos. Sem falha aberta.
O conteúdo mínimo definido pelo usuário está coberto por CHK004/010/019.
O checklist inicial de especificação também está em 16/16 após Clarify.

## Compatibilidade do fluxo

O helper `check-prerequisites.ps1 -Json` exige `plan.md`, embora este estado
preceda Plan no contrato explícito da skill `sdd`. Foi usado `-Json -PathsOnly`
para validar a âncora e a existência real da spec/checklists, sem criar plano
fictício nem inverter a ordem. Os helpers normais serão reexecutados depois
de Plan; scripts e instruções do projeto não foram alterados.
