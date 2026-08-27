import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputs = {
  home: new URL("../dist/vi/index.html", import.meta.url),
  tokyo: new URL("../dist/vi/tokyo/index.html", import.meta.url),
  shop: new URL("../dist/vi/tokyo/au/au-shop-narimasu/index.html", import.meta.url),
};

const pages = Object.fromEntries(await Promise.all(
  Object.entries(outputs).map(async ([key, url]) => [key, await readFile(url, "utf8")]),
));

test("Vietnamese home, Tokyo hub and representative shop use mnp-navi.jp SEO URLs", () => {
  const canonicals = {
    home: "https://mnp-navi.jp/vi/",
    tokyo: "https://mnp-navi.jp/vi/tokyo/",
    shop: "https://mnp-navi.jp/vi/tokyo/au/au-shop-narimasu/",
  };
  for (const [key, html] of Object.entries(pages)) {
    assert.match(html, /<html lang="vi">/);
    assert.ok(html.includes(`<link rel="canonical" href="${canonicals[key]}">`));
    assert.doesNotMatch(html, /rm-referral(?:-vi|-en|-zh|-ko|-pt)?\.maffun\.workers\.dev/);
    for (const hreflang of ["ja-JP", "vi-VN", "en", "zh-CN", "ko-KR", "pt-BR", "x-default"]) {
      assert.ok(html.includes(`hreflang="${hreflang}"`), `${key}: missing ${hreflang}`);
    }
  }
});

test("Vietnamese pages keep assets and internal navigation below /vi/", () => {
  for (const [key, html] of Object.entries(pages)) {
    assert.match(html, /href="\/vi\/css\/style\.css"/);
    assert.match(html, /src="\/vi\/js\/analytics\.js"/);
    assert.doesNotMatch(html, /(?:href|src)="\/(?:css|js|tokyo|guide)\//, `${key}: unprefixed internal URL`);
  }
  assert.match(pages.home, /src="\/vi\/js\/home\.js"/);
  assert.match(pages.tokyo, /src="\/vi\/js\/prefecture-search\.js"/);
  assert.match(pages.shop, /src="\/vi\/js\/shop-cta\.js"/);
});

test("shared header and footer render once and representative shop uses shared CTAs", () => {
  for (const html of Object.values(pages)) {
    assert.equal((html.match(/class="site-header"/g) ?? []).length, 1);
    assert.equal((html.match(/class="site-footer"/g) ?? []).length, 1);
  }
  assert.equal((pages.shop.match(/data-primary-cta/g) ?? []).length, 1);
  assert.equal((pages.shop.match(/data-final-cta/g) ?? []).length, 1);
  assert.equal((pages.shop.match(/data-floating-cta/g) ?? []).length, 1);
  assert.match(pages.shop, /Xem ưu đãi 14\.000 điểm/);
});

test("Vietnamese UI has no known Japanese fallback while official Japanese shop names remain", () => {
  for (const fallback of [
    "通信会社で絞り込む",
    "条件に一致する店舗がありません",
    "オンラインで乗り換えを始める",
    "紹介キャンペーンを確認する",
  ]) {
    assert.doesNotMatch(pages.tokyo, new RegExp(fallback));
  }
  assert.match(pages.tokyo, /class="official-shop-name" lang="ja"/);
  assert.match(pages.shop, /class="official-shop-name" lang="ja"/);
});
