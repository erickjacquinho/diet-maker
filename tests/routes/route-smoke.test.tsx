import { readdirSync } from 'node:fs';
import { describe, expect, it } from "vitest";
import { routeAcceptanceMatrix } from "./route-acceptance-matrix";

const normalize = (file: string) => file.replaceAll('\\', '/');

function inventoryIssues(actualFiles: string[], listedFiles: string[]) {
  const actual = new Set(actualFiles.map(normalize));
  const listed = listedFiles.map(normalize);
  return {
    missing: [...actual].filter((file) => !listed.includes(file)),
    extra: listed.filter((file) => !actual.has(file)),
    duplicates: listed.filter((file, index) => listed.indexOf(file) !== index),
  };
}

describe("page file inventory (static, not executed navigation)", () => {
  it('indexes every current App Router page exactly once', () => {
    const files = readdirSync('src/app', { recursive: true })
      .map(String).map(normalize)
      .filter((file) => file === 'page.tsx' || file.endsWith('/page.tsx'))
      .map((file) => `src/app/${file}`);
    expect(inventoryIssues(files, routeAcceptanceMatrix.map((route) => route.file)))
      .toEqual({ missing: [], extra: [], duplicates: [] });
  });

  it('rejects omissions, duplicates, extra files and renames without changing real pages', () => {
    const files = ['src/app/page.tsx', 'src/app/home/page.tsx'];
    expect(inventoryIssues(files, files.slice(1)).missing).toEqual([files[0]]);
    expect(inventoryIssues(files, [...files, files[0]]).duplicates).toEqual([files[0]]);
    expect(inventoryIssues(files, [...files, 'src/app/extra/page.tsx']).extra).toEqual(['src/app/extra/page.tsx']);
    expect(inventoryIssues(files, [files[0], 'src/app/renamed/page.tsx']))
      .toEqual({ missing: [files[1]], extra: ['src/app/renamed/page.tsx'], duplicates: [] });
    expect(inventoryIssues(files, files.map((file) => file.replaceAll('/', '\\'))))
      .toEqual({ missing: [], extra: [], duplicates: [] });
  });
});
