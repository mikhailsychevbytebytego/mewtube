import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fuzzyClipScores, releaseClipScratch } from "./cat-clip";

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("Pass the screenshot directory.");

  const names = (await readdir(dir)).sort();
  const samples: Buffer[] = [];
  const references: Buffer[] = [];
  for (const name of names) {
    const bytes = await readFile(join(dir, name));
    if (name.startsWith("sample-")) samples.push(bytes);
    if (name.startsWith("ref-")) references.push(bytes);
  }
  const other = await readFile(join(dir, "other.png"));
  const scores = await fuzzyClipScores(samples, references, other);
  await writeFile(join(dir, "scores.json"), JSON.stringify(scores));
  await releaseClipScratch();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
