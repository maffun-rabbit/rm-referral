import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadTokyoShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadTokyoShopPages();

test("all 587 Tokyo shop pages are loaded with expected carrier counts", () => {
  const counts = Object.fromEntries(
    [...new Set(pages.map((page) => page.carrier))]
      .sort()
      .map((carrier) => [carrier, pages.filter((page) => page.carrier === carrier).length]),
  );
  assert.equal(pages.length, 587);
  assert.deepEqual(counts, {
    aeonmobile: 10,
    au: 148,
    docomo: 189,
    softbank: 202,
    uqmobile: 8,
    ymobile: 30,
  });
});

test("every Tokyo shop page has an Astro build output", async () => {
  await Promise.all(pages.map((page) => access(
    new URL(`../dist/tokyo/${page.carrier}/${page.slug}/index.html`, import.meta.url),
  )));
});
