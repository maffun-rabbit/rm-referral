import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { requireLanguage, supportedLanguages } from "./language-config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const locale = process.argv[2];
const { pathPrefix, worker, config } = requireLanguage(locale);
const output = path.join(root, ".deploy", locale);
const publicRoot = locale === "ja" ? output : path.join(output, pathPrefix);
const errors = [];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

await access(path.join(publicRoot, "index.html"));
const files = await walk(output);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
if (!htmlFiles.length) errors.push("no HTML files were packaged");

if (locale !== "ja") {
  const sourceRoot = path.join(root, locale);
  const sourceFiles = await walk(sourceRoot);
  const packagedRelativeFiles = new Set(files.map((file) => path.relative(publicRoot, file)));
  const missingSourceFiles = sourceFiles
    .map((file) => path.relative(sourceRoot, file))
    .filter((relative) => !packagedRelativeFiles.has(relative));
  if (missingSourceFiles.length) {
    errors.push(`artifact is missing ${missingSourceFiles.length} source file(s), including: ${missingSourceFiles.slice(0, 3).join(", ")}`);
  }
  const topLevel = await readdir(output);
  if (topLevel.length !== 1 || topLevel[0] !== pathPrefix) {
    errors.push(`foreign artifact root must contain only /${pathPrefix}/`);
  }
  for (const otherLocale of supportedLanguages.filter((item) => item !== locale && item !== "ja")) {
    if (files.some((file) => file.includes(`${path.sep}${otherLocale}${path.sep}`))) {
      errors.push(`artifact contains another locale: ${otherLocale}`);
    }
  }
}

const wrangler = await readFile(path.join(root, config), "utf8");
if (!wrangler.includes(`"name": "${worker}"`)) errors.push(`${config} has the wrong Worker name`);
if (!wrangler.includes(`"directory": ".deploy/${locale}"`)) errors.push(`${config} has the wrong asset directory`);

const result = {
  passed: errors.length === 0,
  locale,
  worker,
  config,
  publicPath: locale === "ja" ? "/" : `/${pathPrefix}/`,
  files: files.length,
  htmlFiles: htmlFiles.length,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
