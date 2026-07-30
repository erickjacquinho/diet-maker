# Research: Atomic Design ESLint & AST Compliance Auditor

## Technical Decisions

### Decision 1: ESLint `no-restricted-syntax` vs Plugin ESLint Customizado

- **Chosen**: `no-restricted-syntax` com seletores de AST em `.eslintrc.json`.
- **Rationale**: Não exige publicação ou compilação de um pacote npm separado para o linter. Permite selecionar diretamente nós `JSXOpeningElement[name.name="button"]` via regra padrão do ESLint.
- **Alternatives Considered**:
  - Plugin de linter customizado em repositório local: Requer configuração mais complexa de build.

### Decision 2: Parser AST para Script de Varredura

- **Chosen**: `@babel/parser` / `@typescript-eslint/typescript-estree` ou módulo de AST nativo do TypeScript (`typescript`).
- **Rationale**: Como `typescript` já está instalado como devDependency no `package.json` (`typescript: ^5.7.2`), podemos criar um script Node.js leve que utiliza a própria API do TypeScript Compiler (`ts.createSourceFile`) para iterar sobre os nós AST e encontrar instâncias de `jsxOpeningElement`.
- **Alternatives Considered**:
  - `ts-morph`: Abstração de mais alto nível, porém traz dependência adicional desnecessária já que o TypeScript nativo é suficiente.

### Decision 3: Estrutura de Exceções de Diretórios

- **Chosen**: ESLint `overrides` configurados para aplicar as regras estritas em `src/app/**` e `src/components/{molecules,organisms,templates}/**`, enquanto isenta explicitamente `src/components/ui/**`.
- **Rationale**: Os átomos de UI em `src/components/ui` utilizam elementos nativos por definição para envelopar a lógica de acessibilidade e estilo base.
