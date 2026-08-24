#!/usr/bin/env node
/**
 * Timeout Runner: Executa um comando com limite estrito de tempo (padrão: 90 segundos).
 * Caso o tempo seja atingido, encerra imediatamente a árvore de processos do teste.
 *
 * Uso:
 *   node timeout-runner.mjs <segundos> "<comando>"
 */
import { spawn, execSync } from 'node:child_process';
import process from 'node:process';

const args = process.argv.slice(2);
const timeoutSec = parseInt(args[0], 10) || 90;
const rawCommand = args.slice(1).join(' ');

if (!rawCommand) {
  console.error('[timeout-runner] Nenhum comando fornecido para execução.');
  process.exit(1);
}

const timeoutMs = timeoutSec * 1000;
const isWindows = process.platform === 'win32';

console.log(`⏱️  [Codex Hook] Executando testes com limite máximo de ${timeoutSec}s...`);

// Inicia o processo do teste
const child = spawn(rawCommand, {
  shell: true,
  stdio: 'inherit',
  env: process.env,
  windowsHide: false
});

let isFinished = false;

// Função para encerrar toda a árvore de processos
function killProcessTree(pid) {
  if (!pid) return;
  try {
    if (isWindows) {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch {
    try {
      child.kill('SIGKILL');
    } catch {}
  }
}

// Timer de 90 segundos
const timer = setTimeout(() => {
  if (isFinished) return;
  isFinished = true;

  console.error(`\n❌ [Codex Hook] TEMPO LIMITE EXCEDIDO: Os testes ultrapassaram ${timeoutSec} segundos de execução.`);
  console.error(`🛑 Finalizando todos os processos de teste ativos (PID ${child.pid})...\n`);

  killProcessTree(child.pid);

  // Código de saída padrão para timeout (124)
  process.exit(124);
}, timeoutMs);

child.on('error', (err) => {
  if (isFinished) return;
  isFinished = true;
  clearTimeout(timer);
  console.error(`[timeout-runner] Erro ao iniciar processo: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (isFinished) return;
  isFinished = true;
  clearTimeout(timer);

  if (signal) {
    console.log(`[timeout-runner] Processo finalizado com sinal: ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 0);
});
