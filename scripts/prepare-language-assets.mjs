import { cp, mkdir, readdir, rename, rm, stat } from "node:fs/promises";
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

await stat(source);
await rm(temporaryOutput, { recursive: true, force: true });
await mkdir(temporaryOutput, { recursive: true });
await cp(source, temporaryPublicRoot, { recursive: true });

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

await rm(output, { recursive: true, force: true });
await rename(temporaryOutput, output);

console.log(JSON.stringify({ locale, output, publicRoot: path.join(output, pathPrefix), astroOverlayApplied }, null, 2));
