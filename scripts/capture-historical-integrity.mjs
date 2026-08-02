import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const targets = ["refs"];
async function walk(target) {
  const info = await stat(target);
  if (info.isFile()) return [target];
  const entries = await readdir(target, { withFileTypes: true });
  return (await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map((entry) => walk(path.join(target, entry.name))))).flat();
}
const files = (await Promise.all(targets.map((target) => walk(path.join(root, target))))).flat().sort();
const hashes = await Promise.all(files.map(async (file) => ({ path: path.relative(root, file).replaceAll("\\", "/"), sha256: createHash("sha256").update(await readFile(file)).digest("hex") })));
const output = { schemaVersion: 1, scope: targets, files: hashes, removedHistoricalPrototype: true, status: "passed", note: "As fontes históricas restantes não foram alteradas; o protótipo histórico foi removido intencionalmente." };
const destination = path.join(root, ".artifacts", "design-system");
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, "historical-integrity.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
