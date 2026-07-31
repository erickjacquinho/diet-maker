# 02-tokens / 03-spacing-layout — Espaçamento, Radii e Camadas

## 1. Border radius

| Token | Classe | Valor | Uso |
| :--- | :--- | :--- | :--- |
| `rounded-card` | `rounded-2xl` | 16px | Cards principais, Bento, modais e toasts |
| `rounded-control` | `rounded-xl` | 12px | Inputs, botões, selects, subcards e badges de ícone |
| `rounded-pill` | `rounded-full` | 9999px | Pills, avatares, checkboxes e switches |

`rounded-lg` pode ser usado somente em subações compactas internas; não substitui os três tokens canônicos.

## 2. Escala de espaçamento

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `3xs` | 2px | Microseparador |
| `2xs` | 4px | Ícone + texto mínimo |
| `xs` | 8px | Badge e distância mínima entre ações |
| `sm` | 12px | Input e lista compacta |
| `md` | 16px | Card e gap Bento |
| `lg` | 24px | Seções internas |
| `xl` | 32px | Margem de container |
| `2xl` | 48px | Tela e hero |

O grid visual aceita 4px como subdivisão e 8px como ritmo principal. Gaps de Bento variam somente entre 16px e 24px.

## 3. Z-index oficial

| Token | Classe | Valor | Uso |
| :--- | :--- | :--- | :--- |
| `z-base` | `z-base` | 0 | Canvas |
| `z-card` | `z-card` | 10 | Cards e sidebar sticky |
| `z-subcontainer` | `z-subcontainer` | 20 | Subcontainers |
| `z-dropdown` | `z-dropdown` | 30 | Popover, select e tooltip |
| `z-toast` | `z-toast` | 40 | Toasts |
| `z-modal-backdrop` | `z-modal-backdrop` | 50 | Backdrop |
| `z-modal-content` | `z-modal-content` | 60 | Conteúdo modal |

Não criar valores ad hoc. Dentro do mesmo nível, a ordem DOM resolve a sobreposição.

## 4. Layout responsivo

1. Mobile-first: 1 coluna; `md`: 2 colunas; `lg`: 3 ou 4 conforme o organismo.
2. Conteúdo principal usa largura fluida e `min-w-0`.
3. A página não pode gerar rolagem horizontal.
4. Sidebar desktop torna-se Sheet/Drawer em viewport móvel.
5. Ações touch têm área mínima de 44×44px e distância mínima de 8px.
6. Tabelas densas usam scroll próprio com cabeçalho identificável ou representação responsiva em cards.
