# Showcase Validation Quickstart Guide

## Overview
Este guia descreve os passos para rodar e validar visualmente a nova página de Showcase do Design System (`/design-system`).

## Pré-requisitos
- Node.js instalado no ambiente
- Dependências do projeto instaladas (`npm install`)

## Passos para Execução e Validação

### 1. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

### 2. Acessar a rota do Showcase
Abra o navegador em:
[http://localhost:3000/design-system](http://localhost:3000/design-system)

### 3. Cenários de Validação Visual

#### Cenário A: Visualização de Swatches e Tokens
- [ ] Navegar para a aba **Tokens de Design**
- [ ] Confirmar que os swatches de cores exibem amostras visuais coloridas, valores HEX/HSL e badges de contraste WCAG AA/AAA
- [ ] Testar a digitação no espécime de tipografia e verificar alteração dinâmica do texto em tela

#### Cenário B: Interatividade do Catálogo de Componentes
- [ ] Navegar para a aba **Átomos**, **Moléculas** e **Organismos**
- [ ] Selecionar um componente (ex: `Button` ou `MetricBox`)
- [ ] Utilizar os knobs visuais para alterar variantes (`primary` → `danger`, `compact` → `standard`) e estados (`disabled`, `loading`)
- [ ] Confirmar que o preview ao vivo responde instantaneamente às mudanças de estado

#### Cenário C: Filtro e Alternância de Modos Showcase
- [ ] Digitar no campo de busca (ex: `"Badge"`) e confirmar filtragem instantânea
- [ ] Alternar entre **Modo Cliente Showcase** (visual limpo, apresentação) e **Modo Dev Spec** (exibição de snippets CSS/TSX)
