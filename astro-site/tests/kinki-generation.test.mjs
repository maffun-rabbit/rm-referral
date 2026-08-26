import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadKinkiShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadKinkiShopPages();

test("all 1,110 Kinki shop pages are loaded with expected prefecture counts", () => {
  const counts = Object.fromEntries(
    [...new Set(pages.map((page) => page.prefectureSlug))]
      .sort()
      .map((prefecture) => [prefecture, pages.filter((page) => page.prefectureSlug === prefecture).length]),
  );
  assert.equal(pages.length, 1110);
  assert.deepEqual(counts, {
    hyogo: 301,
    kyoto: 135,
    nara: 74,
    osaka: 467,
    shiga: 75,
    wakayama: 58,
  });
});

test("every Kinki shop page has an Astro build output", async () => {
  await Promise.all(pages.map((page) => access(
    new URL(`../dist/${page.prefectureSlug}/${page.carrier}/${page.slug}/index.html`, import.meta.url),
  )));
});
