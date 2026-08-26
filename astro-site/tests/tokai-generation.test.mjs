import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadTokaiShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadTokaiShopPages();

test("all 918 Tokai shop pages are loaded with expected prefecture counts", () => {
  const counts = Object.fromEntries(
    [...new Set(pages.map((page) => page.prefectureSlug))]
      .sort()
      .map((prefecture) => [prefecture, pages.filter((page) => page.prefectureSlug === prefecture).length]),
  );
  assert.equal(pages.length, 918);
  assert.deepEqual(counts, {
    aichi: 481,
    gifu: 125,
    mie: 113,
    shizuoka: 199,
  });
});

test("every Tokai shop page has an Astro build output", async () => {
  await Promise.all(pages.map((page) => access(
    new URL(`../dist/${page.prefectureSlug}/${page.carrier}/${page.slug}/index.html`, import.meta.url),
  )));
});
