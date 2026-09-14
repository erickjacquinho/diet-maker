import type { PocMode, ReportEntry, TimingSample } from './contracts';

export interface EvidenceReport {
  feature: string;
  generatedAt: string;
  mode: PocMode;
  runtime: string;
  browser?: string;
  viewport?: { width: number; height: number };
  entries: ReportEntry[];
}

export function createEvidenceReport(mode: PocMode): EvidenceReport {
  const browser = typeof navigator === 'undefined' ? undefined : navigator.userAgent;
  const viewport = typeof window === 'undefined'
    ? undefined
    : { width: window.innerWidth, height: window.innerHeight };

  return {
    feature: '30-08-26-prova-tecnica-base-local',
    generatedAt: new Date().toISOString(),
    mode,
    runtime: typeof process === 'undefined' ? 'browser' : `node-${process.version}`,
    browser,
    viewport,
    entries: [],
  };
}

export function recordEvidence(
  report: EvidenceReport,
  entry: ReportEntry,
): EvidenceReport {
  report.entries.push({ ...entry });
  return report;
}

export function recordTiming(startedAt: number): TimingSample {
  return { openingMs: Math.round((performance.now() - startedAt) * 100) / 100 };
}

export function reportAsJson(report: EvidenceReport): string {
  return JSON.stringify(report, null, 2);
}

export function reportAsMarkdown(report: EvidenceReport): string {
  const lines = [
    '# PoC report — base local',
    '',
    `- Feature: \`${report.feature}\``,
    `- Generated at: \`${report.generatedAt}\``,
    `- Mode: \`${report.mode}\``,
    `- Runtime: \`${report.runtime}\``,
  ];

  if (report.browser) {
    lines.push(`- Browser: \`${report.browser}\``);
  }

  if (report.viewport) {
    lines.push(`- Viewport: \`${report.viewport.width}x${report.viewport.height}\``);
  }

  lines.push('', '## Scenarios', '', '| Scenario | Status | Message | Limitation | Timings |', '| --- | --- | --- | --- | --- |');
  for (const entry of report.entries) {
    const timings = entry.timings ? JSON.stringify(entry.timings) : '—';
    lines.push(`| ${entry.scenario} | ${entry.status} | ${entry.message} | ${entry.limitation ?? '—'} | ${timings} |`);
  }

  return `${lines.join('\n')}\n`;
}
