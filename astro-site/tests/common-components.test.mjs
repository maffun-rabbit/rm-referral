import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const englishHtml = await readFile(new URL("../dist/en/index.html", import.meta.url), "utf8");

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
