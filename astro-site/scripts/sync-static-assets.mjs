import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const astroRoot = path.resolve(import.meta.dirname, "..");
const legacyRoot = path.resolve(astroRoot, "..");

const assets = [
  {
    source: path.join(legacyRoot, "css", "style.css"),
    destination: path.join(astroRoot, "public", "css", "style.css"),
  },
  {
    source: path.join(legacyRoot, "js", "analytics.js"),
    destination: path.join(astroRoot, "public", "js", "analytics.js"),
  },
  {
    source: path.join(legacyRoot, "js", "shop-cta.js"),
    destination: path.join(astroRoot, "public", "js", "shop-cta.js"),
  },
];

for (const asset of assets) {
  await mkdir(path.dirname(asset.destination), { recursive: true });
  await copyFile(asset.source, asset.destination);
}

console.log(`Synced ${assets.length} shared static asset(s).`);
