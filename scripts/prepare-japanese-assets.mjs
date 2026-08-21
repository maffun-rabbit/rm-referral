import { cp, readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".deploy", "ja");
const excluded = new Set([
  ".git", ".deploy", "scripts", "data", "en", "zh", "ko", "vi", "pt",
  "DESIGN_GUIDELINES.md", "wrangler.jsonc", "wrangler.en.jsonc", "wrangler.zh.jsonc",
  "wrangler.ko.jsonc", "wrangler.vi.jsonc", "wrangler.pt.jsonc",
]);

await rm(output, { recursive: true, force: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  await cp(path.join(root, entry.name), path.join(output, entry.name), { recursive: true });
}
console.log("Prepared the Japanese Worker asset directory.");
