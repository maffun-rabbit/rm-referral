import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const astroRoot = path.resolve(scriptDir, "..");
const legacyRoot = path.resolve(astroRoot, "..");

export const defaultPaths = {
  legacy: path.join(legacyRoot, "tokyo", "au", "au-shop-narimasu", "index.html"),
  generated: path.join(astroRoot, "dist", "tokyo", "au", "au-shop-narimasu", "index.html"),
};

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function textContent(fragment) {
  return decodeHtml(fragment)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(html, pattern, label) {
  const match = html.match(pattern);
  if (!match) throw new Error(`${label} was not found`);
  return decodeHtml(match[1].trim());
}

function extractMain(html) {
  return firstMatch(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i, "main");
}

function extractHeadings(main) {
  return [...main.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: textContent(match[2]),
  }));
}

function extractLinks(main) {
  return [...main.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi)]
    .map((match) => decodeHtml(match[1] ?? match[2]));
}

function extractSchemas(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
}

function extractExternalScripts(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=(?:"([^"]*)"|'([^']*)')[^>]*>/gi)]
    .map((match) => decodeHtml(match[1] ?? match[2]));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function compareHtml(legacyHtml, generatedHtml) {
  const legacyMain = extractMain(legacyHtml);
  const generatedMain = extractMain(generatedHtml);
  const checks = {
    title: firstMatch(legacyHtml, /<title>([\s\S]*?)<\/title>/i, "title") === firstMatch(generatedHtml, /<title>([\s\S]*?)<\/title>/i, "title"),
    description: firstMatch(legacyHtml, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, "description") === firstMatch(generatedHtml, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, "description"),
    canonical: firstMatch(legacyHtml, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i, "canonical") === firstMatch(generatedHtml, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i, "canonical"),
    visibleMainText: textContent(legacyMain) === textContent(generatedMain),
    headings: sameJson(extractHeadings(legacyMain), extractHeadings(generatedMain)),
    structuredData: sameJson(extractSchemas(legacyHtml), extractSchemas(generatedHtml)),
    mainLinks: sameJson(extractLinks(legacyMain), extractLinks(generatedMain)),
    externalScripts: sameJson(extractExternalScripts(legacyHtml), extractExternalScripts(generatedHtml)),
  };
  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    counts: {
      legacy: { headings: extractHeadings(legacyMain).length, links: extractLinks(legacyMain).length, schemas: extractSchemas(legacyHtml).length, externalScripts: extractExternalScripts(legacyHtml).length, visibleCharacters: textContent(legacyMain).length },
      generated: { headings: extractHeadings(generatedMain).length, links: extractLinks(generatedMain).length, schemas: extractSchemas(generatedHtml).length, externalScripts: extractExternalScripts(generatedHtml).length, visibleCharacters: textContent(generatedMain).length },
    },
  };
}

export async function compareFiles(paths = defaultPaths) {
  const [legacyHtml, generatedHtml] = await Promise.all([
    readFile(paths.legacy, "utf8"),
    readFile(paths.generated, "utf8"),
  ]);
  return compareHtml(legacyHtml, generatedHtml);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await compareFiles();
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}
