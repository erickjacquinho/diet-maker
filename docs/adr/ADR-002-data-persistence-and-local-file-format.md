# ADR-002: Modelo de Persistência Híbrida e Formato de Arquivo Local (.diet)

- **Status**: Aceito
- **Data**: 2026-07-29

## Contexto
O nutricionista precisa organizar o histórico e as dietas dos seus pacientes diretamente no seu computador (em pastas próprias), além de garantir que uma queda de energia ou fechamento acidental da aba do navegador durante o atendimento não faça perder os dados em digitação.

## Decisão
Adotar um **Modelo de Persistência Híbrida**:
1. **Arquivos Locais `.diet` / `.json`**: Formato aberto e portável contendo os dados do paciente, histórico de dietas e refeições. Permite ao usuário organizar seus arquivos de pacientes em pastas do seu sistema operacional.
2. **Auto-Save Local (IndexedDB / LocalStorage)**: O estado da sessão atual em edição é sincronizado automaticamente no armazenamento local do navegador em tempo real.
3. **Privacidade Total (Zero-Cloud)**: Nenhum dado do paciente trafega ou é armazenado em servidores externos ou nuvem de terceiros.

## Consequências
- Total soberania do usuário sobre seus dados (conformidade natural com LGPD/privacidade).
- Funcionamento 100% offline.
- Facilidade de transferência de dietas entre computadores via pen drive ou nuvem pessoal (Google Drive/Dropbox do usuário).
