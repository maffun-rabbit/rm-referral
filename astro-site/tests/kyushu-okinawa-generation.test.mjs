import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadKyushuOkinawaShopPages } from "../src/data/load-tokyo-shop-pages.ts";

const pages = loadKyushuOkinawaShopPages();

test("all 914 Kyushu and Okinawa shop pages are loaded with expected prefecture counts", () => {
  assert.equal(pages.length, 914);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(Object.groupBy(pages, (page) => page.prefectureSlug))
        .map(([prefecture, entries]) => [prefecture, entries.length]),
    ),
    {
      fukuoka: 322,
      saga: 47,
      nagasaki: 86,
      kumamoto: 96,
      oita: 71,
      miyazaki: 68,
      kagoshima: 93,
      okinawa: 131,
    },
  );
});

test("every Kyushu and Okinawa shop page has an Astro build output", async () => {
  await Promise.all(
    pages.map((page) => access(new URL(`../dist/${page.prefectureSlug}/${page.carrier}/${page.slug}/index.html`, import.meta.url))),
  );
});
