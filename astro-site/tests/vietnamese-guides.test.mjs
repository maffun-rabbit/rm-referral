import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { loadVietnameseGuidePages } from "../src/data/load-vietnamese-pages.ts";

const pages = loadVietnameseGuidePages();
const sitemap = await readFile(new URL("../dist/vi/sitemap.xml", import.meta.url), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));

test("all 19 Vietnamese guide and topic pages have unique routes and sitemap coverage", () => {
  assert.equal(pages.length, 19);
  assert.equal(new Set(pages.map((page) => page.route)).size, pages.length);
  assert.equal(pages.filter((page) => page.route.startsWith("topics/")).length, 16);
  for (const page of pages) {
    assert.ok(sitemapUrls.has(`https://mnp-navi.jp/vi/guide/${page.route}/`), `${page.route}: missing from sitemap`);
  }
});

test("all Vietnamese guide and topic pages preserve content, links and localized SEO", async () => {
  for (const page of pages) {
    const output = new URL(`../dist/vi/guide/${page.route}/index.html`, import.meta.url);
    await access(output);
    const html = await readFile(output, "utf8");
    const canonical = `https://mnp-navi.jp/vi/guide/${page.route}/`;
    assert.match(html, /<html lang="vi">/);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `${page.route}: wrong canonical`);
    assert.doesNotMatch(html, /rm-referral(?:-vi|-en|-zh|-ko|-pt)?\.maffun\.workers\.dev/, `${page.route}: legacy Worker URL`);
    assert.match(html, /href="\/vi\/css\/style\.css"/);
    assert.match(html, /src="\/vi\/js\/analytics\.js"/);
    assert.match(html, /<main\b/);
    assert.match(html, /href="\/vi\/"/);
    for (const fallback of ["紹介キャンペーンを確認する", "オンラインで乗り換えを始める", "情報確認日："]) {
      assert.doesNotMatch(html, new RegExp(fallback), `${page.route}: Japanese UI fallback remains`);
    }
    if (page.route !== "topics") {
      assert.match(html, /href="https:\/\/r10\.to\/hNearm"/, `${page.route}: referral CTA missing`);
    }
  }
});
