import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadKantoShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadKantoShopPages();

test("all 1,792 Kanto shop pages are loaded with expected prefecture counts", () => {
  const counts = Object.fromEntries(
    [...new Set(pages.map((page) => page.prefectureSlug))]
      .sort()
      .map((prefecture) => [prefecture, pages.filter((page) => page.prefectureSlug === prefecture).length]),
  );
  assert.equal(pages.length, 1792);
  assert.deepEqual(counts, {
    chiba: 264,
    gunma: 89,
    ibaraki: 131,
    kanagawa: 341,
    saitama: 294,
    tochigi: 86,
    tokyo: 587,
  });
});

test("every Kanto shop page has an Astro build output", async () => {
  await Promise.all(pages.map((page) => access(
    new URL(`../dist/${page.prefectureSlug}/${page.carrier}/${page.slug}/index.html`, import.meta.url),
  )));
});
