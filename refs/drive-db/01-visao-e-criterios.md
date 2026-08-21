# 01 — Visão, Escopo e Critérios de Sucesso

## Problema

O NutriDiet salva informações clínicas e bibliotecas em chaves independentes de `localStorage` distribuídas por telas e stores. Isso não oferece transações, migrations, sincronização entre computadores, conflitos seguros, restauração integral nem contrato para futuros dados.

O produto deve continuar sem banco próprio e sem cadastro interno, mas proteger o trabalho local e disponibilizar o mesmo perfil em computadores diferentes.

## Solução

- IndexedDB como persistência local transacional.
- Outbox durável e idempotente.
- Google Drive do nutricionista como fonte remota oficial.
- Google Identity Services somente para autorização.
- Arquivos versionados por agregado.
- Módulos registrados para schema, serializer, migration, path e conflito.
- Exportação integral e `.diet` por paciente.
- Preservação das duas versões em conflito clínico.

## Decisões arquiteturais

| Tema | Decisão |
|---|---|
| Frontend | Next.js App Router na Vercel |
| Banco | Nenhum SQL, NoSQL ou BaaS |
| Conta interna | Nenhum cadastro ou senha |
| Entrada | `Conectar Google Drive` |
| Local | IndexedDB |
| Remoto | Google Drive do usuário |
| Tráfego clínico | Navegador ↔ Drive |
| OAuth | Token model e `drive.file` |
| Unidade remota | Arquivo por agregado |
| Conflito | Sem last-write-wins clínico |
| Portabilidade | `.diet` e backup integral |

## Critérios de sucesso

- Cobrir todos os grupos persistentes atuais com módulos.
- Save local p95 ≤ 150 ms para documento de até 1 MB.
- Nenhum save confirmado pode ser perdido em crash.
- Iniciar tentativa remota em até 2 segundos com rede/token válidos.
- Toda revisão-base desatualizada gera conflito ou preservação.
- Retry concluído não duplica entidade/arquivo.
- Dispositivo novo reconstrói o workspace apenas pelo Drive.
- Backup integral restaura 100% dos documentos válidos.
- Leitura e edição continuam durante interrupção temporária de rede.

## Escala

- Até 1.000 pacientes.
- Até 100 dietas e 100 avaliações por paciente.
- Até 10.000 itens de biblioteca.
- JSON individual preferencialmente abaixo de 1 MB.
- Assets binários separados.

## Não objetivos

- Banco próprio ou servidor clínico.
- Login NutriDiet.
- Portal de paciente.
- Colaboração em tempo real.
- Compartilhamento automático.
- Escopo irrestrito do Drive.
- Sync após o navegador encerrar completamente.
- Espelhamento de pasta arbitrária do sistema.
- Prontuário/anexos clínicos completos.
- Ledger regulatório.
- Criptografia client-side sem projeto de chaves.

## Impacto documental

- ADR-002 `Zero-Cloud` deverá ser substituído por local-first com nuvem pessoal.
- PRD canônico deverá trocar referências antigas a Vite e zero-cloud.
- ADR-006 permanece válido para Next.js/Vercel.
- Regras nutricionais e design system não mudam.

## IA

Não aplicável. O sistema é determinístico. IA futura não poderá ler Drive diretamente e exigirá PRD próprio.

## Aprovação

Exige concordância com: ausência de banco próprio, Drive remoto, IndexedDB imediato, autorização sem conta interna e proibição de sobrescrita clínica silenciosa.

## Continue

- [02-experiencia-e-requisitos.md](./02-experiencia-e-requisitos.md)
- [03-modelo-do-perfil-e-dados.md](./03-modelo-do-perfil-e-dados.md)
