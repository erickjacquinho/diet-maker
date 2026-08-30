import { cloneFixture } from './fixture';
import { closeDatabase, openDatabase, type DatabaseHandle } from './db/client';
import { createDatabaseRepository, type DatabaseRepository } from './db/repositories';
import { createEvidenceReport, recordEvidence, reportAsJson, type EvidenceReport } from './report';
import { PocError } from './contracts';
import { SingleTabLock } from './locking/single-tab-lock';
import { prepareOfflineResources, runOfflineScenario } from './offline-scenario';

export interface HarnessController {
  initialize(): Promise<void>;
  reopen(): Promise<void>;
  getReport(): EvidenceReport | undefined;
}

let activeHandle: DatabaseHandle | undefined;
let activeRepository: DatabaseRepository | undefined;
let latestReport: EvidenceReport | undefined;

function setStatus(message: string, status: 'idle' | 'pass' | 'fail' = 'idle'): void {
  const statusElement = document.querySelector<HTMLElement>('#status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.dataset.status = status;
  }
}

function setReport(report: EvidenceReport): void {
  latestReport = report;
  const reportElement = document.querySelector<HTMLElement>('#report');
  if (reportElement) {
    reportElement.textContent = reportAsJson(report);
  }
}

async function readOrSeed(repository: DatabaseRepository): Promise<{ seeded: boolean; queryMs: number; writeMs?: number }> {
  const queryStarted = performance.now();
  try {
    await repository.readConfirmed('account-alpha');
    return { seeded: false, queryMs: performance.now() - queryStarted };
  } catch (error) {
    if (!(error instanceof PocError) || error.code !== 'SCOPE_VIOLATION') {
      throw error;
    }
  }

  const writeStarted = performance.now();
  await repository.seedFixture(cloneFixture());
  const writeMs = performance.now() - writeStarted;
  return { seeded: true, queryMs: performance.now() - queryStarted, writeMs };
}

async function initialize(): Promise<void> {
  if (activeHandle && activeRepository) {
    setStatus('Base local já inicializada nesta aba.', 'pass');
    return;
  }

  const report = createEvidenceReport('browser-persistent');
  const openingStarted = performance.now();
  try {
    const handle = await openDatabase({ mode: 'browser-persistent', lock: new SingleTabLock() });
    const repository = createDatabaseRepository(handle);
    const timings = await readOrSeed(repository);
    activeHandle = handle;
    activeRepository = repository;

    recordEvidence(report, {
      scenario: 'US1/persistence-and-reopen',
      status: 'pass',
      message: timings.seeded
        ? 'Fixture sintética gravada em armazenamento persistente.'
        : 'Fixture sintética recuperada do armazenamento persistente.',
      timings: {
        openingMs: performance.now() - openingStarted,
        queryMs: timings.queryMs,
        writeMs: timings.writeMs,
      },
    });
    setStatus('Base persistente inicializada; fixture confirmada.', 'pass');
    setReport(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida ao abrir a base local.';
    recordEvidence(report, {
      scenario: 'US1/persistence-and-reopen',
      status: error instanceof PocError && error.code === 'LOCK_UNAVAILABLE' ? 'blocked' : 'fail',
      message: error instanceof PocError ? `[${error.code}] ${message}` : message,
      limitation: 'Nenhum fallback silencioso foi utilizado.',
      timings: { openingMs: performance.now() - openingStarted },
    });
    setStatus(`Falha explícita: ${message}`, 'fail');
    setReport(report);
    throw error;
  }
}

async function reopen(): Promise<void> {
  if (!activeHandle || !activeRepository) {
    await initialize();
  }
  if (!activeHandle) {
    throw new PocError('INITIALIZATION_FAILED', 'reopen-database', 'A base local ativa não está disponível para reabertura.');
  }

  const dataDir = activeHandle.client.dataDir;
  if (!dataDir) {
    throw new PocError('PERSISTENCE_UNCONFIRMED', 'reopen-database', 'A instância atual não expõe um diretório persistente.');
  }

  await closeDatabase(activeHandle);
  activeHandle = await openDatabase({ mode: 'browser-persistent', dataDir });
  activeRepository = createDatabaseRepository(activeHandle);
  const recovered = await activeRepository.readConfirmed('account-alpha');
  setStatus(`Reabertura confirmada: ${recovered.dietPlans.length} dietas recuperadas.`, 'pass');
}

async function prepareOffline(): Promise<void> {
  prepareOfflineResources();
  setStatus('Recursos locais preparados para o cenário offline.', 'pass');
}

async function runOffline(): Promise<void> {
  const report = latestReport ?? createEvidenceReport('browser-persistent');
  try {
    if (!activeHandle || !activeRepository) {
      throw new PocError('OFFLINE_RESOURCE_NOT_READY', 'offline-scenario', 'Inicialize a fixture antes de executar o cenário offline.');
    }
    const result = await runOfflineScenario(activeHandle, activeRepository);
    activeHandle = result.nextHandle;
    activeRepository = result.nextRepository;
    recordEvidence(report, {
      scenario: 'US4/offline-after-preparation',
      status: result.roundTripPreserved ? 'pass' : 'fail',
      message: result.roundTripPreserved
        ? `Operações offline aprovadas; ${result.dietCount} dietas recuperadas após reabertura.`
        : 'A reabertura offline não preservou a amostra.',
    });
    setStatus(result.roundTripPreserved ? 'Operações offline aprovadas após preparação.' : 'Falha: amostra offline inconsistente.', result.roundTripPreserved ? 'pass' : 'fail');
    setReport(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida no cenário offline.';
    const displayedMessage = error instanceof PocError ? `[${error.code}] ${message}` : message;
    recordEvidence(report, {
      scenario: 'US4/offline-after-preparation',
      status: error instanceof PocError && error.code === 'OFFLINE_RESOURCE_NOT_READY' ? 'blocked' : 'fail',
      message: displayedMessage,
    });
    setStatus(`Falha explícita: ${displayedMessage}`, 'fail');
    setReport(report);
    throw error;
  }
}

export function mountHarness(): HarnessController {
  const root = document.querySelector<HTMLElement>('#root');
  if (!root) {
    throw new Error('Elemento #root não encontrado para montar o harness.');
  }

  root.innerHTML = `
    <h1>Prova técnica da base local</h1>
    <p id="status" data-status="idle">Harness pronto.</p>
    <div aria-label="Ações da prova técnica">
      <button id="initialize-db" type="button">Inicializar fixture</button>
      <button id="reopen-db" type="button">Fechar e reabrir</button>
      <button id="prepare-offline" type="button">Preparar recursos offline</button>
      <button id="run-offline" type="button">Executar offline</button>
    </div>
    <pre id="report" aria-label="Relatório técnico"></pre>
  `;

  document.querySelector<HTMLButtonElement>('#initialize-db')?.addEventListener('click', () => {
    void initialize().catch(() => undefined);
  });
  document.querySelector<HTMLButtonElement>('#reopen-db')?.addEventListener('click', () => {
    void reopen().catch(() => undefined);
  });
  document.querySelector<HTMLButtonElement>('#prepare-offline')?.addEventListener('click', () => {
    void prepareOffline().catch(() => undefined);
  });
  document.querySelector<HTMLButtonElement>('#run-offline')?.addEventListener('click', () => {
    void runOffline().catch(() => undefined);
  });
  window.addEventListener('pagehide', () => {
    void disposeHarness().catch(() => undefined);
  });

  return {
    initialize,
    reopen,
    getReport: () => latestReport,
  };
}

export async function disposeHarness(): Promise<void> {
  if (activeHandle) {
    await closeDatabase(activeHandle);
    activeHandle = undefined;
    activeRepository = undefined;
  }
}
