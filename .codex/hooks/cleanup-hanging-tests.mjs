#!/usr/bin/env node
/**
 * Codex Stop / SessionEnd Hook: Finaliza processos de teste pendentes ou orfãos.
 */
import { execSync } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';

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

  let payload = {};
  if (input && input.trim()) {
    try {
      payload = JSON.parse(input);
    } catch {}
  }

  const eventName = payload.hook_event_name || 'Stop';
  let killedCount = 0;

  if (isWindows) {
    try {
      const psScript = `
        $ErrorActionPreference = 'SilentlyContinue'
        $targetPatterns = 'vitest|jest|pytest|playwright|chromedriver|geckodriver'
        $procs = Get-CimInstance Win32_Process | Where-Object {
          ($_.Name -match $targetPatterns -or $_.CommandLine -match $targetPatterns) -and
          $_.ProcessId -ne $PID -and
          $_.ProcessId -ne ${process.pid}
        }
        $count = 0
        foreach ($p in $procs) {
          try {
            Stop-Process -Id $p.ProcessId -Force
            $count++
          } catch {}
        }
        Write-Output $count
      `;
      const output = execSync(`powershell.exe -NoProfile -NonInteractive -Command "${psScript.replace(/\n/g, ' ')}"`, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();
      killedCount = parseInt(output, 10) || 0;
    } catch {}
  } else {
    try {
      execSync('pkill -f "vitest|jest|pytest|playwright" || true', { stdio: 'ignore' });
    } catch {}
  }

  const response = {
    continue: true
  };

  if (killedCount > 0) {
    response.systemMessage = `[Hook Cleanup - ${eventName}] Finalizados ${killedCount} processo(s) de teste pendentes.`;
  }

  process.stdout.write(JSON.stringify(response));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
});
