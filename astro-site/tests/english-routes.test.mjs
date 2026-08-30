import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadEnglishCoveragePages, loadEnglishGuidePages, loadEnglishShopPages } from "../src/data/load-english-pages.ts";

const distRoot = path.resolve(import.meta.dirname, "..", "dist", "en");

function countHtml(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return count + countHtml(fullPath);
    return count + Number(entry.name.endsWith(".html"));
  }, 0);
}

test("English loader covers every page family", () => {
  assert.equal(loadEnglishShopPages().length, 6714);
  assert.equal(loadEnglishCoveragePages().length, 53);
  assert.equal(loadEnglishGuidePages().length, 19);
});

test("English Astro output contains all 6,835 public HTML pages", () => {
  assert.ok(statSync(distRoot).isDirectory());
  assert.equal(countHtml(distRoot), 6835);
  assert.ok(existsSync(path.join(distRoot, "index.html")));
  assert.ok(existsSync(path.join(distRoot, "tokyo", "index.html")));
  assert.ok(existsSync(path.join(distRoot, "tokyo", "au", "au-shop-narimasu", "index.html")));
  assert.ok(existsSync(path.join(distRoot, "tokyo", "coverage", "hino", "index.html")));
  assert.ok(existsSync(path.join(distRoot, "guide", "foreigners", "index.html")));
});

test("representative English output uses the production locale URL", () => {
  const html = readFileSync(path.join(distRoot, "tokyo", "au", "au-shop-narimasu", "index.html"), "utf8");
  assert.match(html, /<html lang="en">/);
  assert.match(html, /https:\/\/mnp-navi\.jp\/en\/tokyo\/au\/au-shop-narimasu\//);
  assert.doesNotMatch(html, /rm-referral-en\.maffun\.workers\.dev/);
  assert.match(html, /Check the 14,000-point offer/);
});
