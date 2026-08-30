import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const englishHtml = await readFile(new URL("../dist/en/index.html", import.meta.url), "utf8");
const englishTopicHtml = await readFile(
  new URL("../dist/en/guide/topics/why-rakuten-mobile-for-foreigners-japan/index.html", import.meta.url),
  "utf8",
);

test("common layout renders one header and footer", () => {
  assert.equal((html.match(/class="site-header"/g) ?? []).length, 1);
  assert.equal((html.match(/class="site-footer"/g) ?? []).length, 1);
});

test("shared header renders all production language routes", () => {
  const languageSelector = englishHtml.match(/<select class="lang-selector"[\s\S]*?<\/select>/)?.[0] ?? "";
  assert.equal((languageSelector.match(/<option\b/g) ?? []).length, 6);
  for (const value of ["/", "/vi/", "/en/", "/zh/", "/ko/", "/pt/"]) {
    assert.match(languageSelector, new RegExp(`<option value="${value.replaceAll("/", "\\/")}"`));
  }
  assert.doesNotMatch(languageSelector, /\.maffun\.workers\.dev/);
});

test("foreign-language topics only switch to topic routes that exist", () => {
  const languageSelector = englishTopicHtml.match(/<select class="lang-selector"[\s\S]*?<\/select>/)?.[0] ?? "";
  assert.equal((languageSelector.match(/<option\b/g) ?? []).length, 5);
  for (const locale of ["vi", "en", "zh", "ko", "pt"]) {
    assert.match(languageSelector, new RegExp(`<option value="\\/${locale}\\/guide\\/topics\\/why-rakuten-mobile-for-foreigners-japan\\/"`));
  }
  assert.doesNotMatch(languageSelector, /<option value="\/guide\/topics\//);
  assert.doesNotMatch(englishTopicHtml, /hreflang="ja-JP"|hreflang="x-default"|\.maffun\.workers\.dev/);
});

test("Rakuten ID visual guide is published in all five foreign languages", async () => {
  for (const locale of ["vi", "en", "zh", "ko", "pt"]) {
    const guide = await readFile(new URL(`../dist/${locale}/guide/topics/create-rakuten-id-step-by-step/index.html`, import.meta.url), "utf8");
    assert.match(guide, new RegExp(`https://mnp-navi\\.jp/${locale}/guide/topics/create-rakuten-id-step-by-step/`));
    assert.equal((guide.match(/images\/guides\/rakuten-id\//g) ?? []).length, 6);
    assert.match(guide, /https:\/\/grp01\.id\.rakuten\.co\.jp\/rms\/nid\/registfwd\?service_id=top/);
    assert.match(guide, /target="_blank" rel="noopener"/);
    assert.doesNotMatch(guide, /\.maffun\.workers\.dev/);
    const sitemap = await readFile(new URL(`../dist/${locale}/sitemap.xml`, import.meta.url), "utf8");
    assert.match(sitemap, new RegExp(`https://mnp-navi\\.jp/${locale}/guide/topics/create-rakuten-id-step-by-step/`));
  }
});

test("all shared CTA variants are present", () => {
  assert.match(html, /data-primary-cta/);
  assert.match(html, /data-final-cta/);
  assert.match(html, /data-floating-cta/);
});

test("campaign settings use the shared referral URL and Japanese copy", () => {
  assert.equal((html.match(/https:\/\/r10\.to\/hNearm/g) ?? []).length, 3);
  assert.match(html, /14,000ポイント/);
  assert.match(html, /楽天従業員紹介キャンペーン/);
});

test("migration-only page cannot be indexed", () => {
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});
