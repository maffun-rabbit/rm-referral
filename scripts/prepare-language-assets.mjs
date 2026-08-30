import { cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireLanguage } from "./language-config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const locale = process.argv[2];
const { pathPrefix } = requireLanguage(locale);

if (locale === "ja") {
  throw new Error("Japanese assets use scripts/prepare-japanese-assets.mjs because they require the legacy overlay.");
}

const source = path.join(root, locale);
const output = path.join(root, ".deploy", locale);
const temporaryOutput = path.join(root, ".deploy", `.${locale}.tmp`);
const temporaryPublicRoot = path.join(temporaryOutput, pathPrefix);
const astroOverlay = path.join(root, "astro-site", "dist", pathPrefix);
const productionOrigins = new Map([
  ["https://rm-referral-vi.maffun.workers.dev", "https://mnp-navi.jp/vi"],
  ["https://rm-referral-en.maffun.workers.dev", "https://mnp-navi.jp/en"],
  ["https://rm-referral-zh.maffun.workers.dev", "https://mnp-navi.jp/zh"],
  ["https://rm-referral-ko.maffun.workers.dev", "https://mnp-navi.jp/ko"],
  ["https://rm-referral-pt.maffun.workers.dev", "https://mnp-navi.jp/pt"],
  ["https://rm-referral.maffun.workers.dev", "https://mnp-navi.jp"],
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

async function rewriteLegacyOrigins(directory) {
  const textExtensions = new Set([".html", ".xml", ".txt", ".js", ".json"]);
  for (const file of await walk(directory)) {
    if (!textExtensions.has(path.extname(file))) continue;
    const original = await readFile(file, "utf8");
    let rewritten = original;
    for (const [legacy, production] of productionOrigins) rewritten = rewritten.replaceAll(legacy, production);
    if (rewritten !== original) await writeFile(file, rewritten, "utf8");
  }
}

await stat(source);
await rm(temporaryOutput, { recursive: true, force: true });
await mkdir(temporaryOutput, { recursive: true });
await cp(source, temporaryPublicRoot, { recursive: true });
for (const sharedDirectory of ["css", "js"]) {
  await rm(path.join(temporaryPublicRoot, sharedDirectory), { recursive: true, force: true });
  await cp(path.join(root, sharedDirectory), path.join(temporaryPublicRoot, sharedDirectory), { recursive: true });
}

let astroOverlayApplied = false;
try {
  const entries = await readdir(astroOverlay);
  if (entries.length) {
    await cp(astroOverlay, temporaryPublicRoot, { recursive: true, force: true });
    astroOverlayApplied = true;
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await rewriteLegacyOrigins(temporaryOutput);

await rm(output, { recursive: true, force: true });
await rename(temporaryOutput, output);

console.log(JSON.stringify({ locale, output, publicRoot: path.join(output, pathPrefix), astroOverlayApplied, legacyWorkerUrlsRewritten: true }, null, 2));
