import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadChineseCoveragePages, loadChineseGuidePages, loadChineseShopPages } from "../src/data/load-chinese-pages.ts";

const distRoot = path.resolve(import.meta.dirname, "..", "dist", "zh");

function countHtml(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return count + countHtml(fullPath);
    return count + Number(entry.name.endsWith(".html"));
  }, 0);
}

test("Chinese loader covers every page family", () => {
  assert.equal(loadChineseShopPages().length, 6714);
  assert.equal(loadChineseCoveragePages().length, 53);
  assert.equal(loadChineseGuidePages().length, 19);
});

test("Chinese Astro output contains all 6,835 public HTML pages", () => {
  assert.ok(statSync(distRoot).isDirectory());
  assert.equal(countHtml(distRoot), 6835);
  assert.ok(existsSync(path.join(distRoot, "index.html")));
  assert.ok(existsSync(path.join(distRoot, "tokyo", "index.html")));
  assert.ok(existsSync(path.join(distRoot, "tokyo", "au", "au-shop-narimasu", "index.html")));
  assert.ok(existsSync(path.join(distRoot, "tokyo", "coverage", "hino", "index.html")));
  assert.ok(existsSync(path.join(distRoot, "guide", "foreigners", "index.html")));
});

test("representative Chinese output uses the production locale URL", () => {
  const html = readFileSync(path.join(distRoot, "tokyo", "au", "au-shop-narimasu", "index.html"), "utf8");
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /https:\/\/mnp-navi\.jp\/zh\/tokyo\/au\/au-shop-narimasu\//);
  assert.doesNotMatch(html, /rm-referral-zh\.maffun\.workers\.dev/);
  assert.match(html, /查看14,000积分优惠/);
  const prefectureHtml = readFileSync(path.join(distRoot, "tokyo", "index.html"), "utf8");
  assert.match(prefectureHtml, /没有符合条件的门店/);
});
