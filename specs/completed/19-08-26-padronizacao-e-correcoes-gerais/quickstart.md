# Quickstart: Guia de Validação e Execução de Testes

## Pré-requisitos
- Node.js >= 18.0.0
- Dependências instaladas (`npm install`)

## Comandos de Verificação e Validação

### 1. Verificação de Tipos TypeScript
```bash
npm run type-check
```
*Resultado esperado*: `0 erros de tipagem`.

### 2. Execução da Suíte Completa de Testes
```bash
npm test
```
*Resultado esperado*: `100% dos testes passando em todos os arquivos de teste (0 failed)`.

### 3. Auditoria de Atomic Design
```bash
npm run audit:atomic-design
```
*Resultado esperado*: `100% de conformidade, 0 violações`.

### 4. Auditoria de Z-Index
```bash
npm run audit:z-index
```
*Resultado esperado*: `0 z-index findings`.

### 5. Verificação Estrita do Catálogo de Componentes
```bash
npm run verify:design-system
```
*Resultado esperado*: `0 blocking findings`.

### 6. Verificação de Regras Legadas
```bash
npm run verify:design-system-legacy
```
*Resultado esperado*: `0 legacy findings`.

### 7. Verificação de Integridade de Links
```bash
npm run verify:links
```
*Resultado esperado*: `Zero links quebrados encontrados`.

### 8. Linter do Projeto
```bash
npm run lint
```
*Resultado esperado*: `0 errors, 0 warnings`.
