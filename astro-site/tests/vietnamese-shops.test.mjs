import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { loadVietnameseShopPages } from "../src/data/load-vietnamese-pages.ts";

const pages = loadVietnameseShopPages();
const sitemap = await readFile(new URL("../dist/vi/sitemap.xml", import.meta.url), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));

async function inBatches(items, size, callback) {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(callback));
  }
}

test("all 6,714 Vietnamese shop pages have unique routes and sitemap coverage", () => {
  assert.equal(pages.length, 6714);
  const routes = pages.map((page) => `${page.prefecture}/${page.carrier}/${page.slug}`);
  assert.equal(new Set(routes).size, pages.length);
  for (const route of routes) assert.ok(sitemapUrls.has(`https://mnp-navi.jp/vi/${route}/`), `${route}: missing from sitemap`);
});

test("all Vietnamese shop pages render shared components and localized SEO", async () => {
  await inBatches(pages, 32, async (page) => {
    const route = `${page.prefecture}/${page.carrier}/${page.slug}`;
    const output = new URL(`../dist/vi/${route}/index.html`, import.meta.url);
    await access(output);
    const html = await readFile(output, "utf8");
    const canonical = `https://mnp-navi.jp/vi/${route}/`;
    assert.match(html, /<html lang="vi">/);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `${route}: wrong canonical`);
    assert.doesNotMatch(html, /rm-referral(?:-vi|-en|-zh|-ko|-pt)?\.maffun\.workers\.dev/, `${route}: legacy Worker URL`);
    assert.match(html, /href="\/vi\/css\/style\.css"/);
    assert.match(html, /src="\/vi\/js\/analytics\.js"/);
    assert.match(html, /src="\/vi\/js\/shop-cta\.js"/);
    assert.equal((html.match(/data-primary-cta/g) ?? []).length, 1, `${route}: primary CTA`);
    assert.equal((html.match(/data-final-cta/g) ?? []).length, 1, `${route}: final CTA`);
    assert.equal((html.match(/data-floating-cta/g) ?? []).length, 1, `${route}: floating CTA`);
    assert.match(html, /class="official-shop-name" lang="ja"/);
    for (const fallback of ["紹介キャンペーンを確認する", "オンラインで乗り換えを始める", "情報確認日："]) {
      assert.doesNotMatch(html, new RegExp(fallback), `${route}: Japanese UI fallback remains`);
    }
  });
});
