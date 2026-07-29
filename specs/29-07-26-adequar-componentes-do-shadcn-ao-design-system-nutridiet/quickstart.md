# Quickstart & Guia de Validação: Componentes UI NutriDiet

## Passos para Validação

1. **Build do Projeto**:
   ```bash
   npm run build
   ```
   *Garante que nenhum tipo TypeScript ou import foi quebrado nos 14 componentes.*

2. **Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   *Acessar a aplicação localmente e inspecionar os componentes renderizados.*

3. **Verificação Visual dos Tokens**:
   - Abrir o DevTools do navegador.
   - Selecionar um `Button` ou `Card`.
   - Confirmar que `box-shadow` é `none` ou inexistente.
   - Confirmar que as cores e arredondamentos seguem a escala `warm-*`.
