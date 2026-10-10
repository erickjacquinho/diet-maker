# Segurança e Saves — Checklist de Requisitos

**Purpose**: Avaliar completude, clareza, consistência e cobertura dos requisitos antes do plano.
**Created**: 2026-10-10
**Feature**: [spec.md](../spec.md)
**Audience**: Autor e revisor do planejamento; profundidade padrão com ênfase em autorização, privacidade e preservação de dados.
**Status**: 24/24 itens atendidos documentalmente; não representa testes de código.

## Completude e clareza

- [x] CHK001 Os elementos de landing, login, cadastro, verificação e recuperação estão enumerados sem conteúdo de marketing implícito? [Completude, Spec FR-001–FR-006, US1/US2]
- [x] CHK002 O e-mail como login e a diferença entre confirmação digitada e verificação da caixa estão explícitos? [Clareza, Spec FR-002–FR-004, SC-013]
- [x] CHK003 Média mensal e experiência declarada em “1–6 meses”, “6–12 meses” ou anos possuem significado, formatos e limites de validação definidos? [Clareza, Spec FR-003/FR-004, SC-013]
- [x] CHK004 As entidades conta online, Conta clínica, save, localização e autorização são distintas e relacionadas? [Consistência, Spec Key Entities, FR-008/FR-010]
- [x] CHK005 “Sincronizado” está definido como localização reconhecida, separado de upload e checkpoint? [Clareza, Spec Objetivo, FR-010, SC-004]
- [x] CHK006 A listagem, o estado vazio, criação, abertura e localização novamente estão descritos? [Cobertura, Spec US3/US4, FR-009–FR-011]

## Autorização e privacidade

- [x] CHK007 Toda operação remota depende de identidade validada pelo backend, sem autoridade de dados enviados pela página? [Segurança, Spec FR-017, NFR-003]
- [x] CHK008 A recusa a outra conta e a adulteração do arquivo têm critérios de aceite, incluindo cópias de save protegido? [Cobertura, Spec FR-015, SC-005]
- [x] CHK009 Senhas irreversíveis, chave permanente protegida e ausência de segredo no arquivo/interface/logs estão distinguidas? [Clareza, Spec FR-012–FR-016]
- [x] CHK010 A disponibilização de material criptográfico ao navegador autorizado está explícita, sem promessa de invisibilidade absoluta ao dono do dispositivo? [Consistência, Spec FR-016, Edge Cases]
- [x] CHK011 O conteúdo clínico, arquivo e drafts são excluídos do trânsito ao serviço online? [Privacidade, Spec FR-012, SC-011]
- [x] CHK012 Recuperação de senha conserva identidade e chave do save e possui recusa de autorização expirada/reutilizada? [Cobertura, Spec US2, FR-006/FR-014, SC-006/SC-007]
- [x] CHK013 Existe requisito de proteção contra enumeração de e-mail por respostas públicas e tentativas automatizadas? [Segurança, Spec FR-007, NFR-006]

## Disponibilidade, falhas e integridade

- [x] CHK014 Internet para login/criação/abertura, continuidade do save aberto e limite de oito horas estão explicitamente separados? [Clareza, Spec FR-018, SC-010]
- [x] CHK015 Expiração, logout, falha de rede e nova abertura offline têm resultado previsto sem apagar trabalho confirmado ou drafts? [Cobertura, Spec US3, FR-018/FR-019, NFR-004]
- [x] CHK016 O checkpoint exige escrita concluída e permanece local durante a janela offline? [Consistência, Spec US3 cenário 9, SC-011]
- [x] CHK017 Ausência, movimento, arquivo substituído, permissão pendente e perda de referência local têm cenários de recuperação? [Cobertura, Spec US3, Edge Cases, SC-004]
- [x] CHK018 O primeiro vínculo concorrente, repetição e falha parcial não podem gerar dois proprietários ou trocar chave? [Integridade, Spec US4, FR-014/FR-022]
- [x] CHK019 Arquivo inválido, versão incompatível e falha de importação preservam o estado anterior? [Integridade, Spec NFR-004/NFR-005, SC-008]
- [x] CHK020 A primeira adoção legada, recusa de identidade já vinculada e ausência de prova do dono histórico estão documentadas? [Clareza, Spec FR-020, SC-012]
- [x] CHK021 A nova cópia protegida e preservação dos bytes do original possuem critérios objetivos? [Mensurabilidade, Spec FR-020, SC-012]

## Limites e validação

- [x] CHK022 Os critérios de acessibilidade e escopo desktop seguem a fonte normativa sem redesenho implícito? [Consistência, Spec NFR-001]
- [x] CHK023 Projeto Supabase, serviço de e-mail e URL futura são dependências de execução, sem seleção de outro produto ou publicação implícita? [Dependências, Spec Assumptions, FR-021]
- [x] CHK024 O pacote distingue planejamento, implementação, banco aplicado, publicação e testes reais, encerrando para validação humana? [Clareza, Spec FR-021, SC-009]

## Notes

Avaliação realizada após integrar as cinco respostas. Nenhuma falha de requisito permaneceu aberta. O checklist não afirma segurança ou conformidade da implementação, que será comprovada nas verificações do plano.

Reavaliado após pesquisa: NFR-002 agora explicita a exceção estreita do token de e-mail no callback, com URL limpa, redaction e referrer bloqueado; limites de Auth/e-mail e armazenamento local foram explicitados. CHK007–CHK013/CHK015/CHK024 continuam atendidos, 24/24, sem regressão. O plano detalha prova não clínica do vínculo, codec de principal/menu e flush de conservação.

Reavaliado após minimize: 24/24 mantidos. Sessão/owner/prova/cifra, idempotência/concorrência, flush/checkpoint e migração com original intacto conservados. Disponibilidade continua local; retirar relato de progresso do banco não substitui autorização ou confirmação de write/close. Testes agrupados ainda precedem código; nenhuma proteção foi adiada.

O helper local de pré-requisitos sem `-PathsOnly` exige `plan.md`; como a ordem da skill sdd exige checklist antes do plano, a resolução foi executada com `-Json -PathsOnly` e a existência do spec foi validada diretamente. Nenhum plano fictício foi criado para satisfazer o helper.
