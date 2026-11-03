// Regenerates data/index.json. Usage: node scripts/build-index.mjs (Node 18+, no dependencies).
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const DAY_FILE = /^(\d+)\.\s*(.+)\.csv$/i;

mkdirSync(ROOT, { recursive: true });

const trips = readdirSync(ROOT)
  .filter((name) => statSync(join(ROOT, name)).isDirectory())
  .sort((a, b) => a.localeCompare(b, "pl"))
  .map((id) => {
    const days = readdirSync(join(ROOT, id))
      .filter((file) => file.toLowerCase().endsWith(".csv"))
      .map((file) => {
        const match = file.match(DAY_FILE);
        return {
          order: match ? Number(match[1]) : null,
          title: match ? match[2] : file.replace(/\.csv$/i, ""),
          file: `${id}/${file}`,
        };
      })
      .sort(
        (a, b) =>
          (a.order ?? Infinity) - (b.order ?? Infinity) ||
          a.title.localeCompare(b.title, "pl"),
      );
    return { id, name: id, days };
  });

const index = { version: 1, generated: new Date().toISOString(), trips };
writeFileSync(join(ROOT, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.info(`data/index.json: ${trips.length} trips, ${trips.flatMap((t) => t.days).length} days`);
