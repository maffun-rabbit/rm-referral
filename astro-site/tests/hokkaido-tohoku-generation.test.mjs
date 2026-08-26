import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadHokkaidoTohokuShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadHokkaidoTohokuShopPages();

test("all 832 Hokkaido and Tohoku shop pages are loaded with expected prefecture counts", () => {
  const counts = Object.fromEntries(
    [...new Set(pages.map((page) => page.prefectureSlug))]
      .sort()
      .map((prefecture) => [prefecture, pages.filter((page) => page.prefectureSlug === prefecture).length]),
  );
  assert.equal(pages.length, 832);
  assert.deepEqual(counts, {
    akita: 48,
    aomori: 64,
    fukushima: 104,
    hokkaido: 344,
    iwate: 66,
    miyagi: 141,
    yamagata: 65,
  });
});

test("every Hokkaido and Tohoku shop page has an Astro build output", async () => {
  await Promise.all(pages.map((page) => access(
    new URL(`../dist/${page.prefectureSlug}/${page.carrier}/${page.slug}/index.html`, import.meta.url),
  )));
});
