#!/usr/bin/env node
/**
 * Codex PreToolUse Hook: Intercepta comandos de teste no Bash e injeta o timeout de 90s.
 * Recebe o payload do PreToolUse via stdin.
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      return resolve('');
    }
    let data = '';
    const timer = setTimeout(() => {
      resolve(data);
    }, 800);

    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      resolve(data);
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      resolve(data);
    });
    process.stdin.resume();
  });
}

async function main() {
  const input = await readStdin();

  if (!input || !input.trim()) {
    process.exit(0);
  }

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const toolName = payload.tool_name || '';
  if (toolName !== 'Bash' && toolName !== 'run_command' && toolName !== 'exec_command') {
    process.exit(0);
  }

  const toolInput = payload.tool_input || {};
  const command = (toolInput.command || toolInput.CommandLine || '').trim();

  if (!command) {
    process.exit(0);
  }

  // Padrões de comandos que executam testes
  const testCommandPattern = /(?:^|[;&|]\s*|\b)(?:npm\s+(?:run\s+)?test(?::\w+)?|pnpm\s+(?:run\s+)?test(?::\w+)?|yarn\s+test(?::\w+)?|bun\s+test|npx\s+vitest|npx\s+jest|npx\s+playwright|vitest|jest|pytest|playwright\s+test|node\s+--test|cargo\s+test|go\s+test|dotnet\s+test)\b/i;

  // Evita re-encapsulamento se já estiver usando timeout-runner
  if (command.includes('timeout-runner.mjs') || command.includes('timeout-runner.ps1')) {
    process.exit(0);
  }

  if (testCommandPattern.test(command)) {
    const timeoutRunnerPath = path.resolve(__dirname, 'timeout-runner.mjs');
    const formattedRunnerPath = timeoutRunnerPath.replace(/\\/g, '/');

    // Substitui o comando para ser executado através do timeout-runner com 90 segundos
    const updatedCommand = `node "${formattedRunnerPath}" 90 "${command.replace(/"/g, '\\"')}"`;

    const response = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        updatedInput: {
          command: updatedCommand
        }
      }
    };

    process.stdout.write(JSON.stringify(response));
    process.exit(0);
  }

  // Saída vazia com código 0 permite que o comando original continue sem alterações
  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
