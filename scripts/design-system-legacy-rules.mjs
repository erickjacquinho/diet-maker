export const legacyRules = [
  { code: 'LEG001', rule: 'legacy-palette', pattern: /\b(?:warm-[\w-]+|stone-(?:50|100|200|300|500|700|900)|emerald-(?:50|500|600|700))\b/g, message: 'Substitua a paleta antiga por token semântico canônico.' },
  { code: 'LEG002', rule: 'arbitrary-text-style', pattern: /\b(?:text|leading|tracking)-\[[^\]]+\]/g, message: 'Use um text style nomeado.' },
  { code: 'LEG003', rule: 'forbidden-radius', pattern: /\brounded-(?:xl|2xl|3xl|full)\b/g, message: 'Use radius compact, control, surface ou exceção round registrada.' },
  { code: 'LEG004', rule: 'legacy-font-weight', pattern: /\bfont-(?:black|extrabold)\b/g, message: 'Use peso 400, 500, 600 ou 700 previsto no text style.' },
  { code: 'LEG005', rule: 'legacy-depth-motion', pattern: /\b(?:transition-all|shadow-(?!floating|overlay|none)[\w-]+)\b/g, message: 'Use motion ou elevação autorizada pela recipe.' },
  { code: 'LEG006', rule: 'out-of-scope-breakpoint', pattern: /\b(?:sm|md):[\w\[\]-]+/g, message: 'Remova comportamento mobile/tablet; o produto começa em 1024px.' },
  { code: 'LEG007', rule: 'local-visual-literal', pattern: /#[0-9a-fA-F]{3,8}\b/g, message: 'Mova o literal visual para a camada reference de tokens.css.' },
  { code: 'LEG008', rule: 'legacy-alias', pattern: /\b(?:color-bg-app|color-surface-card|color-border-clean|warmSurface)\b/g, message: 'Use o alias semantic/system canônico.' },
  { code: 'LEG009', rule: 'direct-legacy-import', pattern: /(?:from\s+|import\s*)["']@\/design-system\/tokens["']/g, message: 'Importe somente de @/design-system.' },
  { code: 'LEG010', rule: 'legacy-font', pattern: /\b(?:Inter|Fira Code|Arial)\b/g, message: 'Use exclusivamente Plus Jakarta Sans e fallbacks de sistema.' },
];
