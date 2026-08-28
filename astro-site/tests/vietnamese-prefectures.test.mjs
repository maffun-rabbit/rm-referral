import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { vietnamesePrefectureSlugs } from "../src/data/load-vietnamese-pages.ts";

test("all 47 Vietnamese prefecture hubs are generated with localized SEO and assets", async () => {
  assert.equal(vietnamesePrefectureSlugs.length, 47);
  for (const prefecture of vietnamesePrefectureSlugs) {
    const output = new URL(`../dist/vi/${prefecture}/index.html`, import.meta.url);
    await access(output);
    const html = await readFile(output, "utf8");
    assert.match(html, /<html lang="vi">/);
    assert.ok(html.includes(`<link rel="canonical" href="https://mnp-navi.jp/vi/${prefecture}/">`));
    assert.match(html, /href="\/vi\/css\/style\.css"/);
    assert.match(html, /src="\/vi\/js\/analytics\.js"/);
    assert.match(html, /src="\/vi\/js\/prefecture-search\.js"/);
    assert.doesNotMatch(html, /rm-referral(?:-vi|-en|-zh|-ko|-pt)?\.maffun\.workers\.dev/);
    assert.doesNotMatch(html, /(?:href|src)="\/(?!vi\/)(?:css|js|guide|[a-z]+\/)/, `${prefecture}: unprefixed internal URL`);
    for (const fallback of ["通信会社で絞り込む", "条件に一致する店舗がありません", "オンラインで乗り換えを始める", "紹介キャンペーンを確認する"]) {
      assert.doesNotMatch(html, new RegExp(fallback), `${prefecture}: Japanese UI fallback remains`);
    }
    assert.match(html, /class="official-shop-name" lang="ja"/);
  }
});

test("Vietnamese sitemap and robots use only the new canonical origin", async () => {
  const [sitemap, robots] = await Promise.all([
    readFile(new URL("../dist/vi/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../dist/vi/robots.txt", import.meta.url), "utf8"),
  ]);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, 6834);
  assert.ok(urls.every((url) => url.startsWith("https://mnp-navi.jp/vi/")));
  assert.equal(new Set(urls).size, urls.length);
  for (const prefecture of vietnamesePrefectureSlugs) {
    assert.ok(urls.includes(`https://mnp-navi.jp/vi/${prefecture}/`), `${prefecture}: missing from sitemap`);
  }
  assert.doesNotMatch(sitemap, /workers\.dev/);
  assert.match(robots, /Sitemap: https:\/\/mnp-navi\.jp\/vi\/sitemap\.xml/);
  assert.doesNotMatch(robots, /workers\.dev/);
});
