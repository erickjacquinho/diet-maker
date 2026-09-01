import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const featureRoot = 'specs/01-09-26-biblioteca-reutilizavel';

describe('library SDD traceability', () => {
  it('keeps every specification requirement named by an implementation task', () => {
    const spec = readFileSync(featureRoot + '/spec.md', 'utf8');
    const tasks = readFileSync(featureRoot + '/tasks.md', 'utf8');
    const requirements = [...spec.matchAll(/\b(?:FR|NFR|SC)-\d{3}\b/g)].map((match) => match[0]);
    for (const requirement of new Set(requirements)) {
      expect(tasks, requirement).toContain(requirement);
    }
  });

  it('keeps all task IDs sequential and assigned exactly one skill', () => {
    const tasks = readFileSync(featureRoot + '/tasks.md', 'utf8');
    const lines = tasks.split(/\r?\n/).filter((line) => /^- \[[ X]\] T\d{3}/.test(line));
    expect(lines).toHaveLength(60);
    lines.forEach((line, index) => {
      const expectedId = 'T' + String(index + 1).padStart(3, '0');
      expect(line).toMatch(new RegExp('^- \\[[ X]\\] ' + expectedId + ' \\[skill: [^\\]]+\\]'));
      expect(line.match(/\[skill: [^\]]+\]/g)).toHaveLength(1);
    });
  });
});
