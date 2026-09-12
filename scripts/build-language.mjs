import { spawnSync } from "node:child_process";
import path from "node:path";
import { requireLanguage } from "./language-config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const locale = process.argv[2];
requireLanguage(locale);

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (locale === "ja") {
  // Cloudflare's build environment installs dependencies only from the
  // repository root. The Astro package lives in a nested directory, so
  // install its lockfile explicitly before running the test/build pipeline.
  run("npm", ["--prefix", "astro-site", "ci", "--ignore-scripts"]);
  run("npm", ["--prefix", "astro-site", "test"]);
  run("node", ["scripts/prepare-japanese-assets.mjs"]);
  run("node", ["scripts/validate-japanese-overlay.mjs"]);
} else {
  run("node", ["scripts/prepare-language-assets.mjs", locale]);
}
run("node", ["scripts/validate-language-assets.mjs", locale]);
