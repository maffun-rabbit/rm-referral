import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const homePath = path.join(root, "index.html");
let home = await readFile(homePath, "utf8");
const hrefs = [...home.matchAll(/href="\/([a-z-]+)\/"/g)].map((match) => match[1]);
for (const slug of new Set(hrefs)) {
  const areaHtml = await readFile(path.join(root, slug, "index.html"), "utf8");
  const count = areaHtml.match(/<div class="count-row"><div><strong>(\d+)<\/strong>/)?.[1];
  if (!count) throw new Error(`Shop count missing for ${slug}`);
  const pattern = new RegExp(`(href="/${slug}/"><span><b>[^<]+</b><small>)\\d+(店舗</small>)`);
  if (!pattern.test(home)) throw new Error(`Homepage link missing for ${slug}`);
  home = home.replace(pattern, `$1${count}$2`);
}
await writeFile(homePath, home);
console.log(`Updated homepage counts for ${new Set(hrefs).size} prefectures.`);
