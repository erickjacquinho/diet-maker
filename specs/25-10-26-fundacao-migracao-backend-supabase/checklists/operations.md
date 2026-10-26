# Operations Requirements Checklist: Fundação da migração para o backend Supabase (F0)

**Purpose**: Validar a qualidade dos requisitos de migration, implantação remota, rollback e CI antes do plano
**Created**: 2026-10-26
**Feature**: [spec.md](../spec.md)
**Depth/Audience**: Gate formal para revisão de PR e para a janela de aplicação remota.

## Requirement Completeness

- [x] CHK026 A ordem dos passos remotos está especificada? [Completeness, Spec §FR-022a]
- [x] CHK027 O rollback está definido para a falha do smoke e para a falha na aplicação da migration? [Completeness, Spec §FR-022a, §FR-010]
- [x] CHK028 O artefato de evidência (onde e o que registrar, sem segredos) está definido? [Completeness, Spec §FR-022]
- [x] CHK029 As atualizações do ambiente local (exemplo de ambiente, guia de setup, testes) estão exigidas? [Completeness, Spec §FR-010a]
- [x] CHK030 A publicação remota está desacoplada do código ainda não integrado na branch atual? [Completeness, Spec §FR-022a]

## Requirement Clarity & Measurability

- [x] CHK031 A janela de indisponibilidade entre o rename e a republicação está quantificada (< 10 min)? [Measurability, Spec §FR-022a]
- [x] CHK032 O orçamento de tempo da CI está quantificado (+5 min)? [Measurability, Spec §NFR-002, §SC-006]
- [x] CHK033 A idempotência da migration está especificada para os três estados do papel? [Clarity, Spec §FR-001]
- [x] CHK034 Os gatilhos da CI e a fixação da versão da CLI estão definidos? [Clarity, Spec §FR-020]
- [x] CHK035 O resultado verificável do teste de backup da KEK está definido? [Measurability, Spec §SC-007, US5-4]

## Scenario Coverage

- [x] CHK036 A indisponibilidade do Docker na CI está tratada como falha explícita? [Exception Flow, Edge Cases]
- [x] CHK037 A não regressão do fluxo online atual está ligada a verificações concretas, local e em produção? [Coverage, Spec §FR-023, US6-4, §SC-005]
- [x] CHK038 Os testes de integração falham, em vez de serem pulados, quando a CI fornece o banco local? [Exception Flow, Spec §FR-020a]
- [x] CHK039 A coexistência das variáveis antigas e novas durante a transição do papel está tratada? [Coverage, Spec §FR-022a]

## Dependencies & Assumptions

- [x] CHK040 As premissas de infraestrutura (projeto existente, Vercel Hobby `gru1`, Docker no runner, workflow imperativo) estão registradas como fatos verificados? [Assumption, Spec §Assumptions]
- [x] CHK041 A dependência da CLI fora do `package.json` foi identificada? [Dependency, Spec §Assumptions, §FR-020]
- [x] CHK042 A restrição de integração com a branch atual, que tem outro SDD em andamento, foi encaminhada? [Dependency] — resolvida no plano: a execução acontece em branch própria a partir de `main`, e o passo remoto não publica código novo (FR-022a).

## Notes

- Avaliação de 2026-10-26: CHK027, CHK028, CHK030, CHK031, CHK034 e CHK041 falharam na primeira leitura. A spec foi corrigida (FR-010, FR-020, FR-022, FR-022a e Assumptions), e todos os itens passam. CHK042 foi encaminhado conscientemente ao plano.
