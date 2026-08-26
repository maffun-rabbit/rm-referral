import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadChugokuShikokuShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadChugokuShikokuShopPages();

test("all 721 Chugoku and Shikoku shop pages are loaded with expected prefecture counts", () => {
  const counts = Object.fromEntries(
    [...new Set(pages.map((page) => page.prefectureSlug))]
      .sort()
      .map((prefecture) => [prefecture, pages.filter((page) => page.prefectureSlug === prefecture).length]),
  );
  assert.equal(pages.length, 721);
  assert.deepEqual(counts, {
    ehime: 93,
    hiroshima: 176,
    kagawa: 69,
    kochi: 52,
    okayama: 120,
    shimane: 45,
    tokushima: 49,
    tottori: 34,
    yamaguchi: 83,
  });
});

test("every Chugoku and Shikoku shop page has an Astro build output", async () => {
  await Promise.all(pages.map((page) => access(
    new URL(`../dist/${page.prefectureSlug}/${page.carrier}/${page.slug}/index.html`, import.meta.url),
  )));
});
