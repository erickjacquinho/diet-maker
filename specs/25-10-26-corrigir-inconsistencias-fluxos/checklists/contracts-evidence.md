# Checklist de requisitos: contratos, cobertura e evidência

**Purpose**: avaliar clareza e completude do SDD antes de planejar execução.
**Created**: 2026-10-25
**Feature**: [spec.md](../spec.md)
**Audiência/profundidade**: autor e revisor; revisão completa dos cinco achados. Marcas atestam requisitos escritos, não funcionamento da aplicação.

## Completude e consistência

- [x] CHK001 O significado de “100%” está limitado a achados identificados? [Clarity, Spec §Contexto]
- [x] CHK002 Os cinco achados têm resultados de correção exigidos? [Completeness, Spec §FR-001–009]
- [x] CHK003 A precedência entre contratos atuais e históricos está definida? [Consistency, Spec §US1, FR-002/003]
- [x] CHK004 A distinção entre cifra do arquivo, legado e área local está especificada? [Clarity, Spec §US1.2]
- [x] CHK005 Destino autenticado, aliases, gestão e logout são compatíveis entre requisitos? [Consistency, Spec §FR-003]
- [x] CHK006 O requisito limita a correção ao contrato atual sem recriar recursos retirados? [Coverage, Spec §Contexto, NFR-002]

## Cenários e critérios de aceite

- [x] CHK007 O conteúdo recuperado e o marco de checkpoint estão definidos? [Measurability, Spec §US2, SC-003]
- [x] CHK008 A abertura automática existente não é transformada em nova política? [Clarity, Spec §Edge Cases]
- [x] CHK009 Falhas de checkpoint e autorização têm resultado esperado explícito? [Coverage, Spec §US2.3]
- [x] CHK010 A completude do inventário tem critério de conjunto independente de contagem fixa? [Measurability, Spec §FR-005, SC-004]
- [x] CHK011 Páginas dinâmicas, redirecionamentos e estados não aplicáveis estão contemplados? [Coverage, Spec §US3.2]
- [x] CHK012 O significado limitado dos testes estáticos está declarado? [Clarity, Spec §FR-006/010]

## Segurança, operação e recuperação

- [x] CHK013 Hipótese de privilégio e falha 503 observada estão separadas? [Consistency, Spec §Contexto, FR-007]
- [x] CHK014 A diferença entre privilégio de tabela e de coluna é exigida antes do reparo? [Completeness, Spec §FR-007]
- [x] CHK015 Correção local, preservação de dados e menor privilégio estão delimitados? [Coverage, Spec §FR-008, NFR-001]
- [x] CHK016 A ausência de reprodução impede correção especulativa e fechamento indevido? [Coverage, Spec §FR-007, US4.5]
- [x] CHK017 Dependências ambientais e seu efeito no aceite estão explícitos? [Dependencies, Spec §Dependências]
- [x] CHK018 O requisito preserva autorização no backend e não concede poder de banco ao navegador? [Security, Spec §Contexto, FR-008]
- [x] CHK019 Preservação de processos, arquivos pessoais e segredos consta dos limites? [Coverage, Spec §NFR-001/002]
- [x] CHK020 A continuidade de foco/teclado e mensagens está coberta sem redesign? [Accessibility, Spec §NFR-004]

## Encerramento e rastreabilidade

- [x] CHK021 A propriedade da T008 anterior está definida sem aceite duplicado? [Traceability, Spec §FR-009]
- [x] CHK022 As seis camadas de evidência e limites remotos estão explícitos? [Clarity, Spec §FR-010, SC-006]
- [x] CHK023 O relato remoto histórico não equivale a homologação remota atual? [Consistency, Spec §FR-002/010]
- [x] CHK024 Novos defeitos têm regra de escopo e registro sem expansão silenciosa? [Coverage, Spec §Dependências]

## Resultado

24/24 requisitos de qualidade satisfeitos na revisão documental. Nenhuma implementação foi verificada por este checklist.
