import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadHokurikuKoshinetsuShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadHokurikuKoshinetsuShopPages();

test("all 427 Hokuriku and Koshinetsu shop pages are loaded with expected prefecture counts", () => {
  const counts = Object.fromEntries(
    [...new Set(pages.map((page) => page.prefectureSlug))]
      .sort()
      .map((prefecture) => [prefecture, pages.filter((page) => page.prefectureSlug === prefecture).length]),
  );
  assert.equal(pages.length, 427);
  assert.deepEqual(counts, {
    fukui: 45,
    ishikawa: 76,
    nagano: 95,
    niigata: 104,
    toyama: 58,
    yamanashi: 49,
  });
});

test("every Hokuriku and Koshinetsu shop page has an Astro build output", async () => {
  await Promise.all(pages.map((page) => access(
    new URL(`../dist/${page.prefectureSlug}/${page.carrier}/${page.slug}/index.html`, import.meta.url),
  )));
});
