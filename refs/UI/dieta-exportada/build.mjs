// Generate the standalone HTML from actual project components. No new dependencies.
import { build } from 'vite';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../..');
const tailwind = require(path.join(root, 'tailwind.config.js'));
const result = await build({
  configFile: false, root, logLevel: 'warn',
  plugins: [{ name: 'project-tsx', enforce: 'pre', transform(source, id) {
    if (!/\.tsx?$/.test(id) || id.includes('node_modules')) return;
    const ts = require('typescript');
    return { code: ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText, map: null };
  } }],
  resolve: { alias: { '@': path.join(root, 'src') } },
  css: { postcss: { plugins: [require('tailwindcss')({ ...tailwind, content: [...tailwind.content, path.join(directory, '*.tsx')] }), require('autoprefixer')()] } },
  build: { write: false, assetsInlineLimit: Infinity, lib: { entry: path.join(directory, 'reference.tsx'), formats: ['iife'], name: 'DietReference' }, minify: true },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
const javascript = outputs.filter(item => item.type === 'chunk').map(item => item.code).join('\n').replaceAll('</script', '<\\/script');
const css = outputs.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => item.source).join('\n');
if (!javascript || !css) throw new Error('Missing component bundle or CSS.');
await writeFile(path.join(directory, 'dieta-simples.html'), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NutriDiet · Referência da dieta simples</title><style>${css}</style></head><body class="bg-canvas text-text-primary font-sans antialiased"><div id="root"></div><script>${javascript}</script></body></html>`);
console.log('HTML generated from existing project components.');
