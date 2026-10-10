const { spawnSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

function verify(markdown) {
  const root = mkdtempSync(path.join(tmpdir(), 'nutridiet-links-'));
  try {
    mkdirSync(path.join(root, 'scripts'));
    copyFileSync(path.resolve('scripts/verify-links.js'), path.join(root, 'scripts/verify-links.js'));
    writeFileSync(path.join(root, 'existing.md'), '# Existing');
    writeFileSync(path.join(root, 'README.md'), markdown);
    return spawnSync(process.execPath, [path.join(root, 'scripts/verify-links.js')], { encoding: 'utf8' });
  } finally {
    if (!root.startsWith(path.join(tmpdir(), 'nutridiet-links-'))) throw new Error('Unexpected fixture directory');
    rmSync(root, { recursive: true, force: true });
  }
}

describe('documentation link verifier', () => {
  it('accepts real links while ignoring code samples and malformed quoted destinations', () => {
    const result = verify('[Valid](existing.md)\n```\n[Placeholder](<repository-url>)\n```\n`[Inline](missing.md)`\n![Example]("onerror="alert(1))');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Zero links quebrados');
  });
  it('still rejects a missing real local destination', () => {
    const result = verify('[Broken](missing.md)');
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('missing.md');
  });
});
