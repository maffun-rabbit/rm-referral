import { cp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const hosts = {
  ja: "https://mnp-navi.jp",
  en: "https://mnp-navi.jp/en",
  zh: "https://mnp-navi.jp/zh",
  ko: "https://mnp-navi.jp/ko",
  vi: "https://mnp-navi.jp/vi",
  pt: "https://mnp-navi.jp/pt",
};
const languageCodes = Object.keys(hosts).filter((language) => language !== "ja");

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function rewriteUrls(html) {
  let output = html;
  for (const language of languageCodes) {
    output = output.replaceAll(`${hosts.ja}/${language}/`, `${hosts[language]}/`);
    output = output.replaceAll(`\"/${language}/`, `\"${hosts[language]}/`);
  }
  output = output.replace(/href="\/(?:[a-z-]+)\/coverage\//g, (match) => `href="${hosts.ja}${match.slice(6)}`);
  output = output.replaceAll('href="/guide/replacement-program/', `href="${hosts.ja}/guide/replacement-program/`);
  output = output.replace(/(<option value=")\/(?!en\/|zh\/|ko\/|vi\/|pt\/)([^\"]*">🇯🇵 日本語<\/option>)/g, `$1${hosts.ja}/$2`);
  return output;
}

for (const directory of [root, ...languageCodes.map((language) => path.join(root, language))]) {
  for (const file of await walk(directory)) {
    if (!file.endsWith(".html")) continue;
    if (directory === root && languageCodes.includes(path.relative(root, file).split(path.sep)[0])) continue;
    const original = await readFile(file, "utf8");
    const rewritten = rewriteUrls(original);
    if (rewritten !== original) await writeFile(file, rewritten, "utf8");
  }
}

for (const language of languageCodes) {
  for (const sharedDirectory of ["css", "js"]) {
    const destination = path.join(root, language, sharedDirectory);
    await rm(destination, { recursive: true, force: true });
    await cp(path.join(root, sharedDirectory), destination, { recursive: true });
  }
}

console.log("Rewrote multilingual URLs and copied shared assets for language Workers.");
