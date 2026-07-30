# Checklist de Qualidade dos Requisitos do Design System

## 1. Tokens e Cores
- [x] Cores base de superfície (`--color-bg-app`, `--color-surface-card`, `--color-surface-subtle`) especificadas com valores hex nítidos.
- [x] Cores semânticas de macronutrientes (`emerald`, `rose`, `amber`, `teal`) com fundos pastel correspondentes definidos.
- [x] Contraste WCAG AA (4.5:1 min) verificado para textos primários e secundários.

## 2. Tipografia e Espaçamento
- [x] Famílias tipográficas `Plus Jakarta Sans` e `Inter` especificadas para títulos e corpo.
- [x] Escala de arredondamentos (`rounded-2xl` para cards, `rounded-xl` para botões/inputs, `rounded-full` para badges) sem ambiguidades.
- [x] Regra Swiss Flat (`box-shadow: none`, `background-image: none`) imposta sem exceções.

## 3. Arquitetura Modular de Componentes
- [x] Separação em Átomos, Moléculas e Organismos claramente documentada.
- [x] Substituição de emojis por ícones vetoriais Lucide-React especificada.
- [x] Estrutura de arquivos Markdown dividida em diretórios `tokens/`, `components/` e `pages/`.
